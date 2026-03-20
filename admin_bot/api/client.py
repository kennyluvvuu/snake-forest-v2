import httpx

from config import settings


class APIError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")


def build_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=settings.api_base_url,
        headers={
            "X-API-Key": settings.api_key,
        },
        timeout=90.0,
    )


async def handle_response(response: httpx.Response) -> dict | list:
    try:
        data = response.json()
    except Exception:
        data = None

    if response.status_code in (200, 201):
        return data if data is not None else {}

    message = "Unknown error"
    if isinstance(data, dict):
        message = data.get("message", "Unknown error")
    elif response.text:
        message = response.text

    raise APIError(status_code=response.status_code, message=message)
