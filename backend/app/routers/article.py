import re

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import Article, Category, Tag, Comment, Like
from sqlalchemy.orm import joinedload, selectinload
from app.schemas import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleListResponse, PaginatedResponse
from app.dependencies import get_current_admin
from app.limiter import limiter
from app.services.article_service import (
    get_article_by_slug,
    get_articles,
    create_article,
    update_article,
    delete_article,
    increment_view_count,
)

router = APIRouter()


def calculate_reading_time(content: str) -> int:
    if not content:
        return 1
    chinese_chars = len(re.findall(r'[一-鿿]', content))
    english_words = len(re.findall(r'[a-zA-Z]+', content))
    total = chinese_chars + english_words
    return max(1, round(total / 400))


def _enrich_articles(articles: List[Article], db: Session):
    if not articles:
        return articles
    article_ids = [a.id for a in articles]
    like_counts = dict(
        db.query(Like.article_id, func.count(Like.id))
        .filter(Like.article_id.in_(article_ids))
        .group_by(Like.article_id)
        .all()
    )
    comment_counts = dict(
        db.query(Comment.article_id, func.count(Comment.id))
        .filter(Comment.article_id.in_(article_ids))
        .group_by(Comment.article_id)
        .all()
    )
    for article in articles:
        article.like_count = like_counts.get(article.id, 0)
        article.comment_count = comment_counts.get(article.id, 0)
        article.reading_time = calculate_reading_time(article.content)
    return articles


def _enrich_article(article: Article, db: Session):
    article.like_count = db.query(func.count(Like.id)).filter(Like.article_id == article.id).scalar() or 0
    article.comment_count = db.query(func.count(Comment.id)).filter(Comment.article_id == article.id).scalar() or 0
    article.reading_time = calculate_reading_time(article.content)
    return article


@router.get("", response_model=PaginatedResponse[ArticleListResponse])
@limiter.limit("60/minute")
def list_articles(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category: str | None = Query(None),
    tag: str | None = Query(None),
    db: Session = Depends(get_db),
):
    articles, total = get_articles(db, page=page, page_size=page_size, category_slug=category, tag_slug=tag)
    articles = _enrich_articles(articles, db)
    total_pages = (total + page_size - 1) // page_size
    return {
        "items": articles,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{slug}/neighbors")
@limiter.limit("60/minute")
def get_article_neighbors(slug: str, request: Request, db: Session = Depends(get_db)):
    article = get_article_by_slug(db, slug)
    if not article or article.status != "published":
        raise HTTPException(status_code=404, detail="Article not found")

    prev_article = (
        db.query(Article)
        .filter(Article.status == "published", Article.published_at < article.published_at)
        .order_by(Article.published_at.desc())
        .first()
    )

    next_article = (
        db.query(Article)
        .filter(Article.status == "published", Article.published_at > article.published_at)
        .order_by(Article.published_at.asc())
        .first()
    )

    return {
        "previous": {
            "slug": prev_article.slug,
            "title": prev_article.title,
        } if prev_article else None,
        "next": {
            "slug": next_article.slug,
            "title": next_article.title,
        } if next_article else None,
    }


@router.get("/search/query")
@limiter.limit("30/minute")
def search_articles(
    request: Request,
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    base_query = db.query(Article).filter(
        Article.status == "published",
        (Article.title.contains(q)) | (Article.content.contains(q)) | (Article.summary.contains(q))
    )
    total = base_query.count()
    articles = (
        base_query.options(joinedload(Article.category), selectinload(Article.tags))
        .order_by(Article.published_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    articles = _enrich_articles(articles, db)
    total_pages = (total + page_size - 1) // page_size
    return {
        "items": articles,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/popular/list")
@limiter.limit("60/minute")
def get_popular_articles(request: Request, limit: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    articles = (
        db.query(Article)
        .filter(Article.status == "published")
        .order_by(Article.view_count.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": a.id,
            "slug": a.slug,
            "title": a.title,
            "view_count": a.view_count,
        }
        for a in articles
    ]


@router.get("/admin/{article_id}", response_model=ArticleResponse)
def get_article_admin(
    article_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    article = (
        db.query(Article)
        .options(joinedload(Article.category), selectinload(Article.tags))
        .filter(Article.id == article_id)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return _enrich_article(article, db)


@router.get("/{slug}", response_model=ArticleResponse)
@limiter.limit("60/minute")
def get_article(slug: str, request: Request, db: Session = Depends(get_db)):
    article = get_article_by_slug(db, slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.status != "published":
        raise HTTPException(status_code=404, detail="Article not found")
    increment_view_count(db, article.id)
    return _enrich_article(article, db)


@router.post("", response_model=ArticleResponse)
def create_new_article(
    article: ArticleCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    db_article = create_article(db, article, admin.id)
    db.refresh(db_article)
    return _enrich_article(db_article, db)


@router.put("/{article_id}", response_model=ArticleResponse)
def update_existing_article(
    article_id: int,
    article: ArticleUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    db_article = update_article(db, article_id, article)
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.refresh(db_article)
    return _enrich_article(db_article, db)


@router.delete("/{article_id}")
def delete_existing_article(
    article_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    if not delete_article(db, article_id):
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted"}
