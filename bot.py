import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode


BOT_TOKEN = os.environ["BOT_TOKEN"]
PROXY_URL = os.getenv("PROXY_URL")

logging.basicConfig(level=logging.INFO)

session = AiohttpSession(proxy=PROXY_URL) if PROXY_URL else AiohttpSession()

bot = Bot(
    token=BOT_TOKEN,
    session=session,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()


settings_kb = ReplyKeyboardMarkup(
    keyboard=[[KeyboardButton(text="⚙️ Настройки")]],
    resize_keyboard=True
)


@dp.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer("Привет! 👋", reply_markup=settings_kb)


@dp.message(F.text == "⚙️ Настройки")
async def open_settings(message: Message):
    await message.answer("Тут будут настройки")


async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен.")