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
    if tags:
        tag_ids = [t.id for t in tags]
        counts = dict(
            db.query(article_tags.c.tag_id, func.count(Article.id))
            .join(Article, Article.id == article_tags.c.article_id)
            .filter(Article.status == "published", article_tags.c.tag_id.in_(tag_ids))
            .group_by(article_tags.c.tag_id)
            .all()
        )
        for tag in tags:
            tag.article_count = counts.get(tag.id, 0)
    return tags


@router.get("/{slug}", response_model=TagResponse)
def get_tag(slug: str, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.article_count = db.query(func.count(Article.id)).join(article_tags).filter(
        article_tags.c.tag_id == tag.id, Article.status == "published"
    ).scalar()
    return tag
