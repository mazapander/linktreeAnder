from app.models import Profile, Link
from marshmallow import Schema, fields


class LinkSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str()
    url = fields.URL()
    icon = fields.Str(allow_none=True)
    order = fields.Int()
    is_active = fields.Bool()
    utm = fields.Dict(allow_none=True)


class ProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    slug = fields.Str()
    name = fields.Str()
    description = fields.Str(allow_none=True)
    photo_url = fields.Str(allow_none=True)
    is_active = fields.Bool()
    links = fields.List(fields.Nested(LinkSchema))


profile_schema = ProfileSchema()
links_schema = ProfileSchema(many=True)
link_schema = LinkSchema()