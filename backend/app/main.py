import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os

from app.config import get_settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, article, category, tag, comment, like, upload, rss, stats, site_config, series
from app.utils.security import get_password_hash
from app.models import User, SiteConfig
from app.limiter import limiter

settings = get_settings()


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


def seed_site_config():
    db = SessionLocal()
    try:
        defaults = {
            "author_name": "JM",
            "author_bio": "热爱技术的开发者，专注于 Web 开发领域",
            "author_avatar": "",
            "about_page": "",
        }
        for key, value in defaults.items():
            existing = db.query(SiteConfig).filter(SiteConfig.key == key).first()
            if not existing:
                db.add(SiteConfig(key=key, value=value))
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(Base.metadata.create_all, bind=engine)
    await asyncio.to_thread(create_admin_user)
    await asyncio.to_thread(seed_site_config)
    yield


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "X-CSRF-Token"],
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
app.include_router(site_config.router, prefix="/api/site-config", tags=["site-config"])
app.include_router(series.router, prefix="/api/series", tags=["series"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
