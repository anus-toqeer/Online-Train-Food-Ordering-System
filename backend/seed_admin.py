from app import app
from extensions import db, bcrypt
from models import User

with app.app_context():
    existing = User.query.filter_by(email="admin@tfos.com").first()
    if existing:
        print("Admin already exists")
    else:
        hashed_pw = bcrypt.generate_password_hash("admin123").decode('utf-8')
        admin = User(name="Anas", email="anas@gmail.com", password_hash=hashed_pw, role="admin")
        db.session.add(admin)
        db.session.commit()
        print("Admin created:", admin.id)