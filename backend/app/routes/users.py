import os
import uuid
import base64
from flask import Blueprint, request, jsonify
from app.auth import require_admin
import supabase

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')


@users_bp.route('', methods=['GET'])
@require_admin
def list_users():
    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    response = client.auth.admin.list_users()
    users = []
    for user in response:
        users.append({
            'id': user.id,
            'email': user.email,
            'created_at': user.created_at,
            'avatar_url': user.user_metadata.get('avatar_url') if user.user_metadata else None,
            'name': user.user_metadata.get('name') if user.user_metadata else None,
        })
    return jsonify(users)


@users_bp.route('', methods=['POST'])
@require_admin
def create_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    avatar_url = data.get('avatar_url')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        response = client.auth.admin.create_user({
            'email': email,
            'password': password,
            'user_metadata': {'name': name, 'avatar_url': avatar_url}
        })
        user = response.user
        return jsonify({
            'id': user.id,
            'email': user.email,
            'created_at': user.created_at,
            'avatar_url': user.user_metadata.get('avatar_url') if user.user_metadata else None,
            'name': user.user_metadata.get('name') if user.user_metadata else None,
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@users_bp.route('/<user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    data = request.json
    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    update_data = {}
    if 'email' in data:
        update_data['email'] = data['email']
    if 'password' in data:
        update_data['password'] = data['password']
    if 'name' in data or 'avatar_url' in data:
        update_data['user_metadata'] = {
            'name': data.get('name'),
            'avatar_url': data.get('avatar_url')
        }

    try:
        response = client.auth.admin.update_user_by_id(user_id, update_data)
        user = response.user
        return jsonify({
            'id': user.id,
            'email': user.email,
            'created_at': user.created_at,
            'avatar_url': user.user_metadata.get('avatar_url') if user.user_metadata else None,
            'name': user.user_metadata.get('name') if user.user_metadata else None,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@users_bp.route('/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        client.auth.admin.delete_user(user_id)
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@users_bp.route('/<user_id>/avatar', methods=['POST'])
@require_admin
def upload_avatar(user_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return jsonify({'error': 'File type not allowed'}), 400

    file_bytes = file.read()
    base64_image = base64.b64encode(file_bytes).decode('utf-8')
    data_url = f"data:image/{ext};base64,{base64_image}"

    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        response = client.auth.admin.update_user_by_id(user_id, {
            'user_metadata': {'avatar_url': data_url}
        })
        user = response.user
        return jsonify({
            'avatar_url': user.user_metadata.get('avatar_url') if user.user_metadata else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400