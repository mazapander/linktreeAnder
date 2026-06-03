import pytest
from app import create_app, db
from app.models import Profile, Link


@pytest.fixture
def app():
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_profile(app):
    with app.app_context():
        profile = Profile(
            slug='testuser',
            name='Test User',
            description='Test description'
        )
        db.session.add(profile)
        db.session.commit()
        return profile.id


def test_get_profile_not_found(client):
    response = client.get('/testuser')
    assert response.status_code == 404


def test_get_profile_success(client, sample_profile):
    response = client.get('/testuser')
    assert response.status_code == 200
    data = response.get_json()
    assert data['slug'] == 'testuser'
    assert data['name'] == 'Test User'


def test_create_profile(client):
    response = client.post('/admin/profiles', json={
        'slug': 'newuser',
        'name': 'New User',
        'description': 'New description'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['slug'] == 'newuser'
    assert data['name'] == 'New User'


def test_create_duplicate_slug(client, sample_profile):
    response = client.post('/admin/profiles', json={
        'slug': 'testuser',
        'name': 'Duplicate'
    })
    assert response.status_code == 409


def test_create_link(client, sample_profile):
    response = client.post('/admin/profiles/testuser/links', json={
        'title': 'GitHub',
        'url': 'https://github.com/testuser'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['title'] == 'GitHub'
    assert data['url'] == 'https://github.com/testuser'


def test_update_link(client, app, sample_profile):
    with app.app_context():
        profile = Profile.query.filter_by(slug='testuser').first()
        link = Link(profile_id=profile.id, title='Old', url='https://old.com', order=0)
        db.session.add(link)
        db.session.commit()
        link_id = link.id

    response = client.put(f'/admin/profiles/testuser/links/{link_id}', json={
        'title': 'Updated',
        'url': 'https://new.com'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == 'Updated'


def test_delete_link(client, app, sample_profile):
    with app.app_context():
        profile = Profile.query.filter_by(slug='testuser').first()
        link = Link(profile_id=profile.id, title='ToDelete', url='https://delete.com', order=0)
        db.session.add(link)
        db.session.commit()
        link_id = link.id

    response = client.delete(f'/admin/profiles/testuser/links/{link_id}')
    assert response.status_code == 204


def test_track_click(client, app, sample_profile):
    with app.app_context():
        profile = Profile.query.filter_by(slug='testuser').first()
        link = Link(profile_id=profile.id, title='ClickMe', url='https://example.com', order=0)
        db.session.add(link)
        db.session.commit()
        link_id = link.id

    response = client.get(f'/testuser/click/{link_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert 'url' in data
    assert data['url'] == 'https://example.com'


def test_track_click_with_utm(client, app, sample_profile):
    with app.app_context():
        profile = Profile.query.filter_by(slug='testuser').first()
        link = Link(
            profile_id=profile.id,
            title='UTM Link',
            url='https://example.com',
            order=0,
            utm_source='twitter',
            utm_medium='social',
            utm_campaign='launch'
        )
        db.session.add(link)
        db.session.commit()
        link_id = link.id

    response = client.get(f'/testuser/click/{link_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert 'utm_source=twitter' in data['url']
    assert 'utm_medium=social' in data['url']
    assert 'utm_campaign=launch' in data['url']


def test_reorder_links(client, app, sample_profile):
    with app.app_context():
        profile = Profile.query.filter_by(slug='testuser').first()
        link1 = Link(profile_id=profile.id, title='First', url='https://first.com', order=0)
        link2 = Link(profile_id=profile.id, title='Second', url='https://second.com', order=1)
        db.session.add_all([link1, link2])
        db.session.commit()
        id1, id2 = link1.id, link2.id

    response = client.post('/admin/profiles/testuser/reorder', json={
        str(id1): 1,
        str(id2): 0
    })
    assert response.status_code == 200