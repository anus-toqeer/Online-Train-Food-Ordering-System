from app import app
from extensions import db
from models import Train
import json

with app.app_context():
    trains = [
        Train(train_number="TR-101", route_json=json.dumps(["Karachi", "Hyderabad", "Multan", "Lahore"])),
        Train(train_number="TR-202", route_json=json.dumps(["Lahore", "Rawalpindi", "Peshawar"])),
    ]
    db.session.add_all(trains)
    db.session.commit()
    print("Seeded trains:")
    for t in trains:
        print(t.id, t.train_number)