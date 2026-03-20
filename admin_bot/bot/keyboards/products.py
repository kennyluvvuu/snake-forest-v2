from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

PRODUCT_TYPE_LABELS = {
    "toy": "🧸 Игрушка",
    "usable": "🔧 Расходник",
    "food": "🍖 Корм",
}


def product_list_keyboard(products: list[dict]) -> InlineKeyboardMarkup:
    """Inline list — each product is one button."""
    builder = InlineKeyboardBuilder()
    for product in products:
        type_label = PRODUCT_TYPE_LABELS.get(
            product.get("type", ""), product.get("type", "")
        )
        label = f"{type_label} {product['name']} — {product['price']} ₽"
        builder.button(text=label, callback_data=f"product:view:{product['slug']}")
    builder.adjust(1)
    return builder.as_markup()


def product_actions_keyboard(product_id: str, slug: str) -> InlineKeyboardMarkup:
    """Action buttons shown in product detail card."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✏️ Редактировать", callback_data=f"product:edit:{slug}"
                ),
                InlineKeyboardButton(
                    text="🗑 Удалить", callback_data=f"product:delete_ask:{slug}"
                ),
            ],
            [
                InlineKeyboardButton(
                    text="📸 Добавить фото", callback_data=f"product:img_add:{slug}"
                ),
                InlineKeyboardButton(
                    text="🔄 Заменить фото", callback_data=f"product:img_replace:{slug}"
                ),
            ],
            [
                InlineKeyboardButton(text="◀️ К списку", callback_data="product:list"),
            ],
        ]
    )


def confirm_delete_product_keyboard(product_id: str, slug: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Да, удалить",
                    callback_data=f"product:delete_confirm:{product_id}",
                ),
                InlineKeyboardButton(
                    text="❌ Отмена", callback_data=f"product:view:{slug}"
                ),
            ]
        ]
    )


def cancel_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")]
        ]
    )


def product_type_keyboard(prefix: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🧸 Игрушка", callback_data=f"{prefix}:toy"),
                InlineKeyboardButton(
                    text="🔧 Расходник", callback_data=f"{prefix}:usable"
                ),
                InlineKeyboardButton(text="🍖 Корм", callback_data=f"{prefix}:food"),
            ]
        ]
    )


def edit_product_fields_keyboard(product_id: str, slug: str) -> InlineKeyboardMarkup:
    """Choose which product field to edit."""
    fields = [
        ("Название", "name"),
        ("Тип", "type"),
        ("Цена", "price"),
        ("Описание", "description"),
    ]
    builder = InlineKeyboardBuilder()
    for label, field in fields:
        builder.button(
            text=label, callback_data=f"product:edit_field:{product_id}:{field}"
        )
    builder.button(text="◀️ Назад", callback_data=f"product:view:{slug}")
    builder.adjust(2)
    return builder.as_markup()
