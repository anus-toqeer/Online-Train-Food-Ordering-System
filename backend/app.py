from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db
from extensions import bcrypt
from extensions import jwt
from auth import auth_bp
from vendor import vendor_bp
from passengers import passenger_bp
from admin import admin_bp
from datetime import timedelta


load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173",
    "https://online-train-food-ordering-system.vercel.app"
]}})
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(vendor_bp)
app.register_blueprint(passenger_bp)
app.register_blueprint(admin_bp)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

bcrypt.init_app(app)
jwt.init_app(app)


@app.route('/')
def home():
    return {"status": "ok"}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)