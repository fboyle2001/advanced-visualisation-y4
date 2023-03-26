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
        region_min_x = float(received["region_min_x"])
        region_max_x = float(received["region_max_x"])

        if region_min_x >= region_max_x:
            pass

        if region_min_x < -180:
            pass

        if region_max_x > 180:
            pass
        
        region_min_y = float(received["region_min_y"])
        region_max_y = float(received["region_max_y"])

        if region_min_y >= region_max_y:
            pass

        if region_min_y <= -90:
            pass

        if region_max_y >= 90:
            pass

        if received["colour_map_name"] not in VALID_COLOUR_MAPS:
            pass

        return TwoDimensionalImageOptions(
            region_min_x=region_min_x,
            region_max_x=region_max_x,
            region_min_y=region_min_y,
            region_max_y=region_max_y,
            colour_map_name=received["colour_map_name"]
        )


