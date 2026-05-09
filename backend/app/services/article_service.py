import uuid

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from app.models import Article, Category, Tag, Comment, Like
from app.schemas import ArticleCreate, ArticleUpdate
from slugify import slugify


def get_article_by_slug(db: Session, slug: str) -> Article | None:
    return (
        db.query(Article)
        .options(joinedload(Article.category), joinedload(Article.series), selectinload(Article.tags))
        .filter(Article.slug == slug)
        .first()
    )


def get_articles(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    category_slug: str | None = None,
    tag_slug: str | None = None,
    status: str | None = "published",
    q: str | None = None,
    category_id: int | None = None,
    sort_by: str = "published_at",
    sort_order: str = "desc",
):
    query = db.query(Article).options(joinedload(Article.category), joinedload(Article.series), selectinload(Article.tags))
    if status:
        query = query.filter(Article.status == status)
    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)
    if tag_slug:
        query = query.join(Article.tags).filter(Tag.slug == tag_slug)
    if q:
        query = query.filter(
            (Article.title.contains(q)) | (Article.content.contains(q)) | (Article.summary.contains(q))
        )
    if category_id is not None:
        query = query.filter(Article.category_id == category_id)

    sort_columns = {
        "published_at": Article.published_at,
        "created_at": Article.created_at,
        "view_count": Article.view_count,
    }
    sort_col = sort_columns.get(sort_by, Article.published_at)
    order = sort_col.desc() if sort_order == "desc" else sort_col.asc()
    # Secondary sort by id for stable ordering
    query = query.order_by(order, Article.id.desc())

    total = query.count()
    articles = query.offset((page - 1) * page_size).limit(page_size).all()
    return articles, total


def create_article(db: Session, article: ArticleCreate, user_id: int) -> Article:
    base_slug = slugify(article.title)
    slug = base_slug
    while db.query(Article).filter(Article.slug == slug).first():
        slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"

    published_at = datetime.now(timezone.utc) if article.status == "published" else None

    db_article = Article(
        title=article.title,
        slug=slug,
        content=article.content,
        summary=article.summary,
        cover_image=article.cover_image,
        status=article.status,
        category_id=article.category_id,
        user_id=user_id,
        series_id=article.series_id,
        series_order=article.series_order,
        published_at=published_at,
    )
    db.add(db_article)

    if article.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(article.tag_ids)).all()
        db_article.tags = tags

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        db_article.slug = slug
        db.add(db_article)
        db.commit()

    db.refresh(db_article)
    return db_article


def update_article(db: Session, article_id: int, article_update: ArticleUpdate) -> Article | None:
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        return None

    update_data = article_update.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] != db_article.title:
        base_slug = slugify(update_data["title"])
        new_slug = base_slug
        while db.query(Article).filter(Article.slug == new_slug, Article.id != article_id).first():
            new_slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        update_data["slug"] = new_slug

    tag_ids = update_data.pop("tag_ids", None)

    # Set published_at when transitioning to published
    if update_data.get("status") == "published" and db_article.status != "published":
        update_data["published_at"] = datetime.now(timezone.utc)

    for key, value in update_data.items():
        setattr(db_article, key, value)

    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_article.tags = tags

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        db_article = db.query(Article).filter(Article.id == article_id).first()
        if not db_article:
            return None
        base_slug = slugify(update_data.get("title", db_article.title))
        update_data["slug"] = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        for key, value in update_data.items():
            setattr(db_article, key, value)
        if tag_ids is not None:
            tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
            db_article.tags = tags
        db.add(db_article)
        db.commit()

    db.refresh(db_article)
    return db_article


def delete_article(db: Session, article_id: int) -> bool:
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        return False
    db.delete(db_article)
    db.commit()
    return True


def increment_view_count(db: Session, article_id: int, ip_address: str = None, user_agent: str = None):
    import hashlib
    from datetime import timedelta
    from app.models import View

    if ip_address:
        visitor_hash = hashlib.sha256(f"{ip_address}:{user_agent or ''}".encode()).hexdigest()
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        exists = (
            db.query(View.id)
            .filter(
                View.article_id == article_id,
                View.visitor_hash == visitor_hash,
                View.created_at >= cutoff,
            )
            .first()
        )
        if not exists:
            db.query(Article).filter(Article.id == article_id).update(
                {Article.view_count: Article.view_count + 1}
            )
            view = View(article_id=article_id, ip_address=ip_address, user_agent=user_agent, visitor_hash=visitor_hash)
            db.add(view)
    else:
        db.query(Article).filter(Article.id == article_id).update(
            {Article.view_count: Article.view_count + 1}
        )

    db.commit()
