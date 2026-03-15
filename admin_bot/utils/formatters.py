AGE_RU = {"young": "Молодой", "adult": "Взрослый", "elderly": "Пожилой"}
SEX_RU = {"male": "Самец", "female": "Самка", "unknown": "Неизвестно"}
PRODUCT_TYPE_RU = {"toy": "🧸 Игрушка", "usable": "🔧 Расходник", "food": "🍖 Корм"}


def format_animal_card(animal: dict, full: bool = False) -> str:
    """Format animal data as a readable Telegram message."""
    age = AGE_RU.get(animal.get("age", ""), animal.get("age", "—"))
    sex = SEX_RU.get(animal.get("sex", ""), animal.get("sex", "—"))
    price = animal.get("price", 0)

    lines = [
        f"🐍 <b>{animal.get('commonName', '—')}</b>",
        f"<i>{animal.get('species', '—')}</i>",
        "",
        f"🔸 Морф: <b>{animal.get('morph', '—')}</b>",
        f"📅 Возраст: {age}",
        f"⚥ Пол: {sex}",
        f"💰 Цена: <b>{price} ₽</b>",
        f"⭐ Приоритет: {animal.get('priority', '—')}",
    ]

    if full:
        description = animal.get("description", "")
        if description:
            lines += ["", f"📝 <b>Описание:</b>", description]
        images = animal.get("imagesUrl", [])
        if images:
            lines += ["", f"🖼 Фото: {len(images)} шт."]
        
        slug = animal.get("slug")
        if slug:
            lines += ["", f"🔗 <a href='https://snake-forest.ru/animals/{slug}'>Смотреть на сайте</a>"]
        
        lines += ["", f"🆔 ID: <code>{animal.get('id', '—')}</code>"]

    return "\n".join(lines)


def format_animal_list_item(animal: dict, index: int) -> str:
    """One-line format for list display."""
    age = AGE_RU.get(animal.get("age", ""), "")
    sex = SEX_RU.get(animal.get("sex", ""), "")
    return (
        f"{index}. <b>{animal.get('commonName', '—')}</b> "
        f"— {animal.get('morph', '—')} | {age} | {sex} | "
        f"{animal.get('price', 0)} ₽"
    )


def format_product_card(product: dict, full: bool = False) -> str:
    """Format product data as a readable Telegram message."""
    type_label = PRODUCT_TYPE_RU.get(product.get("type", ""), product.get("type", "—"))
    price = product.get("price", 0)

    lines = [
        f"🛒 <b>{product.get('name', '—')}</b>",
        f"<i>{type_label}</i>",
        "",
        f"💰 Цена: <b>{price} ₽</b>",
    ]

    if full:
        description = product.get("description", "")
        if description:
            lines += ["", f"📝 <b>Описание:</b>", description]
        images = product.get("imagesUrl", [])
        if images:
            lines += ["", f"🖼 Фото: {len(images)} шт."]
        
        slug = product.get("slug")
        if slug:
            lines += ["", f"🔗 <a href='https://snake-forest.ru/shop/{slug}'>Смотреть на сайте</a>"]

        lines += ["", f"🆔 ID: <code>{product.get('id', '—')}</code>"]

    return "\n".join(lines)


def format_product_list_item(product: dict, index: int) -> str:
    """One-line format for product list display."""
    type_label = PRODUCT_TYPE_RU.get(product.get("type", ""), product.get("type", ""))
    return (
        f"{index}. <b>{product.get('name', '—')}</b> "
        f"— {type_label} | {product.get('price', 0)} ₽"
    )
