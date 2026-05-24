import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./college_marketplace.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "9a7c36a4f91d84e56b8e3100234a71d889fe61b2a95c0d54c86e2410a7019fce")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

settings = Settings()
