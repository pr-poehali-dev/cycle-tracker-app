import json
import os
import psycopg2
from datetime import datetime, date
import jwt

def handler(event: dict, context) -> dict:
    """
    API для ежедневного отслеживания:
    - Настроение, боль, выделения
    - Симптомы (головная боль, судороги и т.д.)
    - Вес, сон, вода, активность, питание
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return cors_response()
    
    try:
        user_id = get_user_from_token(event)
        
        if method == 'GET':
            return get_daily_log(user_id, event)
        elif method == 'POST':
            return save_daily_log(user_id, event)
        elif method == 'PUT':
            return update_daily_log(user_id, event)
        else:
            return error_response('Method not allowed', 405)
    
    except ValueError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response(str(e), 500)


def get_daily_log(user_id: int, event: dict) -> dict:
    """Получает данные отслеживания за указанную дату или диапазон"""
    params = event.get('queryStringParameters', {}) or {}
    log_date = params.get('date', date.today().isoformat())
    range_days = int(params.get('range', 1))
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if range_days == 1:
            cur.execute("""
                SELECT log_date, mood, pain_level, flow_intensity, energy_level,
                       sleep_hours, water_glasses, exercise_minutes, calories_intake,
                       weight, temperature, notes
                FROM daily_logs
                WHERE user_id = %s AND log_date = %s
            """, (user_id, log_date))
            
            row = cur.fetchone()
            
            cur.execute("""
                SELECT symptom_type, severity, notes
                FROM symptoms
                WHERE user_id = %s AND log_date = %s
            """, (user_id, log_date))
            
            symptoms = [{'type': r[0], 'severity': r[1], 'notes': r[2]} for r in cur.fetchall()]
            
            if row:
                log = {
                    'date': row[0].isoformat(),
                    'mood': row[1],
                    'painLevel': row[2],
                    'flowIntensity': row[3],
                    'energyLevel': row[4],
                    'sleepHours': float(row[5]) if row[5] else None,
                    'waterGlasses': row[6],
                    'exerciseMinutes': row[7],
                    'caloriesIntake': row[8],
                    'weight': float(row[9]) if row[9] else None,
                    'temperature': float(row[10]) if row[10] else None,
                    'notes': row[11],
                    'symptoms': symptoms
                }
            else:
                log = {
                    'date': log_date,
                    'symptoms': symptoms
                }
            
            return json_response(log)
        else:
            cur.execute("""
                SELECT log_date, mood, pain_level, flow_intensity, energy_level,
                       sleep_hours, water_glasses, exercise_minutes, calories_intake, weight
                FROM daily_logs
                WHERE user_id = %s AND log_date >= %s::date - %s
                ORDER BY log_date DESC
            """, (user_id, log_date, range_days))
            
            logs = []
            for row in cur.fetchall():
                logs.append({
                    'date': row[0].isoformat(),
                    'mood': row[1],
                    'painLevel': row[2],
                    'flowIntensity': row[3],
                    'energyLevel': row[4],
                    'sleepHours': float(row[5]) if row[5] else None,
                    'waterGlasses': row[6],
                    'exerciseMinutes': row[7],
                    'caloriesIntake': row[8],
                    'weight': float(row[9]) if row[9] else None
                })
            
            return json_response({'logs': logs})
    finally:
        cur.close()
        conn.close()


def save_daily_log(user_id: int, event: dict) -> dict:
    """Сохраняет или обновляет данные за день"""
    body = json.loads(event.get('body', '{}'))
    
    log_date = body.get('date', date.today().isoformat())
    mood = body.get('mood')
    pain_level = body.get('painLevel')
    flow_intensity = body.get('flowIntensity')
    energy_level = body.get('energyLevel')
    sleep_hours = body.get('sleepHours')
    water_glasses = body.get('waterGlasses')
    exercise_minutes = body.get('exerciseMinutes')
    calories_intake = body.get('caloriesIntake')
    weight = body.get('weight')
    temperature = body.get('temperature')
    notes = body.get('notes', '')
    symptoms = body.get('symptoms', [])
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO daily_logs 
            (user_id, log_date, mood, pain_level, flow_intensity, energy_level,
             sleep_hours, water_glasses, exercise_minutes, calories_intake, weight, temperature, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id, log_date) 
            DO UPDATE SET
                mood = COALESCE(EXCLUDED.mood, daily_logs.mood),
                pain_level = COALESCE(EXCLUDED.pain_level, daily_logs.pain_level),
                flow_intensity = COALESCE(EXCLUDED.flow_intensity, daily_logs.flow_intensity),
                energy_level = COALESCE(EXCLUDED.energy_level, daily_logs.energy_level),
                sleep_hours = COALESCE(EXCLUDED.sleep_hours, daily_logs.sleep_hours),
                water_glasses = COALESCE(EXCLUDED.water_glasses, daily_logs.water_glasses),
                exercise_minutes = COALESCE(EXCLUDED.exercise_minutes, daily_logs.exercise_minutes),
                calories_intake = COALESCE(EXCLUDED.calories_intake, daily_logs.calories_intake),
                weight = COALESCE(EXCLUDED.weight, daily_logs.weight),
                temperature = COALESCE(EXCLUDED.temperature, daily_logs.temperature),
                notes = COALESCE(EXCLUDED.notes, daily_logs.notes),
                updated_at = NOW()
            RETURNING log_date, mood, pain_level, flow_intensity, energy_level,
                      sleep_hours, water_glasses, exercise_minutes, calories_intake, weight, temperature, notes
        """, (user_id, log_date, mood, pain_level, flow_intensity, energy_level,
              sleep_hours, water_glasses, exercise_minutes, calories_intake, weight, temperature, notes))
        
        row = cur.fetchone()
        
        if symptoms:
            cur.execute("DELETE FROM symptoms WHERE user_id = %s AND log_date = %s", (user_id, log_date))
            
            for symptom in symptoms:
                cur.execute("""
                    INSERT INTO symptoms (user_id, log_date, symptom_type, severity, notes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, log_date, symptom.get('type'), symptom.get('severity', 3), symptom.get('notes', '')))
        
        conn.commit()
        
        log = {
            'date': row[0].isoformat(),
            'mood': row[1],
            'painLevel': row[2],
            'flowIntensity': row[3],
            'energyLevel': row[4],
            'sleepHours': float(row[5]) if row[5] else None,
            'waterGlasses': row[6],
            'exerciseMinutes': row[7],
            'caloriesIntake': row[8],
            'weight': float(row[9]) if row[9] else None,
            'temperature': float(row[10]) if row[10] else None,
            'notes': row[11],
            'symptoms': symptoms
        }
        
        return json_response(log, 201)
    finally:
        cur.close()
        conn.close()


def update_daily_log(user_id: int, event: dict) -> dict:
    """Обновляет данные за день"""
    return save_daily_log(user_id, event)


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
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        },
        'body': '',
        'isBase64Encoded': False
    }


def json_response(data: dict, status: int = 200) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data),
        'isBase64Encoded': False
    }


def error_response(message: str, status_code: int) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
