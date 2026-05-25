from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, products, chat, admin, ai

import os
from sqlalchemy import inspect

# Automatically create database tables on startup (suitable for development)
# But first, check if database schema needs update (e.g. missing conversation_id in chat_messages, status/is_sold in products)
db_file = "college_marketplace.db"
if not os.path.exists(db_file) and os.path.exists(os.path.join("backend", db_file)):
    db_file = os.path.join("backend", db_file)

if os.path.exists(db_file):
    try:
        import sqlite3
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        # Check products table columns
        cursor.execute("PRAGMA table_info(products)")
        columns = [col[1] for col in cursor.fetchall()]
        if columns:
            if "status" not in columns:
                cursor.execute("ALTER TABLE products ADD COLUMN status VARCHAR DEFAULT 'active'")
                print("Added column 'status' to products table.")
            if "is_sold" not in columns:
                cursor.execute("ALTER TABLE products ADD COLUMN is_sold BOOLEAN DEFAULT 0")
                print("Added column 'is_sold' to products table.")
            if "report_count" not in columns:
                cursor.execute("ALTER TABLE products ADD COLUMN report_count INTEGER DEFAULT 0")
                print("Added column 'report_count' to products table.")
                
        # Check chat_messages table columns
        cursor.execute("PRAGMA table_info(chat_messages)")
        chat_columns = [col[1] for col in cursor.fetchall()]
        if chat_columns and "conversation_id" not in chat_columns:
            conn.close()
            print("Database schema outdated (missing conversation_id). Deleting local SQLite database for clean recreation...")
            try:
                os.remove(db_file)
                print("Outdated database file deleted.")
            except Exception as delete_err:
                print(f"Failed to delete database file: {delete_err}")
        else:
            conn.commit()
            conn.close()
    except Exception as db_err:
        print(f"Pre-startup database migration check failed: {db_err}")

models.Base.metadata.create_all(bind=engine)

# Seed default channels if empty
from app.database import SessionLocal
db = SessionLocal()
try:
    if db.query(models.Channel).count() == 0:
        db.add(models.Channel(name="#general"))
        db.add(models.Channel(name="#marketplace-discussions"))
        db.commit()
except Exception as e:
    print(f"Startup channel seeding failed: {e}")
finally:
    db.close()

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
app.include_router(chat.buyer_router)
app.include_router(chat.seller_router)
app.include_router(admin.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the College Student Marketplace API. Visit /docs for Swagger UI documentation."
    }
