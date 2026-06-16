from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"

class SpotStatus(str, enum.Enum):
    FREE = "FREE"
    OCCUPIED = "OCCUPIED"
    BOOKED = "BOOKED"
    UNAVAILABLE = "UNAVAILABLE"
    VIOLATION = "VIOLATION"

class BookingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"

class User(Base):
    __tablename__ = "users"
    avatar = Column(String(500), nullable=True)
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cars = relationship("Car", back_populates="user")
    bookings = relationship("Booking", back_populates="user")

class ParkingZone(Base):
    __tablename__ = "parking_zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_spots = Column(Integer, default=0)
    price_per_hour = Column(Float, default=200.0)
    status = Column(String(50), default="ACTIVE")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    spots = relationship("ParkingSpot", back_populates="zone", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="zone")

class ParkingSpot(Base):
    __tablename__ = "parking_spots"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("parking_zones.id"), nullable=False)
    spot_number = Column(String(50), nullable=False)
    status = Column(Enum(SpotStatus), default=SpotStatus.FREE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    zone = relationship("ParkingZone", back_populates="spots")
    bookings = relationship("Booking", back_populates="spot")

class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plate_number = Column(String(30), nullable=False)
    car_brand = Column(String(100), nullable=False)
    car_model = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="cars")
    bookings = relationship("Booking", back_populates="car")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("parking_zones.id"), nullable=False)
    spot_id = Column(Integer, ForeignKey("parking_spots.id"), nullable=False)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.ACTIVE)
    qr_code = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="bookings")
    zone = relationship("ParkingZone", back_populates="bookings")
    spot = relationship("ParkingSpot", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    booking = relationship("Booking", back_populates="payment")

class Violation(Base):
    __tablename__ = "violations"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("parking_zones.id"), nullable=False)
    spot_id = Column(Integer, ForeignKey("parking_spots.id"), nullable=False)
    plate_number = Column(String(30), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
