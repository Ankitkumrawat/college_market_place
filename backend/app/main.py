from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, products, chat

# Automatically create database tables on startup (suitable for development)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="College Student Marketplace API",
    description="Backend API for the College Student Marketplace with authentication, products, and real-time chat.",
    version="1.0.0"
)

# CORS configurations to allow frontend to communicate with backend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the College Student Marketplace API. Visit /docs for Swagger UI documentation."
    }
