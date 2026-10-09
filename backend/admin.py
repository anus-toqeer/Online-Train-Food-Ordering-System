from flask import jsonify ,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Vendor
from extensions import db
from sqlalchemy import func
from models import Vendor, User, Order, OrderItem, MenuItem

admin_bp = Blueprint('admin',__name__)


from models import User

@admin_bp.route('/api/admin/vendors/<vendor_id>', methods=['DELETE'])
@jwt_required()
def delete_vendor(vendor_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Invalid role"}), 403

    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404

    order_ids = [o.id for o in Order.query.filter_by(vendor_id=vendor.id).all()]
    if order_ids:
        OrderItem.query.filter(OrderItem.order_id.in_(order_ids)).delete(synchronize_session=False)
        Order.query.filter(Order.id.in_(order_ids)).delete(synchronize_session=False)

    MenuItem.query.filter_by(vendor_id=vendor.id).delete(synchronize_session=False)
    db.session.delete(vendor)
    db.session.commit()
    return jsonify({"message": "Vendor removed"}), 200

@admin_bp.route('/api/admin/vendors', methods=['GET'])
@jwt_required()
def getVendors():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Invalid role"}), 403

    results = (
        db.session.query(Vendor, User)
        .join(User, Vendor.user_id == User.id)
        .all()
    )

    return jsonify([{
        "id": v.id,
        "station_name": v.station_name,
        "verified": v.verified,
        "vendor_name": u.name,
        "vendor_email": u.email
    } for v, u in results]), 200


@admin_bp.route('/api/admin/vendors/<vendor_id>/verify',methods=['PATCH'])
@jwt_required()
def updateVendor(vendor_id) :
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify('Error ! Invalid Role '),404

    vendor = Vendor.query.filter_by(id=vendor_id).first()
    if not vendor:
        return jsonify({"error": "No vendor profile found"}), 404

    vendor.verified = True
    db.session.commit()
    return jsonify({"Id" : vendor.id , "Station_Name ": vendor.station_name ,"Verified" : vendor.verified}),200

from models import Order, User

@admin_bp.route('/api/admin/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Invalid role"}), 403

    results = (
        db.session.query(Order, Vendor, User)
        .join(Vendor, Order.vendor_id == Vendor.id)
        .join(User, Vendor.user_id == User.id)
        .all()
    )

    grouped = {}
    for order, vendor, user in results:
        if vendor.id not in grouped:
            grouped[vendor.id] = {
                "vendor_id": vendor.id,
                "station_name": vendor.station_name,
                "vendor_name": user.name,
                "vendor_email": user.email,
                "orders": []
            }
        grouped[vendor.id]["orders"].append({
            "id": order.id,
            "status": order.status,
            "total_price": str(order.total_price),
            "coach": order.coach,
            "seat": order.seat
        })

    return jsonify(list(grouped.values())), 200


@admin_bp.route('/api/admin/passengers', methods=['GET'])
@jwt_required()
def get_passengers():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Invalid role"}), 403

    results = (
        db.session.query(
            User,
            func.count(Order.id),
            func.coalesce(func.sum(Order.total_price), 0)
        )
        .outerjoin(Order, Order.passenger_id == User.id)
        .filter(User.role == 'passenger')
        .group_by(User.id)
        .all()
    )

    return jsonify([{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "order_count": count,
        "total_spent": str(total)
    } for u, count, total in results]), 200