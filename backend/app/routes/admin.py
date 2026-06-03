from flask import Blueprint, request, jsonify
from app import db
from app.models import Profile, Link
from app.schemas import profile_schema, link_schema, links_schema
from marshmallow import Schema, fields, validate, ValidationError

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


class ProfileCreateSchema(Schema):
    slug = fields.Str(required=True, validate=validate.Regexp(r'^[a-z0-9-]+$', error='Solo minúsculas, números y guiones'))
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    photo_url = fields.Str(allow_none=True)


class LinkCreateSchema(Schema):
    title = fields.Str(required=True)
    url = fields.URL(required=True)
    icon = fields.Str(allow_none=True)
    order = fields.Int(load_default=0)
    utm_source = fields.Str(allow_none=True)
    utm_medium = fields.Str(allow_none=True)
    utm_campaign = fields.Str(allow_none=True)


@admin_bp.route('/profiles', methods=['POST'])
def create_profile():
    try:
        data = ProfileCreateSchema().load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    if Profile.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'El slug ya existe'}), 409

    profile = Profile(**data)
    db.session.add(profile)
    db.session.commit()

    return jsonify(profile.to_dict()), 201


@admin_bp.route('/profiles/<slug>')
def get_profile_admin(slug):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    return jsonify(profile.to_dict())


@admin_bp.route('/profiles/<slug>', methods=['PUT'])
def update_profile(slug):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    allowed_fields = ['name', 'description', 'photo_url', 'is_active']
    for field in allowed_fields:
        if field in request.json:
            setattr(profile, field, request.json[field])

    db.session.commit()
    return jsonify(profile.to_dict())


@admin_bp.route('/profiles/<slug>/links', methods=['POST'])
def create_link(slug):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    try:
        data = LinkCreateSchema().load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    link = Link(profile_id=profile.id, **data)
    db.session.add(link)
    db.session.commit()

    return jsonify(link.to_dict()), 201


@admin_bp.route('/profiles/<slug>/links/<int:link_id>', methods=['PUT'])
def update_link(slug, link_id):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    link = Link.query.filter_by(id=link_id, profile_id=profile.id).first()
    if not link:
        return jsonify({'error': 'Link not found'}), 404

    allowed_fields = ['title', 'url', 'icon', 'order', 'is_active', 'utm_source', 'utm_medium', 'utm_campaign']
    for field in allowed_fields:
        if field in request.json:
            setattr(link, field, request.json[field])

    db.session.commit()
    return jsonify(link.to_dict())


@admin_bp.route('/profiles/<slug>/links/<int:link_id>', methods=['DELETE'])
def delete_link(slug, link_id):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    link = Link.query.filter_by(id=link_id, profile_id=profile.id).first()
    if not link:
        return jsonify({'error': 'Link not found'}), 404

    db.session.delete(link)
    db.session.commit()
    return '', 204


@admin_bp.route('/profiles/<slug>/reorder', methods=['POST'])
def reorder_links(slug):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    order_data = request.json
    for link_id, new_order in order_data.items():
        link = Link.query.filter_by(id=int(link_id), profile_id=profile.id).first()
        if link:
            link.order = new_order

    db.session.commit()
    return jsonify(profile.to_dict())