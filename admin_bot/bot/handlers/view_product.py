import httpx
from aiogram import Router, F
from aiogram.types import CallbackQuery

from api.products import get_product
from api.client import APIError
from bot.keyboards.products import product_actions_keyboard
from utils.formatters import format_product_card

router = Router(name="view_product")


@router.callback_query(F.data.startswith("product:view:"))
async def cb_view_product(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    product_id = callback.data.split(":", 2)[2]

    try:
        product = await get_product(api_client, product_id)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    text = format_product_card(product, full=True)
    keyboard = product_actions_keyboard(product_id)

    try:
        await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    except Exception:
        await callback.message.answer(text, reply_markup=keyboard, parse_mode="HTML")

    await callback.answer()
