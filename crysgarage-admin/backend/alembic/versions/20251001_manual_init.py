"""
Manual init schema for Postgres: users, uploads, masters, errors, referrer_slots, referrer_uses

Revision ID: manual_init_20251001
Revises: 03f4c0434277
Create Date: 2025-10-01 15:35:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'manual_init_20251001'
down_revision = '03f4c0434277'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('user_id', sa.String(), primary_key=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('tier', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('last_seen', sa.DateTime(), nullable=True),
        sa.Column('firebase_uid', sa.String(), nullable=True),
    )

    op.create_table(
        'uploads',
        sa.Column('upload_id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.user_id'), nullable=False),
        sa.Column('filename', sa.String(), nullable=True),
        sa.Column('size', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('file_url', sa.String(), nullable=True),
    )

    op.create_table(
        'masters',
        sa.Column('file_id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.user_id'), nullable=False),
        sa.Column('tier', sa.String(), nullable=True),
        sa.Column('genre', sa.String(), nullable=True),
        sa.Column('preset', sa.String(), nullable=True),
        sa.Column('input_size', sa.Integer(), nullable=True),
        sa.Column('output_size', sa.Integer(), nullable=True),
        sa.Column('format', sa.String(), nullable=True),
        sa.Column('sample_rate', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('ffmpeg_stderr', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('referrer_code', sa.String(), nullable=True),
    )

    op.create_table(
        'errors',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('traceback', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

    op.create_table(
        'referrer_slots',
        sa.Column('slot_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('code', sa.String(), unique=True, nullable=False),
        sa.Column('created_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('max_uses', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('allowed_tier_override', sa.String(), nullable=True),
    )

    op.create_table(
        'referrer_uses',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('slot_id', sa.Integer(), sa.ForeignKey('referrer_slots.slot_id'), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('signup_at', sa.DateTime(), nullable=True),
        sa.Column('first_mastered_at', sa.DateTime(), nullable=True),
        sa.Column('completed_master', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )


def downgrade() -> None:
    op.drop_table('referrer_uses')
    op.drop_table('referrer_slots')
    op.drop_table('errors')
    op.drop_table('masters')
    op.drop_table('uploads')
    op.drop_table('users')



