from fastapi import FastAPI

from orbverflow.routes.health import router as health_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Orbverflow Demo Backend",
        version="0.1.0",
    )

    # Routers
    app.include_router(health_router)

    return app

app = create_app()
