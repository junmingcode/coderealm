from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Article, Category, Tag, Comment, Like
from app.schemas import ArticleCreate, ArticleUpdate
from slugify import slugify


def get_article_by_slug(db: Session, slug: str) -> Article | None:
    return db.query(Article).filter(Article.slug == slug).first()


def get_articles(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    category_slug: str | None = None,
    tag_slug: str | None = None,
    status: str | None = "published",
):
    query = db.query(Article)
    if status:
        query = query.filter(Article.status == status)
    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)
    if tag_slug:
        query = query.join(Article.tags).filter(Tag.slug == tag_slug)

    total = query.count()
    articles = (
        query.order_by(Article.published_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return articles, total


def create_article(db: Session, article: ArticleCreate, user_id: int) -> Article:
    slug = slugify(article.title)
    existing = db.query(Article).filter(Article.slug == slug).first()
    if existing:
        slug = f"{slug}-{db.query(func.count(Article.id)).scalar() + 1}"

    db_article = Article(
        title=article.title,
        slug=slug,
        content=article.content,
        summary=article.summary,
        cover_image=article.cover_image,
        status=article.status,
        category_id=article.category_id,
        user_id=user_id,
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)

    if article.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(article.tag_ids)).all()
        db_article.tags = tags
        db.commit()
        db.refresh(db_article)

    return db_article


def update_article(db: Session, article_id: int, article_update: ArticleUpdate) -> Article | None:
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        return None

    update_data = article_update.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] != db_article.title:
        new_slug = slugify(update_data["title"])
        existing = db.query(Article).filter(Article.slug == new_slug, Article.id != article_id).first()
        if existing:
            new_slug = f"{new_slug}-{article_id}"
        update_data["slug"] = new_slug

    tag_ids = update_data.pop("tag_ids", None)

    for key, value in update_data.items():
        setattr(db_article, key, value)

    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_article.tags = tags

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


def increment_view_count(db: Session, article_id: int):
    db.query(Article).filter(Article.id == article_id).update(
        {Article.view_count: Article.view_count + 1}
    )
    db.commit()
