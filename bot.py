import os
import asyncio
import logging
from datetime import datetime
from html import escape

from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
)
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode

from api import start_api
from db import Session, init_db
from services import (
    JoinResult,
    add_score,
    cancel_registration,
    create_event,
    get_or_create_user,
    join_event,
    list_events,
    my_events,
    seed_events,
)


BOT_TOKEN = os.getenv("BOT_TOKEN")
PROXY_URL = os.getenv("PROXY_URL") or None

if not BOT_TOKEN:
    raise SystemExit("BOT_TOKEN не задан. Проверь .env")


# Адрес, по которому фронт видит этот бэкенд (попадёт в photo_url).
# Локально: http://localhost:8080. На сервере: https://api.your-domain.com
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
API_PORT = int(os.getenv("API_PORT", "8080"))

# Telegram ID админов (узнать свой можно у @userinfobot)
ADMIN_IDS = {123456789}

logging.basicConfig(level=logging.INFO)

session = AiohttpSession(proxy=PROXY_URL) if PROXY_URL else AiohttpSession()

bot = Bot(
    token=BOT_TOKEN,
    session=session,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()


main_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📅 Мероприятия"),
         KeyboardButton(text="📋 Мои записи")],
        [KeyboardButton(text="⚙️ Настройки")],
    ],
    resize_keyboard=True
)


# ---------- Регистрация по Telegram ID ----------

@dp.message(CommandStart())
async def cmd_start(message: Message):
    tg = message.from_user
    async with Session() as db:
        user, created = await get_or_create_user(db, tg.id, tg.username, tg.first_name)

    name = escape(user.first_name)
    if created:
        text = f"Привет, {name}! Вы зарегистрированы как волонтёр 🎉"
    else:
        text = f"С возвращением, {name}! 👋"
    await message.answer(text, reply_markup=main_kb)


# ---------- Список мероприятий ----------

@dp.message(Command("events"))
@dp.message(F.text == "📅 Мероприятия")
async def show_events(message: Message):
    async with Session() as db:
        events = await list_events(db)

    if not events:
        await message.answer("Пока нет предстоящих мероприятий.")
        return

    for event, taken in events:
        limit = f"{taken}/{event.capacity}" if event.capacity else f"{taken}"
        text = (
            f"📌 <b>{escape(event.title)}</b>\n"
            f"🗓 {event.starts_at:%d.%m.%Y %H:%M}\n"
            f"📍 {escape(event.location or 'Не указано')}\n"
            f"👥 Записано: {limit}\n\n"
            f"{escape(event.description or '')}"
        )
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="✅ Записаться",
                                 callback_data=f"join:{event.id}")
        ]])
        await message.answer(text, reply_markup=kb)


# ---------- Запись на мероприятие ----------

@dp.callback_query(F.data.startswith("join:"))
async def cb_join(call: CallbackQuery):
    event_id = int(call.data.split(":")[1])
    tg = call.from_user

    async with Session() as db:
        user, _ = await get_or_create_user(db, tg.id, tg.username, tg.first_name)
        result = await join_event(db, user.id, event_id)

    answers = {
        JoinResult.OK: "Вы записаны на мероприятие ✅",
        JoinResult.ALREADY: "Вы уже записаны на это мероприятие",
        JoinResult.FULL: "Мест больше нет 😔",
        JoinResult.NOT_FOUND: "Мероприятие не найдено",
    }
    await call.answer(answers[result], show_alert=result != JoinResult.OK)


# ---------- Мои записи и отмена ----------

@dp.message(Command("my"))
@dp.message(F.text == "📋 Мои записи")
async def show_my_events(message: Message):
    tg = message.from_user
    async with Session() as db:
        user, _ = await get_or_create_user(db, tg.id, tg.username, tg.first_name)
        events = await my_events(db, user.id)

    if not events:
        await message.answer("У вас пока нет записей. Загляните в «📅 Мероприятия».")
        return

    for event in events:
        text = f"📌 <b>{escape(event.title)}</b>\n🗓 {event.starts_at:%d.%m.%Y %H:%M}"
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="❌ Отменить запись",
                                 callback_data=f"cancel:{event.id}")
        ]])
        await message.answer(text, reply_markup=kb)


@dp.callback_query(F.data.startswith("cancel:"))
async def cb_cancel(call: CallbackQuery):
    event_id = int(call.data.split(":")[1])
    tg = call.from_user

    async with Session() as db:
        user, _ = await get_or_create_user(db, tg.id, tg.username, tg.first_name)
        ok = await cancel_registration(db, user.id, event_id)

    if ok:
        await call.message.edit_text("Запись отменена ❌")
        await call.answer("Запись отменена")
    else:
        await call.answer("Вы не были записаны", show_alert=True)


# ---------- Админ-команды ----------

@dp.message(Command("addevent"))
async def cmd_addevent(message: Message, command: CommandObject):
    if message.from_user.id not in ADMIN_IDS:
        return
    usage = (
        "Формат:\n<code>/addevent 2026-12-01T12:00 | Название | Описание</code>"
    )
    try:
        date_s, title, desc = [p.strip() for p in command.args.split("|", 2)]
        starts_at = datetime.fromisoformat(date_s)
    except Exception:
        await message.answer(usage)
        return

    async with Session() as db:
        event = await create_event(db, starts_at, title, desc)
    await message.answer(f"Мероприятие создано, ID: {event.id} ✅")


@dp.message(Command("score"))
async def cmd_score(message: Message, command: CommandObject):
    """/score <telegram_id> <очки>, очки можно отрицательные."""
    if message.from_user.id not in ADMIN_IDS:
        return
    try:
        tg_id, delta = map(int, command.args.split())
    except Exception:
        await message.answer("Формат: <code>/score 123456789 10</code>")
        return

    async with Session() as db:
        new_score = await add_score(db, tg_id, delta)
    if new_score is None:
        await message.answer("Пользователь не найден")
    else:
        await message.answer(f"Новый счёт: {new_score}")


# ---------- Настройки ----------

@dp.message(F.text == "⚙️ Настройки")
async def open_settings(message: Message):
    await message.answer("Тут будут настройки")


async def main():
    await init_db()
    await seed_events()  # тестовые данные; удалите строку, когда добавите свои
    runner = await start_api(bot, API_BASE_URL, port=API_PORT)
    print(f"API: {API_BASE_URL}/volunteer_events.json")
    print("Бот запущен...")
    try:
        await dp.start_polling(bot)
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен.")
