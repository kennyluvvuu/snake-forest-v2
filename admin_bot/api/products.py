import httpx

from api.client import handle_response


async def get_products(client: httpx.AsyncClient) -> list[dict]:
    response = await client.get("/products/")
    return await handle_response(response)


async def get_product(client: httpx.AsyncClient, product_id: str) -> dict:
    response = await client.get(f"/products/{product_id}")
    return await handle_response(response)


async def create_product(client: httpx.AsyncClient, data: dict) -> dict:
    response = await client.post("/products/", json=data)
    return await handle_response(response)


async def update_product(client: httpx.AsyncClient, product_id: str, data: dict) -> dict:
    response = await client.put(f"/products/{product_id}", json=data)
    return await handle_response(response)


async def delete_product(client: httpx.AsyncClient, product_id: str) -> dict:
    response = await client.delete(f"/products/{product_id}")
    return await handle_response(response)


async def upload_product_images(client: httpx.AsyncClient, product_id: str, files: list[tuple]) -> dict:
    """
    files: list of (filename, file_bytes, content_type)
    Sends multipart/form-data to PUT /products/{id}/images
    """
    multipart = [
        ("image", (name, data, ctype))
        for name, data, ctype in files
    ]
    async with httpx.AsyncClient(
        base_url=str(client.base_url),
        headers={"X-API-Key": client.headers["x-api-key"]},
        timeout=30.0,
    ) as temp_client:
        response = await temp_client.put(
            f"/products/{product_id}/images",
            files=multipart,
        )
    return await handle_response(response)


async def replace_product_images(client: httpx.AsyncClient, product_id: str, files: list[tuple]) -> dict:
    """
    files: list of (filename, file_bytes, content_type)
    Sends multipart/form-data to POST /products/{id}/images
    """
    multipart = [
        ("image", (name, data, ctype))
        for name, data, ctype in files
    ]
    async with httpx.AsyncClient(
        base_url=str(client.base_url),
        headers={"X-API-Key": client.headers["x-api-key"]},
        timeout=30.0,
    ) as temp_client:
        response = await temp_client.post(
            f"/products/{product_id}/images",
            files=multipart,
        )
    return await handle_response(response)
