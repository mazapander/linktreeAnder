from flask import Blueprint, request, jsonify
from app import db
from app.auth import require_auth
from app.models import Profile
from marshmallow import Schema, fields, validate, ValidationError
import supabase

users_bp = Blueprint('users', __name__, url_prefix='/users')

SUPABASE_URL = request.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = request.environ.get('SUPABASE_SERVICE_ROLE_KEY')


class UserCreateSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    name = fields.Str(required=True)


@users_bp.route('', methods=['GET'])
@require_auth
def list_users():
    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    response = client.auth.admin.list_users()
    users = []
    for user in response:
        users.append({
            'id': user.id,
            'email': user.email,
            'created_at': user.created_at,
        })
    return jsonify(users)


@users_bp.route('', methods=['POST'])
@require_auth
def create_user():
    try:
        data = UserCreateSchema().load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        response = client.auth.admin.create_user({
            'email': data['email'],
            'password': data['password'],
            'user_metadata': {'name': data['name']}
        })
        user = response.user
        return jsonify({
            'id': user.id,
            'email': user.email,
            'created_at': user.created_at,
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@users_bp.route('/<user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    data = request.json
    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    update_data = {}
    if 'email' in data:
        update_data['email'] = data['email']
    if 'password' in data:
        update_data['password'] = data['password']
    if 'name' in data:
        update_data['user_metadata'] = {'name': data['name']}

    try:
        response = client.auth.admin.update_user_by_id(user_id, update_data)
        user = response.user
        return jsonify({
            'id': user.id,
            'email': user.email,
            'created_at': user.created_at,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@users_bp.route('/<user_id>', methods=['DELETE'])
@require_auth
def delete_user(user_id):
    client = supabase.create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        client.auth.admin.delete_user(user_id)
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400