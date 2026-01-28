import json
import os
import jwt
import psycopg2
from datetime import datetime, timedelta
from urllib.parse import urlencode, parse_qs
import urllib.request

def handler(event: dict, context) -> dict:
    """
    OAuth авторизация через Google и Yandex ID.
    Поддерживает получение ссылок для входа и обмен кода на токен.
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('requestContext', {}).get('http', {}).get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        provider = params.get('provider', 'google')
        action = params.get('action', 'login')
        
        if action == 'login':
            auth_url = get_auth_url(provider)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'authUrl': auth_url}),
                'isBase64Encoded': False
            }
        
        elif action == 'callback':
            code = params.get('code')
            if not code:
                return error_response('Missing authorization code', 400)
            
            try:
                user_data = exchange_code_for_token(code, provider)
                user = create_or_update_user(user_data, provider)
                token = generate_jwt_token(user)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'token': token,
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'name': user['name'],
                            'avatar': user['avatar_url']
                        }
                    }),
                    'isBase64Encoded': False
                }
            except Exception as e:
                return error_response(f'Authentication failed: {str(e)}', 401)
    
    elif method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            token = body.get('token')
            
            if not token:
                return error_response('Token required', 400)
            
            user_data = verify_jwt_token(token)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'user': user_data}),
                'isBase64Encoded': False
            }
        except Exception as e:
            return error_response(f'Token verification failed: {str(e)}', 401)
    
    return error_response('Method not allowed', 405)


def get_auth_url(provider: str) -> str:
    """Генерирует URL для OAuth авторизации"""
    if provider == 'google':
        client_id = os.environ.get('GOOGLE_CLIENT_ID', '')
        redirect_uri = os.environ.get('REDIRECT_URI', 'http://localhost:5173/auth/callback')
        
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline'
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    elif provider == 'yandex':
        client_id = os.environ.get('YANDEX_CLIENT_ID', '')
        redirect_uri = os.environ.get('REDIRECT_URI', 'http://localhost:5173/auth/callback')
        
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code'
        }
        return f"https://oauth.yandex.ru/authorize?{urlencode(params)}"
    
    raise ValueError(f'Unknown provider: {provider}')


def exchange_code_for_token(code: str, provider: str) -> dict:
    """Обменивает код авторизации на данные пользователя"""
    if provider == 'google':
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'code': code,
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            'redirect_uri': os.environ.get('REDIRECT_URI', 'http://localhost:5173/auth/callback'),
            'grant_type': 'authorization_code'
        }
        
        req = urllib.request.Request(
            token_url,
            data=urlencode(data).encode(),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(req) as response:
            token_data = json.loads(response.read())
        
        access_token = token_data.get('access_token')
        
        user_req = urllib.request.Request(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        with urllib.request.urlopen(user_req) as response:
            user_info = json.loads(response.read())
        
        return {
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'avatar_url': user_info.get('picture'),
            'provider_id': user_info.get('id')
        }
    
    elif provider == 'yandex':
        token_url = 'https://oauth.yandex.ru/token'
        data = {
            'code': code,
            'client_id': os.environ.get('YANDEX_CLIENT_ID'),
            'client_secret': os.environ.get('YANDEX_CLIENT_SECRET'),
            'grant_type': 'authorization_code'
        }
        
        req = urllib.request.Request(
            token_url,
            data=urlencode(data).encode(),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(req) as response:
            token_data = json.loads(response.read())
        
        access_token = token_data.get('access_token')
        
        user_req = urllib.request.Request(
            'https://login.yandex.ru/info',
            headers={'Authorization': f'OAuth {access_token}'}
        )
        
        with urllib.request.urlopen(user_req) as response:
            user_info = json.loads(response.read())
        
        return {
            'email': user_info.get('default_email'),
            'name': user_info.get('display_name'),
            'avatar_url': f"https://avatars.yandex.net/get-yapic/{user_info.get('default_avatar_id')}/islands-200" if user_info.get('default_avatar_id') else None,
            'provider_id': user_info.get('id')
        }
    
    raise ValueError(f'Unknown provider: {provider}')


def create_or_update_user(user_data: dict, provider: str) -> dict:
    """Создает или обновляет пользователя в БД"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO users (email, name, avatar_url, provider, provider_id, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (email) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                avatar_url = EXCLUDED.avatar_url,
                updated_at = NOW()
            RETURNING id, email, name, avatar_url
        """, (
            user_data['email'],
            user_data['name'],
            user_data['avatar_url'],
            provider,
            user_data['provider_id']
        ))
        
        user = cur.fetchone()
        conn.commit()
        
        cur.execute("""
            INSERT INTO user_profiles (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
        """, (user[0],))
        
        cur.execute("""
            INSERT INTO user_settings (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
        """, (user[0],))
        
        conn.commit()
        
        return {
            'id': user[0],
            'email': user[1],
            'name': user[2],
            'avatar_url': user[3]
        }
    finally:
        cur.close()
        conn.close()


def generate_jwt_token(user: dict) -> str:
    """Генерирует JWT токен для пользователя"""
    payload = {
        'user_id': user['id'],
        'email': user['email'],
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    return jwt.encode(payload, secret, algorithm='HS256')


def verify_jwt_token(token: str) -> dict:
    """Проверяет JWT токен и возвращает данные пользователя"""
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        try:
            cur.execute("""
                SELECT id, email, name, avatar_url
                FROM users
                WHERE id = %s
            """, (payload['user_id'],))
            
            user = cur.fetchone()
            
            if not user:
                raise ValueError('User not found')
            
            return {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'avatar_url': user[3]
            }
        finally:
            cur.close()
            conn.close()
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')


def error_response(message: str, status_code: int) -> dict:
    """Возвращает ответ с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
