"""
Add admin_users table

Revision ID: 20251001_add_admin_users
Revises: 20251001_add_dev_login_audit
Create Date: 2025-10-01 20:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20251001_add_admin_users'
down_revision = '20251001_add_dev_login_audit'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'admin_users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('username', sa.String(), nullable=False, unique=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_login', sa.DateTime(), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('admin_users')
