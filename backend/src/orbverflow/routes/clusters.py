from fastapi import APIRouter
from orbverflow.app_state import store, cluster_engine

router = APIRouter(prefix="/clusters", tags=["clusters"])


@router.get("/suggest")
async def suggest_clusters():
    latest = await store.latest_all()
    resp = cluster_engine.suggest_clusters(latest)
    return resp.model_dump()
