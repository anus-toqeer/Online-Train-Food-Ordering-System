from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import Vendor, MenuItem,Order


vendor_bp = Blueprint("vendor",__name__)

@vendor_bp.route('/api/vendors', methods=['POST'])
@jwt_required()
def create_vendor():
    claims = get_jwt()
    if claims.get('role') != 'vendor':
        return jsonify({"error": "Only vendors can do this"}), 403

    user_id = get_jwt_identity()

    existing = Vendor.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({"error": "Vendor profile already exists", "id": existing.id}), 400

    data = request.get_json()
    vendor = Vendor(user_id=user_id, station_name=data['station_name'])
    db.session.add(vendor)
    db.session.commit()
    return jsonify({"id": vendor.id, "station_name": vendor.station_name}), 201



# List menu items for a vendor (public — passengers use this too)
@vendor_bp.route('/api/vendors/<vendor_id>/menu', methods=['GET'])
def get_menu(vendor_id):
    items = MenuItem.query.filter_by(vendor_id=vendor_id, available=True).all()
    return jsonify([{"id": i.id, "name": i.name, "price": str(i.price)} for i in items]), 200

@vendor_bp.route('/api/vendors/me', methods=['GET'])
@jwt_required()
def get_my_vendor():
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    if not vendor:
        return jsonify({"error": "No vendor profile found"}), 404
    return jsonify({"id": vendor.id, "station_name": vendor.station_name, "verified": vendor.verified}), 200

@vendor_bp.route('/api/vendor/orders', methods = ['GET'])
@jwt_required()
def get_my_orders():
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    if not vendor :
        return jsonify({"error": "No vendor profile found"}), 404
    if not vendor.verified :
        return jsonify({"error": "Vendor verified yet"}), 404
    
    orders = Order.query.filter_by(vendor_id=vendor.id).all()
    return jsonify([{
            "coach": o.coach,
            "id": o.id,
            "status": o.status,
            "total_price": str(o.total_price),
            "seat": o.seat
        } for o in orders]), 200

@vendor_bp.route('/api/orders/<order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order(order_id):
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    if not vendor :
            return jsonify({"error": "No vendor profile found"}), 404
    if not vendor.verified :
            return jsonify({"error": "Vendor verified yet"}), 404

    order = Order.query.filter_by(id=order_id, vendor_id=vendor.id).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    order.status = data['status']
    db.session.commit()
    return jsonify({"id": order.id, "status": order.status}), 200

@vendor_bp.route('/api/menu/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_menu_item(item_id):
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    if not vendor:
        return jsonify({"error": "No vendor profile found"}), 404

    item = MenuItem.query.filter_by(id=item_id, vendor_id=vendor.id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200


@vendor_bp.route('/api/vendors/<vendor_id>/menu', methods=['POST'])
@jwt_required()
def add_menu_item(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if not vendor or not vendor.verified:
        return jsonify({"error": "Vendor not yet approved by admin"}), 403

    data = request.get_json()
    item = MenuItem(vendor_id=vendor_id, name=data['name'], price=data['price'])
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id, "name": item.name, "price": str(item.price)}), 201
    







