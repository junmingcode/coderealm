from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from slugify import slugify

from app.database import get_db
from app.models import Category, Article
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.dependencies import get_current_admin

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


@router.post("", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    slug = category.slug or slugify(category.name)
    existing = db.query(Category).filter((Category.name == category.name) | (Category.slug == slug)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category name or slug already exists")
    db_category = Category(name=category.name, slug=slug, description=category.description)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    db_category.article_count = 0
    return db_category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if data.name is not None:
        category.name = data.name
    if data.slug is not None:
        category.slug = data.slug
    elif data.name is not None:
        category.slug = slugify(data.name)
    if data.description is not None:
        category.description = data.description
    db.commit()
    db.refresh(category)
    category.article_count = db.query(func.count(Article.id)).filter(
        Article.category_id == category.id, Article.status == "published"
    ).scalar()
    return category


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    article_count = db.query(func.count(Article.id)).filter(Article.category_id == category_id).scalar()
    if article_count > 0:
        raise HTTPException(status_code=409, detail="该分类下有文章，无法删除")
    db.delete(category)
    db.commit()
    return {"message": "删除成功"}
