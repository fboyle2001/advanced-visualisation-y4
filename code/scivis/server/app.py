from flask import Flask, send_file, request
import json
import pygmt
import xarray
import time
from flask_cors import CORS

pygmt.config(PROJ_ELLIPSOID="Moon")

pixels_per_degree = 4

def load_displacement_map(pixels_per_degree, apply_transform=True):
    loc = f"../../data/displacement/ldem_{pixels_per_degree}.tif"

    xds = xarray.open_dataset(loc, engine="rasterio")
    xds = xds.squeeze()

    if apply_transform:
        xds["x"] = xds["x"] / pixels_per_degree - 180
        xds["y"] = 90 - xds["y"] / pixels_per_degree

    arr = xds.to_array().squeeze()

    return xds, arr

xds, arr = load_displacement_map(pixels_per_degree)
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.post("/generate/2d")
def generate_2d_map():
    options = request.json

    print(options)

    ## do some checking

    start_time = time.time()

    fig = pygmt.Figure()
    fig.grdimage(
        grid=arr,
        cmap={options["colour_map"]},
        projection=f"{options['projection']}{options['size']}", #"J0/30c", #"X30c/15c", #"Y0/0/30c", #"Cyl_stere/0/0/30c", #"M30c",
        # frame="a30f15",
        region=options["region"], # type: ignore
    )

    fig.colorbar(frame=["x+lelevation", "y+lkm"])

    file_name = f"{time.time()}.png"
    save_loc = f"./generated/{file_name}"
    fig.savefig(save_loc)
    
    delta = time.time() - start_time

    return {
        "output_location": file_name,
        "generation_time": delta
    }

@app.get("/generated/<file_loc>")
def fetch_generated_file(file_loc):
    file_path = f"./generated/{file_loc}"
    return send_file(file_path, "image/png")