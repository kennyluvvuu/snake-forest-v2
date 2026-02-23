import httpx
from aiogram import Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery

from api.animals import create_animal
from api.client import APIError
from bot.keyboards.animals import age_keyboard, sex_keyboard, cancel_keyboard
from bot.keyboards.main_menu import main_menu_keyboard
from bot.states.animal import CreateAnimalSG

router = Router(name="create_animal")

# ── Entry point ────────────────────────────────────────────────────────────────

@router.message(F.text == "➕ Добавить животное")
async def start_create(message: Message, state: FSMContext) -> None:
    await state.set_state(CreateAnimalSG.common_name)
    await message.answer(
        "➕ <b>Добавление нового животного</b>\n\nШаг 1/8 — Введите <b>название</b> (commonName):\n"
        "<i>Например: Королевский питон</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Cancel via inline button ───────────────────────────────────────────────────

@router.callback_query(StateFilter(CreateAnimalSG), F.data == "cancel")
async def cancel_create(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await callback.message.answer("✅ Добавление отменено.", reply_markup=main_menu_keyboard())
    await callback.answer()

# ── Step 1: commonName ────────────────────────────────────────────────────────

@router.message(CreateAnimalSG.common_name)
async def step_common_name(message: Message, state: FSMContext) -> None:
    if len(message.text.strip()) < 2:
        await message.answer("⚠️ Название должно быть не менее 2 символов. Попробуйте ещё раз:")
        return
    await state.update_data(commonName=message.text.strip())
    await state.set_state(CreateAnimalSG.species)
    await message.answer(
        "Шаг 2/8 — Введите <b>вид</b> (species):\n<i>Например: Python regius</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Step 2: species ───────────────────────────────────────────────────────────

@router.message(CreateAnimalSG.species)
async def step_species(message: Message, state: FSMContext) -> None:
    await state.update_data(species=message.text.strip())
    await state.set_state(CreateAnimalSG.morph)
    await message.answer(
        "Шаг 3/8 — Введите <b>морф</b>:\n<i>Например: Spider, Pied, Normal</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Step 3: morph ─────────────────────────────────────────────────────────────

@router.message(CreateAnimalSG.morph)
async def step_morph(message: Message, state: FSMContext) -> None:
    if len(message.text.strip()) < 2:
        await message.answer("⚠️ Морф должен быть не менее 2 символов. Попробуйте ещё раз:")
        return
    await state.update_data(morph=message.text.strip())
    await state.set_state(CreateAnimalSG.age)
    await message.answer(
        "Шаг 4/8 — Выберите <b>возраст</b>:",
        parse_mode="HTML",
        reply_markup=age_keyboard("create:age"),
    )

# ── Step 4: age ───────────────────────────────────────────────────────────────

@router.callback_query(CreateAnimalSG.age, F.data.startswith("create:age:"))
async def step_age(callback: CallbackQuery, state: FSMContext) -> None:
    age_value = callback.data.split(":")[-1]
    await state.update_data(age=age_value)
    await state.set_state(CreateAnimalSG.sex)
    await callback.message.edit_text(
        "Шаг 5/8 — Выберите <b>пол</b>:",
        parse_mode="HTML",
        reply_markup=sex_keyboard("create:sex"),
    )
    await callback.answer()

# ── Step 5: sex ───────────────────────────────────────────────────────────────

@router.callback_query(CreateAnimalSG.sex, F.data.startswith("create:sex:"))
async def step_sex(callback: CallbackQuery, state: FSMContext) -> None:
    sex_value = callback.data.split(":")[-1]
    await state.update_data(sex=sex_value)
    await state.set_state(CreateAnimalSG.priority)
    await callback.message.edit_text(
        "Шаг 6/8 — Введите <b>приоритет</b> (число, чем выше — тем выше в списке):",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )
    await callback.answer()

# ── Step 6: priority ──────────────────────────────────────────────────────────

@router.message(CreateAnimalSG.priority)
async def step_priority(message: Message, state: FSMContext) -> None:
    try:
        priority = float(message.text.strip())
    except ValueError:
        await message.answer("⚠️ Введите число, например: 1 или 5.5")
        return
    await state.update_data(priority=priority)
    await state.set_state(CreateAnimalSG.price)
    await message.answer(
        "Шаг 7/8 — Введите <b>цену</b> (₽):",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Step 7: price ─────────────────────────────────────────────────────────────

@router.message(CreateAnimalSG.price)
async def step_price(message: Message, state: FSMContext) -> None:
    try:
        price = float(message.text.strip())
    except ValueError:
        await message.answer("⚠️ Введите число, например: 15000 или 12500.50")
        return
    await state.update_data(price=price)
    await state.set_state(CreateAnimalSG.description)
    await message.answer(
        "Шаг 8/8 — Введите <b>описание</b> (от 25 до 500 символов):",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Step 8: description + submit ─────────────────────────────────────────────

@router.message(CreateAnimalSG.description)
async def step_description(message: Message, state: FSMContext, api_client: httpx.AsyncClient) -> None:
    text = message.text.strip()
    if len(text) < 25:
        await message.answer(f"⚠️ Описание слишком короткое ({len(text)} симв.). Минимум 25 символов:")
        return
    if len(text) > 500:
        await message.answer(f"⚠️ Описание слишком длинное ({len(text)} симв.). Максимум 500 символов:")
        return

    data = await state.get_data()
    data["description"] = text
    await state.clear()

    try:
        animal = await create_animal(api_client, data)
    except APIError as e:
        await message.answer(
            f"❌ Ошибка при создании: <b>{e.message}</b>",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )
        return

    await message.answer(
        f"✅ Животное успешно добавлено!\n\n🆔 ID: <code>{animal['id']}</code>",
        parse_mode="HTML",
        reply_markup=main_menu_keyboard(),
    )
