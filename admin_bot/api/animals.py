import httpx

from api.client import handle_response


async def get_animals(client: httpx.AsyncClient) -> list[dict]:
    response = await client.get("/animals/")
    return await handle_response(response)


async def get_animal(client: httpx.AsyncClient, slug: str) -> dict:
    response = await client.get(f"/animals/{slug}")
    return await handle_response(response)


async def create_animal(client: httpx.AsyncClient, data: dict) -> dict:
    response = await client.post("/animals/", json=data)
    return await handle_response(response)


async def update_animal(client: httpx.AsyncClient, animal_id: str, data: dict) -> dict:
    response = await client.put(f"/animals/{animal_id}", json=data)
    return await handle_response(response)


async def delete_animal(client: httpx.AsyncClient, animal_id: str) -> dict:
    response = await client.delete(f"/animals/{animal_id}")
    return await handle_response(response)


async def upload_images(client: httpx.AsyncClient, animal_id: str, files: list[tuple]) -> dict:
    """
    files: list of (filename, file_bytes, content_type)
    Sends multipart/form-data to POST /animals/{id}/images
    """
    for name, data, ctype in files:
        print(f"{name}: {len(data)} bytes, type={type(data)}")
    multipart = [
        ("image", (name, data, ctype))
        for name, data, ctype in files
    ]
    # Create a separate client without Content-Type issues
    async with httpx.AsyncClient(
        base_url=str(client.base_url),
        headers={"X-API-Key": client.headers["x-api-key"]},
        timeout=30.0,
    ) as temp_client:
        response = await temp_client.put(
            f"/animals/{animal_id}/images",
            files=multipart,
        )
    return await handle_response(response)


async def replace_images(client: httpx.AsyncClient, animal_id: str, files: list[tuple]) -> dict:
    """
    files: list of (filename, file_bytes, content_type)
    Sends multipart/form-data to PUT /animals/{id}/images
    """
    for name, data, ctype in files:
        print(f"{name}: {len(data)} bytes, type={type(data)}")
    multipart = [
        ("image", (name, data, ctype))
        for name, data, ctype in files
    ]
    # Create a separate client without Content-Type issues
    async with httpx.AsyncClient(
        base_url=str(client.base_url),
        headers={"X-API-Key": client.headers["x-api-key"]},
        timeout=30.0,
    ) as temp_client:
        response = await temp_client.post(
            f"/animals/{animal_id}/images",
            files=multipart,
        )
    return await handle_response(response)
