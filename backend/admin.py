from flask import jsonify ,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Vendor
from extensions import db


admin_bp = Blueprint('admin',__name__)


from models import User

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