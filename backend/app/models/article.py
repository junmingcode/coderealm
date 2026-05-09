from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ArticleStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    cover_image = Column(String(255), nullable=True)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.DRAFT, nullable=False, index=True)
    view_count = Column(Integer, default=0, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True, index=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    series_id = Column(Integer, ForeignKey("series.id"), nullable=True, index=True)
    series_order = Column(Integer, nullable=True)

    category = relationship("Category", back_populates="articles")
    user = relationship("User", backref="articles")
    series = relationship("Series", back_populates="articles")
    tags = relationship("Tag", secondary=article_tags, back_populates="articles")
    comments = relationship("Comment", back_populates="article", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="article", cascade="all, delete-orphan")
    views = relationship("View", back_populates="article", cascade="all, delete-orphan")
