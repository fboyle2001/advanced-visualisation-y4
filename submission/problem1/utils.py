from dataclasses import dataclass
from typing import Tuple, Dict, Any
import xarray

ABS_MAX_X = 180
ABS_MAX_Y = 90
VALID_COLOUR_MAPS = ["haxby", "geo"]

@dataclass
class RegionOptions:
    min_x: int
    max_x: int
    min_y: int
    max_y: int

    def as_tuple(self) -> Tuple[int, int, int, int]:
        return (
            self.min_x,
            self.max_x,
            self.min_y,
            self.max_y
        )

    def is_differentiable(self) -> bool:
        x_valid = abs(self.min_x) < ABS_MAX_X and abs(self.max_x) < ABS_MAX_X
        y_valid = abs(self.min_y) < ABS_MAX_Y and abs(self.max_y) < ABS_MAX_Y
        return x_valid and y_valid
    
    def is_valid(self) -> bool:
        return self.min_x < self.max_x and self.min_y < self.max_y

    @staticmethod
    def load_options(received: Dict[str, Any]) -> "RegionOptions":
        return RegionOptions(
            min_x=int(received["region"]["min_x"]),
            max_x=int(received["region"]["max_x"]),
            min_y=int(received["region"]["min_y"]),
            max_y=int(received["region"]["max_y"])
        )

def load_displacement_map(pixels_per_degree, apply_transform=True):
    loc = f"./data/displacement/ldem_{pixels_per_degree}.tif"

    xds = xarray.open_dataset(loc, engine="rasterio")
    xds = xds.squeeze()

    if apply_transform:
        xds["x"] = xds["x"] / pixels_per_degree - 180
        xds["y"] = 90 - xds["y"] / pixels_per_degree

    arr = xds.to_array().squeeze()

    return xds, arr
