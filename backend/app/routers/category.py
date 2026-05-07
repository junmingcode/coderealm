from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Category, Article
from app.schemas import CategoryResponse

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    if categories:
        counts = dict(
            db.query(Article.category_id, func.count(Article.id))
            .filter(Article.status == "published", Article.category_id.in_([c.id for c in categories]))
            .group_by(Article.category_id)
            .all()
        )
        for cat in categories:
            cat.article_count = counts.get(cat.id, 0)
    return categories


@router.get("/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.article_count = db.query(func.count(Article.id)).filter(
        Article.category_id == category.id, Article.status == "published"
    ).scalar()
    return category
