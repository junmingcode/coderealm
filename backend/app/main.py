from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, article, category, tag, comment, like, upload, rss, stats
from app.utils.security import get_password_hash
from app.models import User
from sqlalchemy.orm import Session
from app.database import SessionLocal

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create default admin user
def create_admin_user():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == settings.admin_username).first()
        if not admin:
            admin_user = User(
                username=settings.admin_username,
                email=f"{settings.admin_username}@blog.com",
                hashed_password=get_password_hash(settings.admin_password),
                is_admin=True,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()

create_admin_user()

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.upload_dir)
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(article.router, prefix="/api/articles", tags=["articles"])
app.include_router(category.router, prefix="/api/categories", tags=["categories"])
app.include_router(tag.router, prefix="/api/tags", tags=["tags"])
app.include_router(comment.router, prefix="/api", tags=["comments"])
app.include_router(like.router, prefix="/api", tags=["likes"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(rss.router, prefix="/api/rss", tags=["rss"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
