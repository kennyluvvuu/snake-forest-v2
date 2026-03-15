import httpx
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from api.products import get_products
from api.client import APIError
from bot.keyboards.products import product_list_keyboard

router = Router(name="list_products")


async def show_product_list(target: Message | CallbackQuery, client: httpx.AsyncClient) -> None:
    try:
        products = await get_products(client)
    except APIError as e:
        text = f"❌ Ошибка при загрузке списка: {e.message}"
        if isinstance(target, CallbackQuery):
            await target.answer(text, show_alert=True)
        else:
            await target.answer(text)
        return

    if not products:
        text = "📭 Список товаров пуст."
        if isinstance(target, CallbackQuery):
            await target.message.edit_text(text)
        else:
            await target.answer(text)
        return

    text = f"🛒 <b>Товары в магазине:</b> {len(products)} шт.\n\nВыберите для просмотра:"
    keyboard = product_list_keyboard(products)

    if isinstance(target, CallbackQuery):
        await target.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
        await target.answer()
    else:
        await target.answer(text, reply_markup=keyboard, parse_mode="HTML")


@router.message(F.text == "🛒 Список товаров")
async def msg_list_products(message: Message, api_client: httpx.AsyncClient) -> None:
    await show_product_list(message, api_client)


@router.callback_query(F.data == "product:list")
async def cb_list_products(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    await show_product_list(callback, api_client)
