from io import BytesIO

import httpx
from aiogram import Router, F, Bot
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    CallbackQuery,
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)

from api.products import upload_product_images, replace_product_images, get_product
from api.client import APIError
from bot.keyboards.products import product_actions_keyboard
from bot.states.product import ProductImagesSG

router = Router(name="product_images")

MODE_ADD = "add"
MODE_REPLACE = "replace"

# ── Entry points ───────────────────────────────────────────────────────────────


@router.callback_query(F.data.startswith("product:img_add:"))
async def cb_product_img_add(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        product = await get_product(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return
    await _start_product_upload(callback, state, product["id"], slug, MODE_ADD)


@router.callback_query(F.data.startswith("product:img_replace:"))
async def cb_product_img_replace(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        product = await get_product(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return
    await _start_product_upload(callback, state, product["id"], slug, MODE_REPLACE)


async def _start_product_upload(
    callback: CallbackQuery, state: FSMContext, product_id: str, slug: str, mode: str
) -> None:
    await state.set_state(ProductImagesSG.waiting_photos)
    await state.update_data(
        product_id=product_id, product_slug=slug, mode=mode, photos=[]
    )

    verb = "добавлены к существующим" if mode == MODE_ADD else "заменят все текущие"
    await callback.message.edit_text(
        f"📸 Отправьте фотографии (до 10 штук).\n"
        f"Они будут <b>{verb}</b>.\n\n"
        f"Когда закончите — нажмите <b>✅ Готово</b>.\n"
        f"Можно отправлять по одному или альбомом.",
        parse_mode="HTML",
        reply_markup=_product_done_cancel_keyboard(),
    )
    await callback.answer()


# ── Collect photos ─────────────────────────────────────────────────────────────


@router.message(ProductImagesSG.waiting_photos, F.photo)
async def collect_product_photo(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    photos: list = data.get("photos", [])

    if len(photos) >= 10:
        await message.answer(
            "⚠️ Максимум 10 фотографий. Нажмите ✅ Готово для загрузки."
        )
        return

    file_id = message.photo[-1].file_id
    photos.append(file_id)
    await state.update_data(photos=photos)
    await message.answer(
        f"📎 Добавлено: {len(photos)} фото. Отправьте ещё или нажмите ✅ Готово.",
        reply_markup=_product_done_cancel_keyboard(),
    )


# ── Submit ─────────────────────────────────────────────────────────────────────


@router.callback_query(ProductImagesSG.waiting_photos, F.data == "product_images:done")
async def cb_product_images_done(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient, bot: Bot
) -> None:
    data = await state.get_data()
    product_id = data["product_id"]
    product_slug = data["product_slug"]
    mode = data["mode"]
    photo_ids: list[str] = data.get("photos", [])

    if not photo_ids:
        await callback.answer("⚠️ Вы не отправили ни одного фото!", show_alert=True)
        return

    await callback.message.edit_text("⏳ Загружаю фотографии...")
    await callback.answer()

    files: list[tuple] = []
    for idx, file_id in enumerate(photo_ids):
        tg_file = await bot.get_file(file_id)
        file_bytes: BytesIO = await bot.download_file(tg_file.file_path)
        raw = file_bytes.getvalue()
        filename = f"photo_{idx + 1}.jpg"
        files.append((filename, raw, "image/jpeg"))

    await state.clear()

    try:
        if mode == MODE_ADD:
            result = await upload_product_images(api_client, product_id, files)
        else:
            result = await replace_product_images(api_client, product_id, files)
    except APIError as e:
        await callback.message.edit_text(
            f"❌ Ошибка при загрузке фото: {e.message}",
            reply_markup=product_actions_keyboard(product_id, product_slug),
        )
        return

    uploaded_count = len(result.get("uploads", []))
    verb = "добавлено" if mode == MODE_ADD else "заменено"
    await callback.message.edit_text(
        f"✅ Успешно {verb} {uploaded_count} фото!",
        reply_markup=product_actions_keyboard(product_id, product_slug),
    )


# ── Cancel ─────────────────────────────────────────────────────────────────────


@router.callback_query(StateFilter(ProductImagesSG), F.data == "cancel")
async def cb_cancel_product_images(callback: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    product_id = data.get("product_id")
    product_slug = data.get("product_slug")
    await state.clear()
    await callback.message.edit_text(
        "✅ Загрузка фото отменена.",
        reply_markup=product_actions_keyboard(product_id, product_slug)
        if product_slug
        else None,
    )
    await callback.answer()


# ── Helpers ────────────────────────────────────────────────────────────────────


def _product_done_cancel_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Готово", callback_data="product_images:done"
                ),
                InlineKeyboardButton(text="❌ Отмена", callback_data="cancel"),
            ]
        ]
    )
