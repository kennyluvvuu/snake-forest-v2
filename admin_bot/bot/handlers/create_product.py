import httpx
from aiogram import Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery

from api.products import create_product
from api.client import APIError
from bot.keyboards.products import product_type_keyboard, cancel_keyboard
from bot.keyboards.main_menu import main_menu_keyboard
from bot.states.product import CreateProductSG

router = Router(name="create_product")

# ── Entry point ────────────────────────────────────────────────────────────────

@router.message(F.text == "➕ Добавить товар")
async def start_create_product(message: Message, state: FSMContext) -> None:
    await state.set_state(CreateProductSG.name)
    await message.answer(
        "➕ <b>Добавление нового товара</b>\n\nШаг 1/4 — Введите <b>название</b> товара:\n"
        "<i>Например: Поилка автоматическая</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Cancel via inline button ───────────────────────────────────────────────────

@router.callback_query(StateFilter(CreateProductSG), F.data == "cancel")
async def cancel_create_product(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await callback.message.answer("✅ Добавление отменено.", reply_markup=main_menu_keyboard())
    await callback.answer()

# ── Step 1: name ──────────────────────────────────────────────────────────────

@router.message(CreateProductSG.name)
async def step_product_name(message: Message, state: FSMContext) -> None:
    if len(message.text.strip()) < 1:
        await message.answer("⚠️ Название не может быть пустым. Попробуйте ещё раз:")
        return
    await state.update_data(name=message.text.strip())
    await state.set_state(CreateProductSG.type_)
    await message.answer(
        "Шаг 2/4 — Выберите <b>тип</b> товара:",
        parse_mode="HTML",
        reply_markup=product_type_keyboard("create:type"),
    )

# ── Step 2: type ──────────────────────────────────────────────────────────────

@router.callback_query(CreateProductSG.type_, F.data.startswith("create:type:"))
async def step_product_type(callback: CallbackQuery, state: FSMContext) -> None:
    type_value = callback.data.split(":")[-1]
    await state.update_data(type=type_value)
    await state.set_state(CreateProductSG.price)
    await callback.message.edit_text(
        "Шаг 3/4 — Введите <b>цену</b> (₽), минимум 0:",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )
    await callback.answer()

# ── Step 3: price ─────────────────────────────────────────────────────────────

@router.message(CreateProductSG.price)
async def step_product_price(message: Message, state: FSMContext) -> None:
    try:
        price = float(message.text.strip())
        if price < 0:
            raise ValueError
    except ValueError:
        await message.answer("⚠️ Введите корректное число ≥ 0, например: 1500 или 99.99")
        return
    await state.update_data(price=price)
    await state.set_state(CreateProductSG.description)
    await message.answer(
        "Шаг 4/4 — Введите <b>описание</b> (от 10 до 1000 символов):",
        parse_mode="HTML",
        reply_markup=cancel_keyboard(),
    )

# ── Step 4: description + submit ──────────────────────────────────────────────

@router.message(CreateProductSG.description)
async def step_product_description(message: Message, state: FSMContext, api_client: httpx.AsyncClient) -> None:
    text = message.text.strip()
    if len(text) < 10:
        await message.answer(f"⚠️ Описание слишком короткое ({len(text)} симв.). Минимум 10 символов:")
        return
    if len(text) > 1000:
        await message.answer(f"⚠️ Описание слишком длинное ({len(text)} симв.). Максимум 1000 символов:")
        return

    data = await state.get_data()
    data["description"] = text
    await state.clear()

    try:
        product = await create_product(api_client, data)
    except APIError as e:
        await message.answer(
            f"❌ Ошибка при создании: <b>{e.message}</b>",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )
        return

    await message.answer(
        f"✅ Товар успешно добавлен!\n\n🆔 ID: <code>{product['id']}</code>",
        parse_mode="HTML",
        reply_markup=main_menu_keyboard(),
    )
