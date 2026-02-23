import httpx
from aiogram import Router, F
from aiogram.types import CallbackQuery

from api.animals import delete_animal, get_animal
from api.client import APIError
from bot.keyboards.animals import confirm_delete_keyboard
from utils.formatters import format_animal_card

router = Router(name="delete_animal")


@router.callback_query(F.data.startswith("animal:delete_ask:"))
async def cb_delete_ask(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    animal_id = callback.data.split(":", 2)[2]

    try:
        animal = await get_animal(api_client, animal_id)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    await callback.message.edit_text(
        f"🗑 <b>Удалить животное?</b>\n\n"
        f"{format_animal_card(animal)}\n\n"
        f"⚠️ Это действие необратимо.",
        parse_mode="HTML",
        reply_markup=confirm_delete_keyboard(animal_id),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("animal:delete_confirm:"))
async def cb_delete_confirm(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    animal_id = callback.data.split(":", 2)[2]

    try:
        await delete_animal(api_client, animal_id)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    await callback.message.edit_text(
        "✅ Животное успешно удалено.\n\nНажмите <b>📋 Список животных</b> для возврата.",
        parse_mode="HTML",
    )
    await callback.answer("✅ Удалено")
