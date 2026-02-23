import httpx

from api.client import handle_response


async def get_animals(client: httpx.AsyncClient) -> list[dict]:
    response = await client.get("/animals/")
    return await handle_response(response)


async def get_animal(client: httpx.AsyncClient, animal_id: str) -> dict:
    response = await client.get(f"/animals/{animal_id}")
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
    multipart = [("files", (name, data, ctype)) for name, data, ctype in files]
    # Remove Content-Type for multipart — httpx sets it automatically
    headers = {k: v for k, v in client.headers.items() if k.lower() != "content-type"}
    response = await client.post(
        f"/animals/{animal_id}/images",
        files=multipart,
        headers=headers,
    )
    return await handle_response(response)


async def replace_images(client: httpx.AsyncClient, animal_id: str, files: list[tuple]) -> dict:
    """
    files: list of (filename, file_bytes, content_type)
    Sends multipart/form-data to PUT /animals/{id}/images
    """
    multipart = [("files", (name, data, ctype)) for name, data, ctype in files]
    headers = {k: v for k, v in client.headers.items() if k.lower() != "content-type"}
    response = await client.put(
        f"/animals/{animal_id}/images",
        files=multipart,
        headers=headers,
    )
    return await handle_response(response)
