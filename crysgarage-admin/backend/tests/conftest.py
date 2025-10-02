import pytest
import asyncio
from app.db.base import engine
from app.models.models import Base

async def _reset_schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

@pytest.fixture(autouse=True)
def reset_db_between_tests():
    asyncio.get_event_loop().run_until_complete(_reset_schema())
    yield
