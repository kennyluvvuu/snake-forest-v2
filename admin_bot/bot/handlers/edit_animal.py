import httpx
from aiogram import Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from api.animals import get_animal, update_animal
from api.client import APIError
from bot.keyboards.animals import (
    animal_actions_keyboard,
    edit_fields_keyboard,
    age_keyboard,
    sex_keyboard,
    cancel_keyboard,
)
from bot.states.animal import EditAnimalSG
from utils.formatters import format_animal_card

router = Router(name="edit_animal")

# Field display names for user-facing messages
FIELD_LABELS = {
    "commonName": "Название",
    "species": "Вид (species)",
    "morph": "Морф",
    "age": "Возраст",
    "sex": "Пол",
    "priority": "Приоритет",
    "price": "Цена",
    "description": "Описание",
}

# ── Open field selection menu ──────────────────────────────────────────────────


@router.callback_query(F.data.startswith("animal:edit:"))
async def cb_edit_menu(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        animal = await get_animal(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return

    await state.set_state(EditAnimalSG.choose_field)
    await state.update_data(animal_id=animal["id"], animal_slug=slug)
    await callback.message.edit_text(
        "✏️ <b>Редактирование.</b> Выберите поле:",
        parse_mode="HTML",
        reply_markup=edit_fields_keyboard(animal["id"], slug),
    )
    await callback.answer()


# ── Field selected ─────────────────────────────────────────────────────────────


@router.callback_query(
    StateFilter(EditAnimalSG.choose_field),
    F.data.startswith("animal:edit_field:"),
)
async def cb_field_selected(callback: CallbackQuery, state: FSMContext) -> None:
    # callback_data format: animal:edit_field:{animal_id}:{field}
    parts = callback.data.split(":")
    animal_id = parts[2]
    field = parts[3]

    await state.update_data(edit_field=field, animal_id=animal_id)
    label = FIELD_LABELS.get(field, field)

    if field == "age":
        await state.set_state(EditAnimalSG.enter_age)
        await callback.message.edit_text(
            f"Выберите новое значение для поля <b>{label}</b>:",
            parse_mode="HTML",
            reply_markup=age_keyboard(f"edit:age"),
        )
    elif field == "sex":
        await state.set_state(EditAnimalSG.enter_sex)
        await callback.message.edit_text(
            f"Выберите новое значение для поля <b>{label}</b>:",
            parse_mode="HTML",
            reply_markup=sex_keyboard("edit:sex"),
        )
    else:
        await state.set_state(EditAnimalSG.enter_value)
        hint = ""
        if field == "description":
            hint = " (от 25 до 500 символов)"
        elif field in ("priority", "price"):
            hint = " (число)"
        elif field in ("commonName", "morph"):
            hint = " (минимум 2 символа)"
        await callback.message.edit_text(
            f"Введите новое значение для поля <b>{label}</b>{hint}:",
            parse_mode="HTML",
            reply_markup=cancel_keyboard(),
        )
    await callback.answer()


# ── Enum fields via inline buttons ────────────────────────────────────────────


@router.callback_query(EditAnimalSG.enter_age, F.data.startswith("edit:age:"))
async def cb_edit_age(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    new_value = callback.data.split(":")[-1]
    await _apply_edit(callback, state, api_client, new_value)


@router.callback_query(EditAnimalSG.enter_sex, F.data.startswith("edit:sex:"))
async def cb_edit_sex(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    new_value = callback.data.split(":")[-1]
    await _apply_edit(callback, state, api_client, new_value)


# ── Text fields ────────────────────────────────────────────────────────────────


@router.message(EditAnimalSG.enter_value)
async def msg_edit_value(
    message: Message, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    data = await state.get_data()
    field = data["edit_field"]
    raw = message.text.strip()

    # Validate
    if field in ("commonName", "morph") and len(raw) < 2:
        await message.answer("⚠️ Минимум 2 символа. Попробуйте ещё раз:")
        return
    if field == "description":
        if len(raw) < 25:
            await message.answer(
                f"⚠️ Слишком короткое описание ({len(raw)} симв.), минимум 25:"
            )
            return
        if len(raw) > 500:
            await message.answer(
                f"⚠️ Слишком длинное описание ({len(raw)} симв.), максимум 500:"
            )
            return

    # Cast numeric fields
    if field in ("priority", "price"):
        try:
            raw = float(raw)
        except ValueError:
            await message.answer("⚠️ Введите число, например: 15000")
            return

    await _apply_edit_msg(message, state, api_client, raw)


# ── Shared helpers ─────────────────────────────────────────────────────────────


async def _apply_edit(
    callback: CallbackQuery,
    state: FSMContext,
    api_client: httpx.AsyncClient,
    new_value,
) -> None:
    data = await state.get_data()
    animal_id = data["animal_id"]
    animal_slug = data["animal_slug"]
    field = data["edit_field"]
    await state.clear()

    try:
        # Fetch current data to fill all required fields for PUT
        current = await get_animal(api_client, animal_slug)
        payload = _build_payload(current, field, new_value)
        updated = await update_animal(api_client, animal_id, payload)
    except APIError as e:
        await callback.message.edit_text(f"❌ Ошибка: {e.message}")
        await callback.answer()
        return

    text = format_animal_card(updated, full=True)
    await callback.message.edit_text(
        f"✅ Поле <b>{FIELD_LABELS.get(field, field)}</b> обновлено!\n\n{text}",
        parse_mode="HTML",
        reply_markup=animal_actions_keyboard(animal_id, updated["slug"]),
    )
    await callback.answer("✅ Сохранено")


async def _apply_edit_msg(
    message: Message,
    state: FSMContext,
    api_client: httpx.AsyncClient,
    new_value,
) -> None:
    data = await state.get_data()
    animal_id = data["animal_id"]
    animal_slug = data["animal_slug"]
    field = data["edit_field"]
    await state.clear()

    try:
        current = await get_animal(api_client, animal_slug)
        payload = _build_payload(current, field, new_value)
        updated = await update_animal(api_client, animal_id, payload)
    except APIError as e:
        await message.answer(f"❌ Ошибка: {e.message}")
        return

    text = format_animal_card(updated, full=True)
    await message.answer(
        f"✅ Поле <b>{FIELD_LABELS.get(field, field)}</b> обновлено!\n\n{text}",
        parse_mode="HTML",
        reply_markup=animal_actions_keyboard(animal_id, updated["slug"]),
    )


def _build_payload(current: dict, changed_field: str, new_value) -> dict:
    """Build a full PUT payload from current animal data with one field changed."""
    fields = [
        "commonName",
        "species",
        "morph",
        "age",
        "sex",
        "priority",
        "price",
        "description",
    ]
    payload = {f: current[f] for f in fields}
    payload[changed_field] = new_value
    return payload


# ── Cancel from edit state ─────────────────────────────────────────────────────


@router.callback_query(StateFilter(EditAnimalSG), F.data == "cancel")
async def cancel_edit(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    data = await state.get_data()
    animal_id = data.get("animal_id")
    animal_slug = data.get("animal_slug")
    await state.clear()

    if animal_slug:
        try:
            animal = await get_animal(api_client, animal_slug)
            text = format_animal_card(animal, full=True)
            await callback.message.edit_text(
                text,
                parse_mode="HTML",
                reply_markup=animal_actions_keyboard(animal_id, animal_slug),
            )

        except APIError:
            await callback.message.edit_text("✅ Редактирование отменено.")
    else:
        await callback.message.edit_text("✅ Редактирование отменено.")
    await callback.answer()
