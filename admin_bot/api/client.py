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
            "Content-Type": "application/json",
        },
        timeout=90.0,
    )


async def handle_response(response: httpx.Response) -> dict | list:
    if response.status_code in (200, 201):
        return response.json()
    try:
        error_data = response.json()
        message = error_data.get("message", "Unknown error")
    except Exception:
        message = response.text or "Unknown error"
    raise APIError(status_code=response.status_code, message=message)
