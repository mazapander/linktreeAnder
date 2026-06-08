from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Profile, Click, Visit, Link
from app.auth import require_admin
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/config')
def get_config():
    return jsonify({
        'admin_emails': (current_app.config.get('ADMIN_EMAILS') or '').split(','),
        'version': '1.0.0'
    })


@api_bp.route('/profiles')
def list_profiles():
    profiles = Profile.query.filter_by(is_active=True).all()
    return jsonify([{'slug': p.slug, 'name': p.name} for p in profiles])


@api_bp.route('/profiles/<slug>/stats')
@require_admin
def get_stats(slug):
    profile = Profile.query.filter_by(slug=slug).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    period = request.args.get('period', '7d')
    days = 7
    if period == '30d':
        days = 30
    elif period == '90d':
        days = 90

    since = datetime.now(timezone.utc) - timedelta(days=days)

    total_visits = Visit.query.filter(
        Visit.profile_id == profile.id,
        Visit.visited_at >= since
    ).count()

    total_clicks = db.session.query(func.count(Click.id)).join(Link).filter(
        Link.profile_id == profile.id,
        Click.clicked_at >= since
    ).scalar()

    clicks_by_link = db.session.query(
        Link.title,
        func.count(Click.id).label('clicks')
    ).join(Click).filter(
        Link.profile_id == profile.id,
        Click.clicked_at >= since
    ).group_by(Link.id, Link.title).all()

    visits_by_day = db.session.query(
        func.date(Visit.visited_at).label('date'),
        func.count(Visit.id).label('visits')
    ).filter(
        Visit.profile_id == profile.id,
        Visit.visited_at >= since
    ).group_by(func.date(Visit.visited_at)).all()

    return jsonify({
        'period': period,
        'total_visits': total_visits,
        'total_clicks': total_clicks,
        'clicks_by_link': [{'title': c.title, 'clicks': c.clicks} for c in clicks_by_link],
        'visits_by_day': [{'date': str(v.date), 'visits': v.visits} for v in visits_by_day]
    })