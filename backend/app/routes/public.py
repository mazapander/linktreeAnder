from flask import Blueprint, request, jsonify
from app import db
from app.models import Profile, Link, Click, Visit
from urllib.parse import urlparse

public_bp = Blueprint('public', __name__)


@public_bp.route('/<slug>')
def get_profile(slug):
    profile = Profile.query.filter_by(slug=slug, is_active=True).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    track_visit(profile.id, request)

    return jsonify(profile.to_dict())


@public_bp.route('/<slug>/click/<int:link_id>')
def track_click(slug, link_id):
    profile = Profile.query.filter_by(slug=slug, is_active=True).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    link = Link.query.filter_by(id=link_id, profile_id=profile.id, is_active=True).first()
    if not link:
        return jsonify({'error': 'Link not found'}), 404

    click = Click(
        link_id=link_id,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent'),
        referrer=request.headers.get('Referer'),
        utm_source=link.utm_source,
        utm_medium=link.utm_medium,
        utm_campaign=link.utm_campaign
    )
    db.session.add(click)
    db.session.commit()

    url = link.url
    if link.utm_source or link.utm_medium or link.utm_campaign:
        separator = '&' if '?' in url else '?'
        params = []
        if link.utm_source:
            params.append(f'utm_source={link.utm_source}')
        if link.utm_medium:
            params.append(f'utm_medium={link.utm_medium}')
        if link.utm_campaign:
            params.append(f'utm_campaign={link.utm_campaign}')
        url += separator + '&'.join(params)

    return jsonify({'url': url})


def track_visit(profile_id, request):
    visit = Visit(
        profile_id=profile_id,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent'),
        referrer=request.headers.get('Referer')
    )
    db.session.add(visit)
    db.session.commit()