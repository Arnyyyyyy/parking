from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine, SessionLocal
from app.seed import seed_data
from app.routes import auth, users, parking, bookings, payments, admin, ws

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_data(db)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(parking.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(ws.router)

@app.get("/")
def root():
    return {"message":"Smart Parking System API", "docs":"/docs"}
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")