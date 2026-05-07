from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class CommentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SPAM = "spam"


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    author_name = Column(String(50), nullable=False)
    author_email = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(Enum(CommentStatus), default=CommentStatus.APPROVED, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    article = relationship("Article", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
