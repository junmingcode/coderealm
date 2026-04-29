from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from feedgen.feed import FeedGenerator

from app.database import get_db
from app.config import get_settings
from app.models import Article

router = APIRouter()
settings = get_settings()


@router.get("")
def get_rss(request: Request, db: Session = Depends(get_db)):
    base_url = str(request.base_url).rstrip("/")

    fg = FeedGenerator()
    fg.title(settings.app_name)
    fg.description(settings.app_description)
    fg.link(href=f"{base_url}/api/rss", rel="self")
    fg.language("zh-CN")

    articles = (
        db.query(Article)
        .filter(Article.status == "published")
        .order_by(Article.published_at.desc())
        .limit(20)
        .all()
    )

    for article in articles:
        fe = fg.add_entry()
        fe.title(article.title)
        fe.link(href=f"{base_url}/article/{article.slug}")
        fe.description(article.summary or article.content[:200])
        fe.published(article.published_at or article.created_at)
        fe.updated(article.updated_at or article.created_at)

    rss_feed = fg.rss_str(pretty=True)
    return Response(content=rss_feed, media_type="application/rss+xml")
