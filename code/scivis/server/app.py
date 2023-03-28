from flask import Flask, send_file, request
import json
import pygmt
import xarray
import time
from flask_cors import CORS
from utils import TwoDimensionalImageOptions
import os
from PIL import Image
import seaborn as sns
from matplotlib.figure import Figure
import pandas as pd
import numpy as np
import math

sns.set_theme()

regen = True
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

def generate_glyph_figure(region_raw_displacements, sample_ratio):
    npg = np.array(np.gradient(region_raw_displacements))

    npg[0, :, :] = npg[0, ::-1, :]
    npg[1, :, :] = npg[1, ::-1, :]
    
    sample_count = math.floor(sample_ratio * npg.shape[1] * npg.shape[2])

    bottom_left = np.array([0, 0])
    top_right = np.array([npg.shape[1] - 1, npg.shape[2] - 1])

    # e.g. np.array([[1, 2], [1, 4], [4, 5], [9, 15], [23, 24]])
    selected_indices = np.random.randint((0, 0), (npg.shape[1], npg.shape[2]), size=(sample_count, 2)) 
    appended_indices = []

    if bottom_left not in selected_indices:
        appended_indices.append(bottom_left)

    if top_right not in selected_indices:
        appended_indices.append(top_right)
    
    np.append(selected_indices, [bottom_left, top_right])

    # dx = npg[1, :, :][Y_INDICES, X_INDICES]
    dx = npg[1, :, :][selected_indices[:, 0], selected_indices[:, 1]]
    dy = npg[0, :, :][selected_indices[:, 0], selected_indices[:, 1]]

    n = -2
    color_array = np.sqrt(((dx-n)/2)**2 + ((dy-n)/2)**2)

    x_range = np.arange(0, npg.shape[2])[selected_indices[:, 1]]
    y_range = np.arange(0, npg.shape[1])[selected_indices[:, 0]]

    fig = Figure()
    ax = fig.add_subplot(111)
    print(x_range.shape, y_range.shape)
    print(dx.shape, dy.shape)
    print(color_array.shape)

    """
    len(x_range) === dx.shape[1] 
    len(y_range) === dx.shape[0]
    dx.shape === dy.shape === color_array.shape
    """

    ax.quiver(x_range, y_range, dx, dy, color_array, angles="xy")

    ax.set_aspect("equal")
    ax.axis("off")
    ax.margins(0)
    fig.savefig("./test.png", bbox_inches="tight", pad_inches=0)

@app.post("/generate/2d")
def generate_2d_map():
    options = request.json
    options = TwoDimensionalImageOptions.load_options(options) # type: ignore

    file_name = f"{options.calculate_hash()}"
    save_loc_with_legend = f"./generated/{file_name}_complete.png"
    save_loc = f"./generated/{file_name}.png"
    save_loc_legend = f"./generated/{file_name}_legend.png"
    
    selected_raw = arr[(90 - options.region_max_y) * pixels_per_degree : (90 - options.region_min_y) * pixels_per_degree, 
                       (options.region_min_x + 180) * pixels_per_degree : (options.region_max_x + 180) * pixels_per_degree].to_numpy()

    start_time = time.time()

    # print(
    #     (90 - options.region_max_y) * pixels_per_degree,
    #     (90 - options.region_min_y) * pixels_per_degree,
    #     (options.region_min_x + 180) * pixels_per_degree, 
    #     (options.region_max_x + 180) * pixels_per_degree
    # )
    
    # print(arr.shape, selected_raw.shape)

    if not os.path.isfile(save_loc) or regen:
        fig = pygmt.Figure()

        shading = None

        if options.gradient_shading_enabled:
            shading = "+d"

        fig.grdimage(
            grid=arr,
            cmap=options.colour_map_name,
            projection=f"Q30c",
            region=options.region, # type: ignore
            shading=shading
        )

        if options.contours_enabled:
            contour_params = {
                "grid": arr
            }

            if options.contour_line_interval > 0:
                contour_params["interval"] = options.contour_line_interval # type: ignore

                if options.contour_annotation_interval > 0:
                    contour_params["annotation"] = options.contour_annotation_interval # type: ignore
                
            if len(contour_params.keys()) > 1:
                fig.grdcontour(**contour_params)
                
        fig.colorbar(frame=["x+ldisplacement", "y+lkm"])

        fig.savefig(save_loc_with_legend)

        with_legend = Image.open(save_loc_with_legend)
        width, height = with_legend.size

        without_legend = with_legend.crop((0, 0, width, height - 295))
        without_legend.save(save_loc)

        legend_only = with_legend.crop((0, height - 295, width, height))
        legend_only.save(save_loc_legend)

    if options.is_differentiable():
        gradient = pygmt.grdgradient(
            grid=arr,
            region=options.region,
            radiance="m"
        ).to_numpy() # type: ignore
        
        # hist = sns.histplot(pd.DataFrame({"gradient": gradient.flatten()}))
        fig = Figure()
        ax = fig.add_subplot(111)

        inp = gradient.ravel()

        print(inp.shape)

        ax.hist(inp)

        # ax.set_aspect("equal")
        fig.savefig("./test.png", bbox_inches="tight")

        npg_t = np.array(np.gradient(selected_raw))
        npg_t[0, :, :] = npg_t[0, ::-1, :]
        npg_t[1, :, :] = npg_t[1, ::-1, :]
        npg_x = np.moveaxis(npg_t, 0, -1)
        npg_x = np.sqrt(np.square(npg_x).sum(axis=2))
        print("this", npg_x.shape)
        # print(npg_x[..., :].shape) # = (npg_x[:, :] * npg_x[:, :]).sum(axis=1) ** 0.5
        # print(npg_x[0, 0])

        heat = Figure()
        heat_ax = heat.add_subplot(111)
        heat_ax.pcolormesh(npg_x, cmap="RdBu", shading="auto")
        heat_ax.set_aspect("equal")
        heat.savefig("./test_npg_heat.png", bbox_inches="tight")


        print(npg_t.shape)


        npg = npg_t.ravel()
        print(npg.shape)
        fig = Figure()
        ax = fig.add_subplot(111)
        ax.hist(npg)

        # ax.set_aspect("equal")
        fig.savefig("./test_npg.png", bbox_inches="tight")

    
    delta = time.time() - start_time

    return {
        "output_location": f"{file_name}.png",
        "legend_location": f"{file_name}_legend.png",
        "generation_time": delta,
        "selected_raw": selected_raw.tolist()
    }

@app.get("/generated/<file_loc>")
def fetch_generated_file(file_loc):
    file_path = f"./generated/{file_loc}"
    return send_file(file_path, "image/png")