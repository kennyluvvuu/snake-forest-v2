from aiogram.fsm.state import State, StatesGroup


class CreateAnimalSG(StatesGroup):
    """Step-by-step form for creating a new animal."""
    common_name = State()
    species = State()
    morph = State()
    age = State()
    sex = State()
    priority = State()
    price = State()
    description = State()


class EditAnimalSG(StatesGroup):
    """Single-field edit: user picks a field, then enters new value."""
    choose_field = State()   # handled via inline keyboard, no text input
    enter_value = State()    # waiting for text input
    enter_age = State()      # waiting for inline button (enum)
    enter_sex = State()      # waiting for inline button (enum)


class ImagesSG(StatesGroup):
    """Collecting photo uploads for an animal."""
    waiting_photos = State()
