from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder


def animal_list_keyboard(animals: list[dict]) -> InlineKeyboardMarkup:
    """Inline list — each animal is one button."""
    builder = InlineKeyboardBuilder()
    for animal in animals:
        label = f"🐍 {animal['commonName']} — {animal['morph']} | {animal['price']} ₽"
        builder.button(text=label, callback_data=f"animal:view:{animal['slug']}")
    builder.adjust(1)
    return builder.as_markup()


def animal_actions_keyboard(animal_id: str) -> InlineKeyboardMarkup:
    """Action buttons shown in animal detail card."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✏️ Редактировать", callback_data=f"animal:edit:{animal_id}"),
                InlineKeyboardButton(text="🗑 Удалить", callback_data=f"animal:delete_ask:{animal_id}"),
            ],
            [
                InlineKeyboardButton(text="📸 Добавить фото", callback_data=f"animal:img_add:{animal_id}"),
                InlineKeyboardButton(text="🔄 Заменить фото", callback_data=f"animal:img_replace:{animal_id}"),
            ],
            [
                InlineKeyboardButton(text="◀️ К списку", callback_data="animal:list"),
            ],
        ]
    )


def confirm_delete_keyboard(animal_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Да, удалить", callback_data=f"animal:delete_confirm:{animal_id}"),
                InlineKeyboardButton(text="❌ Отмена", callback_data=f"animal:view:{animal_id}"),
            ]
        ]
    )


def cancel_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")]
        ]
    )


def edit_fields_keyboard(animal_id: str) -> InlineKeyboardMarkup:
    """Choose which field to edit."""
    fields = [
        ("Название", "commonName"),
        ("Вид (species)", "species"),
        ("Морф", "morph"),
        ("Возраст", "age"),
        ("Пол", "sex"),
        ("Приоритет", "priority"),
        ("Цена", "price"),
        ("Описание", "description"),
    ]
    builder = InlineKeyboardBuilder()
    for label, field in fields:
        builder.button(text=label, callback_data=f"animal:edit_field:{animal_id}:{field}")
    builder.button(text="◀️ Назад", callback_data=f"animal:view:{animal_id}")
    builder.adjust(2)
    return builder.as_markup()


def age_keyboard(prefix: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Молодой", callback_data=f"{prefix}:young"),
                InlineKeyboardButton(text="Взрослый", callback_data=f"{prefix}:adult"),
                InlineKeyboardButton(text="Пожилой", callback_data=f"{prefix}:elderly"),
            ]
        ]
    )


def sex_keyboard(prefix: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Самец", callback_data=f"{prefix}:male"),
                InlineKeyboardButton(text="Самка", callback_data=f"{prefix}:female"),
                InlineKeyboardButton(text="Неизвестно", callback_data=f"{prefix}:unknown"),
            ]
        ]
    )

def species_keyboard(prefix: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Ящерица", callback_data=f'{prefix}:lizard'),
                InlineKeyboardButton(text="Змея", callback_data=f'{prefix}:snake'),
                InlineKeyboardButton(text="Черепаха", callback_data=f'{prefix}:turtle'),
            ],
            [
                InlineKeyboardButton(text="Рыбка", callback_data=f'{prefix}:fish'),
                InlineKeyboardButton(text="Грызун", callback_data=f'{prefix}:rodent'),
                InlineKeyboardButton(text="Прочее", callback_data=f'{prefix}:other'),
            ]
        ]
    )