from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, User

from config import settings


class AdminMiddleware(BaseMiddleware):
    """
    Blocks all updates from users not listed in settings.admin_ids.
    Applied globally — no need to check permissions in each handler.
    """

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        user: User | None = data.get("event_from_user")

        if user is None or user.id not in settings.admin_ids:
            # Silently ignore non-admin updates
            return

        return await handler(event, data)
