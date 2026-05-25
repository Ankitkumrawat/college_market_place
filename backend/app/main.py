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
if os.path.exists(db_file):
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        recreate_db = False
        
        if "chat_messages" in tables:
            columns = [col["name"] for col in inspector.get_columns("chat_messages")]
            if "conversation_id" not in columns:
                recreate_db = True
                
        if "products" in tables:
            prod_columns = [col["name"] for col in inspector.get_columns("products")]
            if "is_sold" not in prod_columns or "status" not in prod_columns or "report_count" not in prod_columns:
                recreate_db = True
                
        if "conversations" in tables and "orders" not in tables:
            recreate_db = True

        if recreate_db:
            print("Database schema outdated. Deleting local SQLite database for clean recreation...")
            try:
                engine.dispose()
                os.remove(db_file)
                print("Outdated database file deleted.")
            except Exception as delete_err:
                print(f"Failed to delete database file: {delete_err}. Attempting in-place schema migration fallback...")
                from sqlalchemy import text
                from app.database import SessionLocal
                db_session = SessionLocal()
                try:
                    # In-place migrations for products table
                    prod_columns = [col["name"] for col in inspector.get_columns("products")]
                    if "status" not in prod_columns:
                        db_session.execute(text("ALTER TABLE products ADD COLUMN status VARCHAR DEFAULT 'active'"))
                        db_session.commit()
                    if "is_sold" not in prod_columns:
                        db_session.execute(text("ALTER TABLE products ADD COLUMN is_sold BOOLEAN DEFAULT 0"))
                        db_session.commit()
                    if "report_count" not in prod_columns:
                        db_session.execute(text("ALTER TABLE products ADD COLUMN report_count INTEGER DEFAULT 0"))
                        db_session.commit()
                    print("In-place schema migration succeeded!")
                except Exception as alter_err:
                    print(f"In-place migration failed: {alter_err}")
                finally:
                    db_session.close()
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
