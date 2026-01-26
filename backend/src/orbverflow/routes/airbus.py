from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from orbverflow.app_state import store, prov_registry
from orbverflow.provenance_registry import DatasetMeta
from orbverflow.airbus.pack_loader import load_airbus_pack

router = APIRouter(prefix="/airbus", tags=["airbus"])

class LoadRequest(BaseModel):
    pack_dir: str
    mapping_path: Optional[str] = None
    source_vendor: str = "AIRBUS"
    source_dataset_id: str = "AIRBUS_PACK_DEMO"
    mapping_version: str = "v0.1"
    meta_only: bool = False 

@router.post("/load")
async def load_pack(req: LoadRequest):

    # --- Register dataset meta first（if data exisit or not） ---
    prov_registry.set_dataset(
        DatasetMeta(
            source_vendor=req.source_vendor,
            source_dataset_id=req.source_dataset_id,
            mapping_version=req.mapping_version,
            files=[],
        )
    )

    # --- meta-only mode ---
    if req.meta_only:
        return {
            "ok": True,
            "mode": "meta_only",
            "ingested": 0,
            "dataset": prov_registry.get_dataset(),
        }

    # --- Normal ingest mode ---
    records, files = load_airbus_pack(
        pack_dir=req.pack_dir,
        mapping_path=req.mapping_path,
        source_vendor=req.source_vendor,
        source_dataset_id=req.source_dataset_id,
        mapping_version=req.mapping_version,
    )

    prov_registry.set_dataset(
        DatasetMeta(
            source_vendor=req.source_vendor,
            source_dataset_id=req.source_dataset_id,
            mapping_version=req.mapping_version,
            files=files,
        )
    )

    await store.add_records(records)

    return {"ok": True, "ingested": len(records), "files": files}
