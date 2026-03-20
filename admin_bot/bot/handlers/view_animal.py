import httpx
from aiogram import Router, F
from aiogram.types import CallbackQuery

from api.animals import get_animal
from api.client import APIError
from bot.keyboards.animals import animal_actions_keyboard
from utils.formatters import format_animal_card

router = Router(name="view_animal")


@router.callback_query(F.data.startswith("animal:view:"))
async def cb_view_animal(
    callback: CallbackQuery, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        animal = await get_animal(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    text = format_animal_card(animal, full=True)
    keyboard = animal_actions_keyboard(animal["id"], animal["slug"])

    # If the message has photos, we need to send a new message (can't edit caption to text easily)
    try:
        await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    except Exception:
        await callback.message.answer(text, reply_markup=keyboard, parse_mode="HTML")

    await callback.answer()
