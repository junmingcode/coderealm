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
    result = []
    for cat in categories:
        count = db.query(func.count(Article.id)).filter(Article.category_id == cat.id, Article.status == "published").scalar()
        cat.article_count = count
        result.append(cat)
    return result


@router.get("/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.article_count = db.query(func.count(Article.id)).filter(
        Article.category_id == category.id, Article.status == "published"
    ).scalar()
    return category
