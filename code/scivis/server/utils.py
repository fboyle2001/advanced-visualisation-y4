from dataclasses import dataclass
from typing import Tuple, Dict, Any, Self
from hashlib import sha256
import json

import abc

VALID_COLOUR_MAPS = ["haxby", "geo"]

@dataclass
class TwoDimensionalImageOptions:
    region_min_x: float
    region_max_x: float
    region_min_y: float
    region_max_y: float
    colour_map_name: str # may need options?

    @property
    def region(self) -> Tuple[float, float, float, float]:
        return (
            self.region_min_x,
            self.region_max_x,
            self.region_min_y,
            self.region_max_y
        )

    @property
    def colour_map(self):
        pass

    def calculate_hash(self):
        return sha256(json.dumps(self.__dict__).encode()).hexdigest()

    @staticmethod
    def load_options(received: Dict[str, Any]):
        return TwoDimensionalImageOptions(
            region_min_x=received["region"]["min_x"],
            region_max_x=received["region"]["max_x"],
            region_min_y=received["region"]["min_y"],
            region_max_y=received["region"]["max_y"],
            colour_map_name=received["colour_map"]
        )


