from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import bleach

from app.database import get_db
from app.models import Comment, Article
from app.schemas import CommentCreate, CommentResponse, CommentStatusUpdate, CommentAdminResponse, PaginatedResponse
from app.limiter import limiter
from app.dependencies import get_current_admin

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


@router.get("/admin/comments")
def list_admin_comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query("all"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    query = db.query(Comment).join(Article, Article.id == Comment.article_id)
    if status != "all":
        query = query.filter(Comment.status == status)
    total = query.count()
    comments = (
        query.order_by(Comment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = []
    for c in comments:
        article = db.query(Article).filter(Article.id == c.article_id).first()
        items.append({
            "id": c.id,
            "article_id": c.article_id,
            "article_title": article.title if article else "",
            "author_name": c.author_name,
            "author_email": c.author_email,
            "content": c.content,
            "status": c.status,
            "parent_id": c.parent_id,
            "created_at": c.created_at.isoformat(),
            "replies": [],
        })
    total_pages = (total + page_size - 1) // page_size
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.put("/admin/comments/{comment_id}/status")
def update_comment_status(
    comment_id: int,
    data: CommentStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if data.status not in ("approved", "pending", "spam"):
        raise HTTPException(status_code=400, detail="Invalid status")
    comment.status = data.status
    db.commit()
    db.refresh(comment)
    return {"message": "状态更新成功", "id": comment.id, "status": comment.status}


@router.delete("/admin/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": "删除成功"}
