import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads/avatars')


def create_app(config_override=None):
    app = Flask(__name__)

    db_url = config_override.get('DATABASE_URL') if config_override else None
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url or os.environ.get(
        'DATABASE_URL', 'postgresql://linktree:linktree_secret@localhost:5432/linktree'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    if config_override:
        app.config.update(config_override)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    db.init_app(app)
    CORS(app)

    from app.routes.public import public_bp
    from app.routes.admin import admin_bp
    from app.routes.api import api_bp
    from app.routes.users import users_bp

    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(users_bp)

    with app.app_context():
        db.create_all()

    return app