import httpx
from aiogram import Router, F
from aiogram.types import CallbackQuery

from api.products import delete_product, get_product
from api.client import APIError
from bot.keyboards.products import confirm_delete_product_keyboard
from utils.formatters import format_product_card

router = Router(name="delete_product")


@router.callback_query(F.data.startswith("product:delete_ask:"))
async def cb_delete_product_ask(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    product_id = callback.data.split(":", 2)[2]

    try:
        product = await get_product(api_client, product_id)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    await callback.message.edit_text(
        f"🗑 <b>Удалить товар?</b>\n\n"
        f"{format_product_card(product)}\n\n"
        f"⚠️ Это действие необратимо.",
        parse_mode="HTML",
        reply_markup=confirm_delete_product_keyboard(product_id),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("product:delete_confirm:"))
async def cb_delete_product_confirm(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    product_id = callback.data.split(":", 2)[2]

    try:
        await delete_product(api_client, product_id)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    await callback.message.edit_text(
        "✅ Товар успешно удалён.\n\nНажмите <b>🛒 Список товаров</b> для возврата.",
        parse_mode="HTML",
    )
    await callback.answer("✅ Удалено")
