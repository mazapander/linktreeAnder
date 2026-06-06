import os
import jwt
from functools import wraps
from flask import request, jsonify

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')


def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    return auth_header[7:]


def verify_supabase_token(token):
    try:
        payload = jwt.decode(
            token,
            SUPABASE_ANON_KEY,
            algorithms=['HS256'],
            audience=SUPABASE_URL,
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        payload = verify_supabase_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.user = payload
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        payload = verify_supabase_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        email = payload.get('email', '')
        admin_emails = os.environ.get('ADMIN_EMAILS', '')
        if admin_emails:
            allowed_emails = [e.strip().lower() for e in admin_emails.split(',')]
            if email.lower() not in allowed_emails:
                return jsonify({'error': 'Unauthorized. Admin access required.'}), 403

        request.user = payload
        return f(*args, **kwargs)
    return decorated