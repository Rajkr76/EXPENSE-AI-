from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: str = "your-super-secret-jwt-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200

    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "expenseai"
    
    GROQ_API_KEY: str = "your-groq-api-key"

    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_SERVER: Optional[str] = "smtp.gmail.com"
    SMTP_PORT: Optional[int] = 587

    class Config:
        env_file = ".env"

settings = Settings()
