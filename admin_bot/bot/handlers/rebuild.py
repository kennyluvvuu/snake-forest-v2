import html as html_mod
import httpx
from aiogram import Router
from aiogram.filters import StateFilter
from aiogram.types import Message

from config import settings
from bot.keyboards.main_menu import main_menu_keyboard

router = Router(name="rebuild")

REBUILD_BUTTON = "🔄 Пересобрать сайт"


@router.message(StateFilter(None), lambda m: m.text == REBUILD_BUTTON)
async def cmd_rebuild(message: Message) -> None:
    status_msg = await message.answer("⏳ Запускаю пересборку сайта…")

    if not settings.rebuild_secret:
        await status_msg.edit_text("❌ REBUILD_SECRET не настроен на сервере.")
        return

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                f"{settings.rebuilder_url}/rebuild",
                headers={"Authorization": f"Bearer {settings.rebuild_secret}"},
            )
        data = resp.json()
    except httpx.TimeoutException:
        await status_msg.edit_text("❌ Таймаут: сборка заняла слишком много времени.")
        return
    except Exception as e:
        safe_err = html_mod.escape(str(e))
        await status_msg.edit_text(
            f"❌ Ошибка соединения с сервисом сборки:\n<code>{safe_err}</code>",
            parse_mode="HTML",
        )
        return

    if data.get("ok"):
        await status_msg.delete()
        await message.answer(
            "✅ Сайт успешно пересобран!",
            reply_markup=main_menu_keyboard(),
        )
    else:
        raw_error = data.get("error", "неизвестная ошибка")
        safe_error = html_mod.escape(raw_error[-1500:])
        await status_msg.edit_text(
            f"❌ Ошибка сборки:\n<pre>{safe_error}</pre>",
            parse_mode="HTML",
        )
