from datetime import datetime, timedelta
from enum import Enum

from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from db import Session
from models import Event, Registration, User


class JoinResult(str, Enum):
    OK = "ok"
    ALREADY = "already"
    FULL = "full"
    NOT_FOUND = "not_found"


# ---------- Пользователи ----------

async def get_or_create_user(
    session: AsyncSession, telegram_id: int, username: str | None, first_name: str
) -> tuple[User, bool]:
    """Регистрация по Telegram ID. Возвращает (user, created)."""
    user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
    if user:
        # обновляем данные, если человек сменил имя или username
        if user.username != username or user.first_name != first_name:
            user.username = username
            user.first_name = first_name
            await session.commit()
        return user, False

    user = User(telegram_id=telegram_id,
                username=username, first_name=first_name)
    session.add(user)
    try:
        await session.commit()
        return user, True
    except IntegrityError:
        await session.rollback()
        user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
        return user, False


async def add_score(session: AsyncSession, telegram_id: int, delta: int) -> int | None:
    """Начислить (или снять) очки. Возвращает новый счёт или None, если юзера нет."""
    user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
    if not user:
        return None
    user.score += delta
    await session.commit()
    return user.score


# ---------- Мероприятия ----------

async def create_event(
    session: AsyncSession, starts_at: datetime, title: str, description: str
) -> Event:
    event = Event(starts_at=starts_at, title=title, description=description)
    session.add(event)
    await session.commit()
    return event


async def list_events(session: AsyncSession) -> list[tuple[Event, int]]:
    """Ближайшие мероприятия + количество записавшихся."""
    stmt = (
        select(Event, func.count(Registration.id))
        .outerjoin(Registration, Registration.event_id == Event.id)
        .where(Event.starts_at >= datetime.now())
        .group_by(Event.id)
        .order_by(Event.starts_at)
    )
    result = await session.execute(stmt)
    return [(event, count) for event, count in result.all()]


# ---------- Запись / отмена ----------

async def join_event(session: AsyncSession, user_id: int, event_id: int) -> JoinResult:
    event = await session.get(Event, event_id)
    if not event:
        return JoinResult.NOT_FOUND

    already = await session.scalar(
        select(Registration.id).where(
            Registration.user_id == user_id, Registration.event_id == event_id
        )
    )
    if already:
        return JoinResult.ALREADY

    if event.capacity is not None:
        taken = await session.scalar(
            select(func.count(Registration.id)).where(
                Registration.event_id == event_id)
        )
        if taken >= event.capacity:
            return JoinResult.FULL

    session.add(Registration(user_id=user_id, event_id=event_id))
    try:
        await session.commit()
        return JoinResult.OK
    except IntegrityError:
        await session.rollback()
        return JoinResult.ALREADY


async def cancel_registration(session: AsyncSession, user_id: int, event_id: int) -> bool:
    """True, если запись была и удалена."""
    result = await session.execute(
        delete(Registration).where(
            Registration.user_id == user_id, Registration.event_id == event_id
        )
    )
    await session.commit()
    return result.rowcount > 0


async def my_events(session: AsyncSession, user_id: int) -> list[Event]:
    stmt = (
        select(Event)
        .join(Registration, Registration.event_id == Event.id)
        .where(Registration.user_id == user_id, Event.starts_at >= datetime.now())
        .order_by(Event.starts_at)
    )
    return list(await session.scalars(stmt))


# ---------- Экспорт для фронта ----------

async def export_events(session: AsyncSession) -> list[dict]:
    events = await session.scalars(select(Event).order_by(Event.starts_at))
    return [
        {
            "event_id": e.id,
            "date": e.starts_at.isoformat(),
            "title": e.title,
            "description": e.description or "",
        }
        for e in events
    ]


async def export_users(session: AsyncSession, base_url: str) -> list[dict]:
    users = await session.scalars(
        select(User).order_by(User.score.desc(), User.created_at)
    )
    return [
        {
            "user_id": u.telegram_id,
            "username": u.username,  # может быть null
            "first_name": u.first_name,
            "score": u.score,
            "photo_url": f"{base_url}/avatar/{u.telegram_id}",
        }
        for u in users
    ]


# ---------- Тестовые данные ----------

async def seed_events() -> None:
    async with Session() as session:
        if await session.scalar(select(Event.id).limit(1)):
            return
        now = datetime.now().replace(second=0, microsecond=0)
        session.add_all([
            Event(title="Субботник в парке", description="Уборка территории",
                  location="Центральный парк", starts_at=now + timedelta(days=3), capacity=20),
            Event(title="Помощь приюту", description="Выгул собак и уборка",
                  location="Приют «Друг»", starts_at=now + timedelta(days=7), capacity=5),
            Event(title="Благотворительный забег", description="Волонтёры на трассе",
                  location="Набережная", starts_at=now + timedelta(days=14)),
        ])
        await session.commit()
