import httpx
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from api.animals import get_animals
from api.client import APIError
from bot.keyboards.animals import animal_list_keyboard

router = Router(name="list_animals")


async def show_animal_list(target: Message | CallbackQuery, client: httpx.AsyncClient) -> None:
    try:
        animals = await get_animals(client)
    except APIError as e:
        text = f"❌ Ошибка при загрузке списка: {e.message}"
        if isinstance(target, CallbackQuery):
            await target.answer(text, show_alert=True)
        else:
            await target.answer(text)
        return

    if not animals:
        text = "📭 Список животных пуст."
        if isinstance(target, CallbackQuery):
            await target.message.edit_text(text)
        else:
            await target.answer(text)
        return

    text = f"📋 <b>Животные в магазине:</b> {len(animals)} шт.\n\nВыберите для просмотра:"
    keyboard = animal_list_keyboard(animals)

    if isinstance(target, CallbackQuery):
        await target.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
        await target.answer()
    else:
        await target.answer(text, reply_markup=keyboard, parse_mode="HTML")


@router.message(F.text == "📋 Список животных")
async def msg_list_animals(message: Message, api_client: httpx.AsyncClient) -> None:
    await show_animal_list(message, api_client)


@router.callback_query(F.data == "animal:list")
async def cb_list_animals(callback: CallbackQuery, api_client: httpx.AsyncClient) -> None:
    await show_animal_list(callback, api_client)
