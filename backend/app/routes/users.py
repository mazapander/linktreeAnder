import os
import uuid
from flask import Blueprint, request, jsonify
from app.auth import require_auth

users_bp = Blueprint('users', __name__, url_prefix='/users')

UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads/avatars')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@users_bp.route('/<user_id>/avatar', methods=['POST'])
@require_auth
def upload_avatar(user_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{user_id}_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    avatar_url = f"/users/avatars/{filename}"

    return jsonify({'avatar_url': avatar_url})