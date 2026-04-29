from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Tag, Article, article_tags
from app.schemas import TagResponse

router = APIRouter()


@router.get("", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    result = []
    for tag in tags:
        count = db.query(func.count(Article.id)).join(article_tags).filter(
            article_tags.c.tag_id == tag.id, Article.status == "published"
        ).scalar()
        tag.article_count = count
        result.append(tag)
    return result


@router.get("/{slug}", response_model=TagResponse)
def get_tag(slug: str, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.article_count = db.query(func.count(Article.id)).join(article_tags).filter(
        article_tags.c.tag_id == tag.id, Article.status == "published"
    ).scalar()
    return tag
