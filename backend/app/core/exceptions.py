"""Domain exceptions raised by services and translated to HTTP responses in one place (app.main)."""


class AppError(Exception):
    status_code = 400

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class NotFoundError(AppError):
    status_code = 404


class ConflictError(AppError):
    status_code = 409


class ValidationFailedError(AppError):
    status_code = 422


class AuthenticationError(AppError):
    status_code = 401
