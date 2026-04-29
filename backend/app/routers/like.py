from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Like, Article

router = APIRouter()


@router.post("/articles/{article_id}/like")
def like_article(article_id: int, request: Request, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    client_ip = request.client.host if request.client else "unknown"
    existing = db.query(Like).filter(Like.article_id == article_id, Like.ip_address == client_ip).first()
    if existing:
        return {"message": "Already liked", "liked": True}

    like = Like(article_id=article_id, ip_address=client_ip)
    db.add(like)
    db.commit()
    count = db.query(func.count(Like.id)).filter(Like.article_id == article_id).scalar()
    return {"message": "Liked", "liked": True, "count": count}


@router.get("/articles/{article_id}/like-count")
def get_like_count(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    count = db.query(func.count(Like.id)).filter(Like.article_id == article_id).scalar()
    return {"count": count}
