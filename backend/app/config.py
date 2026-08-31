import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
is_serverless = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

if is_serverless:
    DEFAULT_DB_PATH = "/tmp/krishivani.db"
    db_env = os.getenv("DATABASE_URL", "")
    if not db_env or "sqlite" in db_env:
        os.environ["DATABASE_URL"] = f"sqlite:///{DEFAULT_DB_PATH}"
else:
    DEFAULT_DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "krishivani.db"))

class Settings(BaseSettings):
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    DATAGOV_API_KEY: str = os.getenv("DATAGOV_API_KEY", "")
    AGMARKNET_RESOURCE_ID: str = os.getenv("AGMARKNET_RESOURCE_ID", "9ef84268-d588-465a-a308-a864a43d0070")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "krishivani_default_jwt_secret_sih2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

settings = Settings()
