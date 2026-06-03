import pytest
from app import db
from app.models import Profile, Link, Click, Visit


def test_profile_to_dict(app):
    with app.app_context():
        profile = Profile(slug='test', name='Test User', description='Desc')
        db.session.add(profile)
        db.session.commit()

        data = profile.to_dict()
        assert data['slug'] == 'test'
        assert data['name'] == 'Test User'
        assert data['description'] == 'Desc'
        assert data['is_active'] == True


def test_link_to_dict_with_utm(app):
    with app.app_context():
        profile = Profile(slug='test', name='Test')
        db.session.add(profile)
        db.session.commit()

        link = Link(
            profile_id=profile.id,
            title='Test Link',
            url='https://test.com',
            order=0,
            utm_source='src',
            utm_medium='med',
            utm_campaign='camp'
        )
        db.session.add(link)
        db.session.commit()

        data = link.to_dict()
        assert data['title'] == 'Test Link'
        assert data['utm']['source'] == 'src'
        assert data['utm']['medium'] == 'med'
        assert data['utm']['campaign'] == 'camp'


def test_click_model(app):
    with app.app_context():
        profile = Profile(slug='test', name='Test')
        db.session.add(profile)
        db.session.commit()

        link = Link(profile_id=profile.id, title='T', url='https://t.com', order=0)
        db.session.add(link)
        db.session.commit()

        click = Click(
            link_id=link.id,
            ip_address='127.0.0.1',
            user_agent='pytest'
        )
        db.session.add(click)
        db.session.commit()

        assert click.id is not None
        assert click.clicked_at is not None