from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 使用 Docker 中的环境变量，如果不存在则回退到本地 SQLite (Emergency Mode)
# SQLALCHEMY_DATABASE_URL = os.getenv(
#     "DATABASE_URL", 
#     "postgresql://iron_wind:secure_password_123@localhost:5432/psyche_x_core"
# )

# SQLite Fallback for Instant Run
SQLALCHEMY_DATABASE_URL = "sqlite:///./psyche_x_core.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
