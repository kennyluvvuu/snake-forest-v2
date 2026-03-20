import httpx
from aiogram import Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from api.products import get_product, update_product
from api.client import APIError
from bot.keyboards.products import (
    product_actions_keyboard,
    edit_product_fields_keyboard,
    product_type_keyboard,
    cancel_keyboard,
)
from bot.states.product import EditProductSG
from utils.formatters import format_product_card

router = Router(name="edit_product")

FIELD_LABELS = {
    "name": "Название",
    "type": "Тип",
    "price": "Цена",
    "description": "Описание",
}

# ── Open field selection menu ──────────────────────────────────────────────────


@router.callback_query(F.data.startswith("product:edit:"))
async def cb_edit_product_menu(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        product = await get_product(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    await state.set_state(EditProductSG.choose_field)
    await state.update_data(product_id=product["id"], product_slug=slug)
    await callback.message.edit_text(
        "✏️ <b>Редактирование.</b> Выберите поле:",
        parse_mode="HTML",
        reply_markup=edit_product_fields_keyboard(product["id"], slug),
    )
    await callback.answer()


# ── Field selected ─────────────────────────────────────────────────────────────


@router.callback_query(
    StateFilter(EditProductSG.choose_field),
    F.data.startswith("product:edit_field:"),
)
async def cb_product_field_selected(callback: CallbackQuery, state: FSMContext) -> None:
    # callback_data format: product:edit_field:{product_id}:{field}
    parts = callback.data.split(":")
    product_id = parts[2]
    field = parts[3]

    await state.update_data(edit_field=field, product_id=product_id)
    label = FIELD_LABELS.get(field, field)

    if field == "type":
        await state.set_state(EditProductSG.enter_type)
        await callback.message.edit_text(
            f"Выберите новое значение для поля <b>{label}</b>:",
            parse_mode="HTML",
            reply_markup=product_type_keyboard("edit:type"),
        )
    else:
        await state.set_state(EditProductSG.enter_value)
        hint = ""
        if field == "description":
            hint = " (от 10 до 1000 символов)"
        elif field == "price":
            hint = " (число ≥ 0)"
        elif field == "name":
            hint = " (минимум 1 символ)"
        await callback.message.edit_text(
            f"Введите новое значение для поля <b>{label}</b>{hint}:",
            parse_mode="HTML",
            reply_markup=cancel_keyboard(),
        )
    await callback.answer()


# ── Type via inline button ────────────────────────────────────────────────────


@router.callback_query(EditProductSG.enter_type, F.data.startswith("edit:type:"))
async def cb_edit_product_type(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    new_value = callback.data.split(":")[-1]
    await _apply_product_edit(callback, state, api_client, new_value)


# ── Text/numeric fields ────────────────────────────────────────────────────────


@router.message(EditProductSG.enter_value)
async def msg_edit_product_value(
    message: Message, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    data = await state.get_data()
    field = data["edit_field"]
    raw = message.text.strip()

    if field == "name" and len(raw) < 1:
        await message.answer("⚠️ Название не может быть пустым:")
        return
    if field == "description":
        if len(raw) < 10:
            await message.answer(
                f"⚠️ Слишком короткое описание ({len(raw)} симв.), минимум 10:"
            )
            return
        if len(raw) > 1000:
            await message.answer(
                f"⚠️ Слишком длинное описание ({len(raw)} симв.), максимум 1000:"
            )
            return
    if field == "price":
        try:
            value = float(raw)
            if value < 0:
                raise ValueError
        except ValueError:
            await message.answer("⚠️ Введите число ≥ 0, например: 1500")
            return
        raw = value

    await _apply_product_edit_msg(message, state, api_client, raw)


# ── Shared helpers ─────────────────────────────────────────────────────────────


async def _apply_product_edit(
    callback: CallbackQuery,
    state: FSMContext,
    api_client: httpx.AsyncClient,
    new_value,
) -> None:
    data = await state.get_data()
    product_id = data["product_id"]
    product_slug = data["product_slug"]
    field = data["edit_field"]
    await state.clear()

    try:
        current = await get_product(api_client, product_slug)
        payload = _build_product_payload(current, field, new_value)
        updated = await update_product(api_client, product_id, payload)
    except APIError as e:
        await callback.message.edit_text(f"❌ Ошибка: {e.message}")
        await callback.answer()
        return

    text = format_product_card(updated, full=True)
    await callback.message.edit_text(
        f"✅ Поле <b>{FIELD_LABELS.get(field, field)}</b> обновлено!\n\n{text}",
        parse_mode="HTML",
        reply_markup=product_actions_keyboard(product_id, updated["slug"]),
    )
    await callback.answer("✅ Сохранено")


async def _apply_product_edit_msg(
    message: Message,
    state: FSMContext,
    api_client: httpx.AsyncClient,
    new_value,
) -> None:
    data = await state.get_data()
    product_id = data["product_id"]
    product_slug = data["product_slug"]
    field = data["edit_field"]
    await state.clear()

    try:
        current = await get_product(api_client, product_slug)
        payload = _build_product_payload(current, field, new_value)
        updated = await update_product(api_client, product_id, payload)
    except APIError as e:
        await message.answer(f"❌ Ошибка: {e.message}")
        return

    text = format_product_card(updated, full=True)
    await message.answer(
        f"✅ Поле <b>{FIELD_LABELS.get(field, field)}</b> обновлено!\n\n{text}",
        parse_mode="HTML",
        reply_markup=product_actions_keyboard(product_id, updated["slug"]),
    )


def _build_product_payload(current: dict, changed_field: str, new_value) -> dict:
    """Build a full PUT payload from current product data with one field changed."""
    fields = ["name", "price", "type", "description"]
    payload = {f: current[f] for f in fields}
    payload[changed_field] = new_value
    return payload


# ── Cancel from edit state ─────────────────────────────────────────────────────


@router.callback_query(StateFilter(EditProductSG), F.data == "cancel")
async def cancel_edit_product(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    data = await state.get_data()
    product_id = data.get("product_id")
    product_slug = data.get("product_slug")
    await state.clear()

    if product_slug:
        try:
            product = await get_product(api_client, product_slug)
            text = format_product_card(product, full=True)
            await callback.message.edit_text(
                text,
                parse_mode="HTML",
                reply_markup=product_actions_keyboard(product_id, product_slug),
            )

        except APIError:
            await callback.message.edit_text("✅ Редактирование отменено.")
    else:
        await callback.message.edit_text("✅ Редактирование отменено.")
    await callback.answer()
