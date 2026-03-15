from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📋 Список животных"), KeyboardButton(text="➕ Добавить животное")],
            [KeyboardButton(text="🛒 Список товаров"), KeyboardButton(text="➕ Добавить товар")],
            [KeyboardButton(text="🔄 Пересобрать сайт")],
        ],
        resize_keyboard=True,
        persistent=True,
    )
