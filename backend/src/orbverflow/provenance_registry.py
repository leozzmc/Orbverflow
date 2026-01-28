from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class DatasetMeta(BaseModel):
    source_vendor: str
    source_dataset_id: str
    mapping_version: Optional[str] = None
    files: List[str] = []


DEFAULT_SIM_META = DatasetMeta(
    source_vendor="SIM",
    source_dataset_id="SIM_DEMO_2026_01",
    mapping_version=None,
    files=["simulator"],
)


class ProvenanceRegistry:
    """
    Keeps current dataset meta so UI can show Vendor/Dataset/Mapping badge.

    Issue-10 fix:
    - Provide a SIM default meta at startup so /meta/dataset won't return has_dataset=false
      (prevents UI showing Vendor: unknown).
    """

    def __init__(self) -> None:
        self._dataset: Optional[DatasetMeta] = DEFAULT_SIM_META

    def set_dataset(self, meta: DatasetMeta) -> None:
        self._dataset = meta

    def get_dataset(self) -> Optional[Dict[str, Any]]:
        if not self._dataset:
            return None
        # pydantic v1/v2 compatible
        return self._dataset.model_dump() if hasattr(self._dataset, "model_dump") else self._dataset.dict()

    def ensure_default(self) -> None:
        """Call this if you ever want to re-apply default when dataset becomes None."""
        if self._dataset is None:
            self._dataset = DEFAULT_SIM_META
