from enum import Enum

class Scenario(str, Enum):
    NORMAL = "NORMAL"
    JAMMING = "JAMMING"
    SATB_DOWN = "SATB_DOWN"
    SPOOFING = "SPOOFING"
