import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from api.client import build_client
from bot.handlers import (
    common,
    create_animal,
    create_product,
    delete_animal,
    delete_product,
    edit_animal,
    edit_product,
    images,
    list_animals,
    list_products,
    product_images,
    rebuild,
    view_animal,
    view_product,
)
from bot.middlewares.auth import AdminMiddleware
from config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def main() -> None:
    session = AiohttpSession(proxy="socks5://150.241.91.53:1080")
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
        session=session,
    )
    dp = Dispatcher(storage=MemoryStorage())

    # ── Global middleware — blocks non-admins before any handler runs ──────────
    dp.update.middleware(AdminMiddleware())

    # ── Register routers (order matters for priority) ──────────────────────────
    dp.include_router(common.router)
    dp.include_router(rebuild.router)
    # Animals
    dp.include_router(create_animal.router)
    dp.include_router(edit_animal.router)
    dp.include_router(images.router)
    dp.include_router(delete_animal.router)
    dp.include_router(view_animal.router)
    dp.include_router(list_animals.router)
    # Products
    dp.include_router(create_product.router)
    dp.include_router(edit_product.router)
    dp.include_router(product_images.router)
    dp.include_router(delete_product.router)
    dp.include_router(view_product.router)
    dp.include_router(list_products.router)

    # ── Lifecycle: create shared httpx client, inject into workflow_data ───────
    api_client = build_client()

    async def on_startup():
        logger.info("Bot started. Admins: %s", settings.admin_ids)

    async def on_shutdown():
        await api_client.aclose()
        logger.info("API client closed.")

    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)

    # Inject api_client so all handlers receive it as `api_client` kwarg
    await dp.start_polling(bot, api_client=api_client)


if __name__ == "__main__":
    asyncio.run(main())
