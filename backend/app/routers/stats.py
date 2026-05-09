from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Article, Comment, Like, View

router = APIRouter()


@router.get("/overview")
def get_overview(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    total_articles = db.query(func.count(Article.id)).scalar()
    published_articles = db.query(func.count(Article.id)).filter(Article.status == "published").scalar()
    draft_articles = db.query(func.count(Article.id)).filter(Article.status == "draft").scalar()
    total_comments = db.query(func.count(Comment.id)).scalar()
    total_likes = db.query(func.count(Like.id)).scalar()
    total_views = db.query(func.sum(Article.view_count)).scalar() or 0

    return {
        "total_articles": total_articles,
        "published_articles": published_articles,
        "draft_articles": draft_articles,
        "total_comments": total_comments,
        "total_likes": total_likes,
        "total_views": total_views,
    }


@router.get("/views/daily")
def get_daily_views(
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(
            func.date(View.created_at).label("date"),
            func.count(View.id).label("count"),
        )
        .filter(View.created_at >= since)
        .group_by(func.date(View.created_at))
        .order_by(func.date(View.created_at))
        .all()
    )
    return [{"date": str(r.date), "count": r.count} for r in rows]


@router.get("/views/top-articles")
def get_top_articles(
    days: int = Query(30, ge=1, le=90),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(
            Article.id,
            Article.title,
            Article.slug,
            func.count(View.id).label("views"),
        )
        .join(View, View.article_id == Article.id)
        .filter(View.created_at >= since)
        .group_by(Article.id, Article.title, Article.slug)
        .order_by(func.count(View.id).desc())
        .limit(limit)
        .all()
    )
    return [{"id": r.id, "title": r.title, "slug": r.slug, "views": r.views} for r in rows]
