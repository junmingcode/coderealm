from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comment, Article
from app.schemas import CommentCreate, CommentResponse

router = APIRouter()


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

    result = []
    for comment in comments:
        replies = (
            db.query(Comment)
            .filter(Comment.parent_id == comment.id, Comment.status == "approved")
            .order_by(Comment.created_at.asc())
            .all()
        )
        comment.replies = replies
        result.append(comment)
    return result


@router.post("/articles/{article_id}/comments", response_model=CommentResponse)
def create_comment(
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
        content=comment.content,
        parent_id=comment.parent_id,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    db_comment.replies = []
    return db_comment
