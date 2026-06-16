import qrcode
import base64
from io import BytesIO

def generate_booking_qr(booking_id: int, plate: str, zone: str) -> str:
    payload = f"SMART-PARKING|booking={booking_id}|plate={plate}|zone={zone}"
    img = qrcode.make(payload)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
