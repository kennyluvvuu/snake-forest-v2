from aiogram import Router
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from bot.keyboards.main_menu import main_menu_keyboard

router = Router(name="common")


@router.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        "👋 Добро пожаловать в панель управления магазином!\n\n"
        "Выберите действие в меню ниже.",
        reply_markup=main_menu_keyboard(),
    )


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(
        "<b>Доступные команды:</b>\n\n"
        "/start — главное меню\n"
        "/cancel — отменить текущее действие\n\n"
        "<b>Животные:</b>\n"
        "• Просмотр списка животных\n"
        "• Добавление нового животного\n"
        "• Редактирование любого поля\n"
        "• Удаление с подтверждением\n"
        "• Загрузка и замена фотографий\n\n"
        "<b>Товары:</b>\n"
        "• Просмотр списка товаров\n"
        "• Добавление нового товара\n"
        "• Редактирование любого поля\n"
        "• Удаление с подтверждением\n"
        "• Загрузка и замена фотографий",
        parse_mode="HTML",
    )


@router.message(Command("cancel"))
@router.message(StateFilter("*"), lambda m: m.text == "❌ Отмена")
async def cmd_cancel(message: Message, state: FSMContext) -> None:
    current = await state.get_state()
    if current is None:
        await message.answer("Нечего отменять.", reply_markup=main_menu_keyboard())
        return
    await state.clear()
    await message.answer("✅ Действие отменено.", reply_markup=main_menu_keyboard())
