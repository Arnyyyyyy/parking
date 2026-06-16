from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from app.models import UserRole, SpotStatus, BookingStatus, PaymentStatus

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
    avatar: Optional[str] = None
    role: UserRole
    created_at: datetime
    class Config:
        from_attributes = True

class ParkingSpotOut(BaseModel):
    id: int
    zone_id: int
    spot_number: str
    status: SpotStatus
    class Config:
        from_attributes = True

class ParkingZoneCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    total_spots: int = 10
    price_per_hour: float = 200
    status: str = "ACTIVE"
    description: Optional[str] = None

class ParkingZoneUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_hour: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None

class ParkingZoneOut(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    total_spots: int
    price_per_hour: float
    status: str
    description: Optional[str]
    free_spots: int = 0
    occupied_spots: int = 0
    booked_spots: int = 0
    spots: List[ParkingSpotOut] = []
    class Config:
        from_attributes = True

class SpotStatusUpdate(BaseModel):
    status: SpotStatus

class BookingCreate(BaseModel):
    zone_id: int
    spot_id: int
    plate_number: str
    car_brand: str
    car_model: Optional[str] = None
    start_time: datetime
    end_time: datetime

class BookingOut(BaseModel):
    id: int
    zone_id: int
    spot_id: int
    car_id: int
    start_time: datetime
    end_time: datetime
    total_price: float
    status: BookingStatus
    qr_code: Optional[str]
    created_at: datetime
    zone_name: Optional[str] = None
    spot_number: Optional[str] = None
    plate_number: Optional[str] = None
    payment_status: Optional[str] = None
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: str
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expire_date: Optional[str] = None
    cvv: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: float
    payment_method: str
    payment_status: PaymentStatus
    transaction_id: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_users: int
    total_zones: int
    total_spots: int
    free_spots: int
    booked_spots: int
    occupied_spots: int
    active_bookings: int
    revenue_total: float
    revenue_by_day: list
    bookings_by_day: list
    zones_load: list
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)
class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)   