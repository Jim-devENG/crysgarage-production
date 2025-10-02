"""
Add visitors table

Revision ID: 20251001_add_visitors
Revises: 20251001_add_admin_users
Create Date: 2025-10-01 22:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20251001_add_visitors'
down_revision = '20251001_add_admin_users'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'visitors',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('session_id', sa.String(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('device_type', sa.String(), nullable=True),
        sa.Column('browser', sa.String(), nullable=True),
        sa.Column('browser_version', sa.String(), nullable=True),
        sa.Column('os', sa.String(), nullable=True),
        sa.Column('os_version', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('timezone', sa.String(), nullable=True),
        sa.Column('referrer', sa.String(), nullable=True),
        sa.Column('page_views', sa.Integer(), default=1),
        sa.Column('session_duration', sa.Integer(), nullable=True),
        sa.Column('is_bot', sa.Boolean(), default=False),
        sa.Column('is_mobile', sa.Boolean(), default=False),
        sa.Column('screen_resolution', sa.String(), nullable=True),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('first_visit', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_visit', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

def downgrade() -> None:
    op.drop_table('visitors')
