from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import Vendor
from models import Order, OrderItem, MenuItem
from decimal import Decimal
from models import User

passenger_bp = Blueprint("passenger",__name__)


@passenger_bp.route('/api/vendorsList', methods=['GET'])
def vendorList():
    results = (
        db.session.query(Vendor, User)
        .join(User, Vendor.user_id == User.id)
        .filter(Vendor.verified == True)
        .all()
    )
    return jsonify([{
        "id": v.id,
        "station_name": v.station_name,
        "vendor_name": u.name
    } for v, u in results]), 200

from models import Train

@passenger_bp.route('/api/trains', methods=['GET'])
def get_trains():
    trains = Train.query.all()
    return jsonify([{"id": t.id, "train_number": t.train_number} for t in trains]), 200

# Place a new order
@passenger_bp.route('/api/orders', methods=['POST'])
@jwt_required()
def place_order():
    claims = get_jwt()
    if claims.get('role') != 'passenger':
        return jsonify({"error": "Only passengers can place orders"}), 403

    user_id = get_jwt_identity()
    data = request.get_json()
    # expected body: { vendor_id, train_id, coach, seat, items: [{menu_item_id, quantity}] }

    items = data.get('items', [])
    if not items:
        return jsonify({"error": "No items provided"}), 400

    total = Decimal('0')
    order_items_data = []

    for item in items:
        menu_item = MenuItem.query.get(item['menu_item_id'])
        if not menu_item or not menu_item.available:
            return jsonify({"error": f"Item {item['menu_item_id']} not available"}), 400
        quantity = item['quantity']
        line_total = menu_item.price * quantity
        total += line_total
        order_items_data.append((menu_item.id, quantity, menu_item.price))

    order = Order(
        passenger_id=user_id,
        vendor_id=data['vendor_id'],
        train_id=data['train_id'],
        coach=data.get('coach'),
        seat=data.get('seat'),
        status='pending',
        total_price=total
    )
    db.session.add(order)
    db.session.flush()  # generates order.id before commit, so we can use it below

    for menu_item_id, quantity, price in order_items_data:
        db.session.add(OrderItem(order_id=order.id, menu_item_id=menu_item_id, quantity=quantity, price=price))

    db.session.commit()
    return jsonify({"id": order.id, "status": order.status, "total_price": str(order.total_price)}), 201


# Passenger's own order history
@passenger_bp.route('/api/orders/me', methods=['GET'])
@jwt_required()
def my_orders():
    user_id = get_jwt_identity()
    results = (
        db.session.query(Order, Vendor)
        .join(Vendor, Order.vendor_id == Vendor.id)
        .filter(Order.passenger_id == user_id)
        .all()
    )
    return jsonify([{
        "id": o.id,
        "status": o.status,
        "total_price": str(o.total_price),
        "coach": o.coach,
        "seat": o.seat,
        "station_name": v.station_name
    } for o, v in results]), 200


# Single order detail (with items)
@passenger_bp.route('/api/orders/<order_id>', methods=['GET'])
@jwt_required()
def order_detail(order_id):
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, passenger_id=user_id).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404

    results = (
        db.session.query(OrderItem, MenuItem)
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    return jsonify({
        "id": order.id,
        "status": order.status,
        "total_price": str(order.total_price),
        "items": [{"name": mi.name, "quantity": oi.quantity, "price": str(oi.price)} for oi, mi in results]
    }), 200