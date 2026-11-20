import time
from pathlib import Path

from aiogram import Bot
from aiohttp import web

from db import Session
from services import export_events, export_users

AVATAR_DIR = Path("avatars")
AVATAR_DIR.mkdir(exist_ok=True)
AVATAR_TTL = 24 * 3600  # обновлять аватарку раз в сутки


@web.middleware
async def cors_middleware(request: web.Request, handler):
    """Разрешаем фронту ходить на API с другого домена/порта."""
    try:
        response = (
            web.Response() if request.method == "OPTIONS" else await handler(request)
        )
    except web.HTTPException as e:
        response = e
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response


async def events_json(request: web.Request):
    async with Session() as db:
        data = await export_events(db)
    return web.json_response(data, dumps=_dumps)


async def users_json(request: web.Request):
    async with Session() as db:
        data = await export_users(db, request.app["base_url"])
    return web.json_response(data, dumps=_dumps)


async def avatar(request: web.Request):
    """Отдаёт аватарку пользователя, не раскрывая токен бота."""
    try:
        user_id = int(request.match_info["user_id"])
    except ValueError:
        raise web.HTTPBadRequest()

    bot: Bot = request.app["bot"]
    path = AVATAR_DIR / f"{user_id}.jpg"

    stale = not path.exists() or time.time() - path.stat().st_mtime > AVATAR_TTL
    if stale:
        try:
            photos = await bot.get_user_profile_photos(user_id, limit=1)
            if not photos.total_count:
                raise web.HTTPNotFound()
            sizes = photos.photos[0]
            file_id = sizes[min(1, len(sizes) - 1)].file_id  # средний размер
            await bot.download(file_id, destination=path)
        except web.HTTPException:
            raise
        except Exception:
            if not path.exists():
                raise web.HTTPNotFound()  # отдадим старую, если есть

    return web.FileResponse(path, headers={"Cache-Control": "public, max-age=3600"})


def _dumps(data) -> str:
    import json
    return json.dumps(data, ensure_ascii=False)


async def start_api(bot: Bot, base_url: str, host: str = "0.0.0.0", port: int = 8080):
    app = web.Application(middlewares=[cors_middleware])
    app["bot"] = bot
    app["base_url"] = base_url.rstrip("/")

    app.router.add_get("/volunteer_events.json", events_json)
    app.router.add_get("/volunteer_users.json", users_json)
    app.router.add_get("/avatar/{user_id}", avatar)

    runner = web.AppRunner(app)
    await runner.setup()
    await web.TCPSite(runner, host, port).start()
    return runner
