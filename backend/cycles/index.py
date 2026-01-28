import json
import os
import psycopg2
from datetime import datetime, timedelta
import jwt

def handler(event: dict, context) -> dict:
    """
    API для управления менструальными циклами:
    - Добавление/обновление цикла
    - Получение истории циклов
    - Расчет прогнозов овуляции и следующей менструации
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return cors_response()
    
    try:
        user_id = get_user_from_token(event)
        
        if method == 'GET':
            return get_cycles(user_id, event)
        elif method == 'POST':
            return create_cycle(user_id, event)
        elif method == 'PUT':
            return update_cycle(user_id, event)
        else:
            return error_response('Method not allowed', 405)
    
    except ValueError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response(str(e), 500)


def get_cycles(user_id: int, event: dict) -> dict:
    """Получает список циклов пользователя"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        limit = int(params.get('limit', 12))
        
        cur.execute("""
            SELECT id, start_date, end_date, cycle_length, period_length, notes, created_at
            FROM cycles
            WHERE user_id = %s
            ORDER BY start_date DESC
            LIMIT %s
        """, (user_id, limit))
        
        cycles = []
        for row in cur.fetchall():
            cycles.append({
                'id': row[0],
                'startDate': row[1].isoformat() if row[1] else None,
                'endDate': row[2].isoformat() if row[2] else None,
                'cycleLength': row[3],
                'periodLength': row[4],
                'notes': row[5],
                'createdAt': row[6].isoformat() if row[6] else None
            })
        
        cur.execute("""
            SELECT average_cycle_length, average_period_length
            FROM user_profiles
            WHERE user_id = %s
        """, (user_id,))
        
        profile = cur.fetchone()
        avg_cycle = profile[0] if profile else 28
        avg_period = profile[1] if profile else 5
        
        predictions = calculate_predictions(cycles, avg_cycle, avg_period)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'cycles': cycles,
                'predictions': predictions
            }),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()


def create_cycle(user_id: int, event: dict) -> dict:
    """Создает новый цикл"""
    body = json.loads(event.get('body', '{}'))
    
    start_date = body.get('startDate')
    end_date = body.get('endDate')
    notes = body.get('notes', '')
    
    if not start_date:
        return error_response('startDate is required', 400)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        cycle_length = None
        period_length = None
        
        if end_date:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            period_length = (end - start).days + 1
            
            cur.execute("""
                SELECT start_date FROM cycles
                WHERE user_id = %s AND start_date < %s
                ORDER BY start_date DESC
                LIMIT 1
            """, (user_id, start_date))
            
            prev = cur.fetchone()
            if prev:
                cycle_length = (start - prev[0]).days
        
        cur.execute("""
            INSERT INTO cycles (user_id, start_date, end_date, cycle_length, period_length, notes)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, start_date, end_date, cycle_length, period_length, notes, created_at
        """, (user_id, start_date, end_date, cycle_length, period_length, notes))
        
        row = cur.fetchone()
        conn.commit()
        
        cycle = {
            'id': row[0],
            'startDate': row[1].isoformat() if row[1] else None,
            'endDate': row[2].isoformat() if row[2] else None,
            'cycleLength': row[3],
            'periodLength': row[4],
            'notes': row[5],
            'createdAt': row[6].isoformat() if row[6] else None
        }
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(cycle),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()


def update_cycle(user_id: int, event: dict) -> dict:
    """Обновляет существующий цикл"""
    body = json.loads(event.get('body', '{}'))
    
    cycle_id = body.get('id')
    end_date = body.get('endDate')
    notes = body.get('notes')
    
    if not cycle_id:
        return error_response('Cycle id is required', 400)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        updates = []
        params = []
        
        if end_date is not None:
            cur.execute("SELECT start_date FROM cycles WHERE id = %s AND user_id = %s", (cycle_id, user_id))
            row = cur.fetchone()
            
            if row:
                start = row[0]
                end = datetime.fromisoformat(end_date).date()
                period_length = (end - start).days + 1
                
                updates.append("end_date = %s")
                params.append(end_date)
                updates.append("period_length = %s")
                params.append(period_length)
        
        if notes is not None:
            updates.append("notes = %s")
            params.append(notes)
        
        if not updates:
            return error_response('No fields to update', 400)
        
        updates.append("updated_at = NOW()")
        params.extend([cycle_id, user_id])
        
        query = f"UPDATE cycles SET {', '.join(updates)} WHERE id = %s AND user_id = %s RETURNING id, start_date, end_date, cycle_length, period_length, notes"
        
        cur.execute(query, params)
        row = cur.fetchone()
        conn.commit()
        
        if not row:
            return error_response('Cycle not found', 404)
        
        cycle = {
            'id': row[0],
            'startDate': row[1].isoformat() if row[1] else None,
            'endDate': row[2].isoformat() if row[2] else None,
            'cycleLength': row[3],
            'periodLength': row[4],
            'notes': row[5]
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(cycle),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()


def calculate_predictions(cycles: list, avg_cycle: int, avg_period: int) -> dict:
    """Рассчитывает прогнозы на основе истории циклов"""
    if not cycles or not cycles[0].get('startDate'):
        today = datetime.now().date()
        next_period = today + timedelta(days=avg_cycle)
        ovulation = next_period - timedelta(days=14)
        
        return {
            'nextPeriod': next_period.isoformat(),
            'ovulation': ovulation.isoformat(),
            'fertileWindowStart': (ovulation - timedelta(days=5)).isoformat(),
            'fertileWindowEnd': (ovulation + timedelta(days=1)).isoformat(),
            'currentPhase': 'unknown',
            'daysUntilPeriod': (next_period - today).days
        }
    
    last_start = datetime.fromisoformat(cycles[0]['startDate']).date()
    today = datetime.now().date()
    
    cycle_lengths = [c['cycleLength'] for c in cycles if c.get('cycleLength')]
    actual_avg = sum(cycle_lengths) // len(cycle_lengths) if cycle_lengths else avg_cycle
    
    next_period = last_start + timedelta(days=actual_avg)
    ovulation = next_period - timedelta(days=14)
    
    days_since_start = (today - last_start).days
    
    if days_since_start <= avg_period:
        phase = 'menstruation'
    elif days_since_start <= 13:
        phase = 'follicular'
    elif days_since_start <= 16:
        phase = 'ovulation'
    else:
        phase = 'luteal'
    
    return {
        'nextPeriod': next_period.isoformat(),
        'ovulation': ovulation.isoformat(),
        'fertileWindowStart': (ovulation - timedelta(days=5)).isoformat(),
        'fertileWindowEnd': (ovulation + timedelta(days=1)).isoformat(),
        'currentPhase': phase,
        'daysUntilPeriod': max(0, (next_period - today).days),
        'currentCycleDay': days_since_start + 1
    }


def get_user_from_token(event: dict) -> int:
    """Извлекает user_id из JWT токена"""
    auth_header = event.get('headers', {}).get('authorization') or event.get('headers', {}).get('Authorization')
    
    if not auth_header:
        raise ValueError('Authorization header required')
    
    token = auth_header.replace('Bearer ', '')
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')


def cors_response() -> dict:
    """CORS preflight ответ"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        },
        'body': '',
        'isBase64Encoded': False
    }


def error_response(message: str, status_code: int) -> dict:
    """Ответ с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
