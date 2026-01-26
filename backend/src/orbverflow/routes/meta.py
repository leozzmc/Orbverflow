from fastapi import APIRouter
from orbverflow.app_state import prov_registry

router = APIRouter(prefix="/meta", tags=["meta"])

@router.get("/dataset")
def get_dataset_meta():
    meta = prov_registry.get_dataset()
    if not meta:
        return {"ok": True, "has_dataset": False, "dataset": None}
    return {"ok": True, "has_dataset": True, "dataset": meta}