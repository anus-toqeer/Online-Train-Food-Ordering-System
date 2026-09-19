from extensions import db
from datetime import datetime
import uuid


def gen_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)  # 'passenger' or 'vendor'

class Vendor(db.Model):
    __tablename__ = 'vendors'
    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    station_name = db.Column(db.String, nullable=False)
    verified = db.Column(db.Boolean, default=False)

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    vendor_id = db.Column(db.String, db.ForeignKey('vendors.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    available = db.Column(db.Boolean, default=True)

class Train(db.Model):
    __tablename__ = 'trains'
    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    train_number = db.Column(db.String, nullable=False)
    route_json = db.Column(db.String)  # store stations as JSON string

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    passenger_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    vendor_id = db.Column(db.String, db.ForeignKey('vendors.id'), nullable=False)
    train_id = db.Column(db.String, db.ForeignKey('trains.id'), nullable=False)
    coach = db.Column(db.String)
    seat = db.Column(db.String)
    status = db.Column(db.String, default='pending')
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    order_id = db.Column(db.String, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.String, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)