from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import bleach

from app.database import get_db
from app.models import Comment, Article
from app.schemas import CommentCreate, CommentResponse
from app.limiter import limiter

router = APIRouter()


def sanitize_comment(content: str) -> str:
    allowed_tags = {"p", "br", "strong", "em", "a", "code", "pre", "blockquote", "ul", "ol", "li"}
    allowed_attrs = {
        "a": ["href", "title"],
        "code": ["class"],
    }
    return bleach.clean(
        content,
        tags=allowed_tags,
        attributes=allowed_attrs,
        protocols={"a": ["http", "https", "mailto"]},
        strip=True,
    )


@router.get("/articles/{article_id}/comments", response_model=list[CommentResponse])
def list_comments(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    comments = (
        db.query(Comment)
        .filter(Comment.article_id == article_id, Comment.status == "approved", Comment.parent_id == None)
        .order_by(Comment.created_at.desc())
        .all()
    )

    if comments:
        comment_ids = [c.id for c in comments]
        replies = (
            db.query(Comment)
            .filter(Comment.parent_id.in_(comment_ids), Comment.status == "approved")
            .order_by(Comment.created_at.asc())
            .all()
        )
        replies_by_parent: dict[int, list[Comment]] = {}
        for r in replies:
            replies_by_parent.setdefault(r.parent_id, []).append(r)
        for comment in comments:
            comment.replies = replies_by_parent.get(comment.id, [])

    return comments


@router.post("/articles/{article_id}/comments", response_model=CommentResponse)
@limiter.limit("10/minute")
def create_comment(
    request: Request,
    article_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    db_comment = Comment(
        article_id=article_id,
        author_name=comment.author_name,
        author_email=comment.author_email,
        content=sanitize_comment(comment.content),
        parent_id=comment.parent_id,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    db_comment.replies = []
    return db_comment
