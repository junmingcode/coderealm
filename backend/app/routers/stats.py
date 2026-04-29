from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

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
