"""add visitor_hash to views

Revision ID: d7e2f4a6c9b1
Revises: c5d1f3e2a7b8
Create Date: 2026-05-09
"""
from alembic import op
import sqlalchemy as sa

revision = "d7e2f4a6c9b1"
down_revision = "c5d1f3e2a7b8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("views", sa.Column("visitor_hash", sa.String(64), nullable=True))
    op.create_index(op.f("ix_views_visitor_hash"), "views", ["visitor_hash"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_views_visitor_hash"), table_name="views")
    op.drop_column("views", "visitor_hash")
