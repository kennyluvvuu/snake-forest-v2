from aiogram.fsm.state import State, StatesGroup


class CreateProductSG(StatesGroup):
    """Step-by-step form for creating a new product."""
    name = State()
    type_ = State()
    price = State()
    description = State()


class EditProductSG(StatesGroup):
    """Single-field edit: user picks a field, then enters new value."""
    choose_field = State()   # handled via inline keyboard, no text input
    enter_value = State()    # waiting for text input
    enter_type = State()     # waiting for inline button (enum)


class ProductImagesSG(StatesGroup):
    """Collecting photo uploads for a product."""
    waiting_photos = State()
