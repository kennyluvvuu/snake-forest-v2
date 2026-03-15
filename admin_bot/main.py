import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from api.client import build_client
from bot.middlewares.auth import AdminMiddleware
from bot.handlers import (
    common,
    rebuild,
    list_animals,
    view_animal,
    create_animal,
    edit_animal,
    delete_animal,
    images,
    list_products,
    view_product,
    create_product,
    edit_product,
    delete_product,
    product_images,
)
from config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def main() -> None:
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
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
