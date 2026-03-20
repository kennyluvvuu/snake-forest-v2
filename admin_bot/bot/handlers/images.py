from io import BytesIO

import httpx
from aiogram import Router, F, Bot
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from api.animals import upload_images, replace_images, get_animal
from api.client import APIError
from bot.keyboards.animals import animal_actions_keyboard, cancel_keyboard
from bot.states.animal import ImagesSG

router = Router(name="images")

MODE_ADD = "add"
MODE_REPLACE = "replace"

# ── Entry points ───────────────────────────────────────────────────────────────


@router.callback_query(F.data.startswith("animal:img_add:"))
async def cb_img_add(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        animal = await get_animal(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return
    await _start_upload(callback, state, animal["id"], slug, MODE_ADD)


@router.callback_query(F.data.startswith("animal:img_replace:"))
async def cb_img_replace(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient
) -> None:
    slug = callback.data.split(":", 2)[2]
    try:
        animal = await get_animal(api_client, slug)
    except APIError as e:
        await callback.answer(f"❌ {e.message}", show_alert=True)
        return
    await _start_upload(callback, state, animal["id"], slug, MODE_REPLACE)


async def _start_upload(
    callback: CallbackQuery, state: FSMContext, animal_id: str, slug: str, mode: str
) -> None:
    await state.set_state(ImagesSG.waiting_photos)
    await state.update_data(animal_id=animal_id, animal_slug=slug, mode=mode, photos=[])

    verb = "добавлены к существующим" if mode == MODE_ADD else "заменят все текущие"
    await callback.message.edit_text(
        f"📸 Отправьте фотографии (до 10 штук).\n"
        f"Они будут <b>{verb}</b>.\n\n"
        f"Когда закончите — нажмите <b>✅ Готово</b>.\n"
        f"Можно отправлять по одному или альбомом.",
        parse_mode="HTML",
        reply_markup=_done_cancel_keyboard(),
    )
    await callback.answer()


# ── Collect photos ─────────────────────────────────────────────────────────────


@router.message(ImagesSG.waiting_photos, F.photo)
async def collect_photo(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    photos: list = data.get("photos", [])

    if len(photos) >= 10:
        await message.answer(
            "⚠️ Максимум 10 фотографий. Нажмите ✅ Готово для загрузки."
        )
        return

    # Take the highest resolution version
    file_id = message.photo[-1].file_id
    photos.append(file_id)
    await state.update_data(photos=photos)
    await message.answer(
        f"📎 Добавлено: {len(photos)} фото. Отправьте ещё или нажмите ✅ Готово.",
        reply_markup=_done_cancel_keyboard(),
    )


# ── Submit ─────────────────────────────────────────────────────────────────────


@router.callback_query(ImagesSG.waiting_photos, F.data == "images:done")
async def cb_images_done(
    callback: CallbackQuery, state: FSMContext, api_client: httpx.AsyncClient, bot: Bot
) -> None:
    data = await state.get_data()
    animal_id = data["animal_id"]
    animal_slug = data["animal_slug"]
    mode = data["mode"]
    photo_ids: list[str] = data.get("photos", [])

    if not photo_ids:
        await callback.answer("⚠️ Вы не отправили ни одного фото!", show_alert=True)
        return

    await callback.message.edit_text("⏳ Загружаю фотографии...")
    await callback.answer()

    # Download each photo from Telegram and collect as bytes
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
            result = await upload_images(api_client, animal_id, files)
        else:
            result = await replace_images(api_client, animal_id, files)
    except APIError as e:
        await callback.message.edit_text(
            f"❌ Ошибка при загрузке фото: {e.message}",
            reply_markup=animal_actions_keyboard(animal_id, animal_slug),
        )
        return

    uploaded_count = len(result.get("uploads", []))
    verb = "добавлено" if mode == MODE_ADD else "заменено"
    await callback.message.edit_text(
        f"✅ Успешно {verb} {uploaded_count} фото!",
        reply_markup=animal_actions_keyboard(animal_id, animal_slug),
    )


# ── Cancel ─────────────────────────────────────────────────────────────────────


@router.callback_query(StateFilter(ImagesSG), F.data == "cancel")
async def cb_cancel_images(callback: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    animal_id = data.get("animal_id")
    animal_slug = data.get("animal_slug")
    await state.clear()
    await callback.message.edit_text(
        "✅ Загрузка фото отменена.",
        reply_markup=animal_actions_keyboard(animal_id, animal_slug)
        if animal_slug
        else None,
    )
    await callback.answer()


# ── Helpers ────────────────────────────────────────────────────────────────────


def _done_cancel_keyboard():
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Готово", callback_data="images:done"),
                InlineKeyboardButton(text="❌ Отмена", callback_data="cancel"),
            ]
        ]
    )
