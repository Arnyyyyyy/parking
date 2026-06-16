from sqlalchemy.orm import Session
from app import models
from app.core.security import hash_password

ALMATY_ZONES = [
    {"name":"Площадь Республики", "address":"пр. Достык / пр. Абая", "latitude":43.238949, "longitude":76.945625, "total_spots":30, "price_per_hour":300},
    {"name":"Арбат", "address":"ул. Жибек Жолы", "latitude":43.263110, "longitude":76.940520, "total_spots":24, "price_per_hour":250},
    {"name":"Mega Alma-Ata", "address":"ул. Розыбакиева, 247А", "latitude":43.202385, "longitude":76.892701, "total_spots":40, "price_per_hour":200},
    {"name":"Esentai Mall", "address":"пр. Аль-Фараби, 77/8", "latitude":43.218540, "longitude":76.929350, "total_spots":35, "price_per_hour":400},
    {"name":"ЦУМ", "address":"пр. Абылай Хана, 62", "latitude":43.260556, "longitude":76.943391, "total_spots":22, "price_per_hour":250},
]

def seed_data(db: Session):
    admin = db.query(models.User).filter(models.User.email == "admin@parking.kz").first()
    if not admin:
        db.add(models.User(first_name="Admin", last_name="Parking", email="admin@parking.kz", phone="+77000000000", password_hash=hash_password("Admin12345"), role=models.UserRole.ADMIN))
    user = db.query(models.User).filter(models.User.email == "user@parking.kz").first()
    if not user:
        db.add(models.User(first_name="Arny", last_name="Demo", email="user@parking.kz", phone="+77777777777", password_hash=hash_password("User12345"), role=models.UserRole.USER))
    db.commit()

    if db.query(models.ParkingZone).count() == 0:
        for z in ALMATY_ZONES:
            zone = models.ParkingZone(**z, status="ACTIVE", description="Демо-парковка Алматы")
            db.add(zone)
            db.flush()
            for i in range(1, z["total_spots"] + 1):
                status = models.SpotStatus.FREE
                if i % 9 == 0: status = models.SpotStatus.OCCUPIED
                elif i % 13 == 0: status = models.SpotStatus.UNAVAILABLE
                db.add(models.ParkingSpot(zone_id=zone.id, spot_number=f"A-{i:02d}", status=status))
        db.commit()
