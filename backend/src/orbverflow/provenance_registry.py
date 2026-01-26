from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

@dataclass
class DatasetMeta:
    source_vendor: str
    source_dataset_id: str
    mapping_version: str
    files: List[str]

class ProvenanceRegistry:
    def __init__(self) -> None:
        self._meta: Optional[DatasetMeta] = None

    def set_dataset(self, meta: DatasetMeta) -> None:
        self._meta = meta

    def get_dataset(self) -> Optional[Dict[str, Any]]:
        return asdict(self._meta) if self._meta else None
