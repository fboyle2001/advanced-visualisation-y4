from typing import Dict, Any

from flask import Flask, send_file, request
import pygmt
import time
from flask_cors import CORS
from utils import RegionOptions, load_displacement_map
import os
from PIL import Image
import numpy as np

import graphs

from hashlib import sha256
import json

import shutil
import webbrowser
import threading

pygmt.config(PROJ_ELLIPSOID="Moon")
Image.MAX_IMAGE_PIXELS = None

pixels_per_degree = 4
xds, grid = load_displacement_map(pixels_per_degree)
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

os.makedirs("./cpts", exist_ok=True)
os.makedirs("./cpts_3d", exist_ok=True)
os.makedirs("./generated", exist_ok=True)

@app.post("/resolution")
def change_resolution():
    options: Dict[str, Any] = request.json # type: ignore
    resolution = options.get("resolution", "normal")

    resolution_lookup = {
        "normal": 4,
        "high": 16
    }

    if resolution not in resolution_lookup.keys():
        return {}
    
    new_ppd = resolution_lookup[resolution]
    
    global xds, grid, pixels_per_degree
    
    if new_ppd == pixels_per_degree:
        return {}
    
    pixels_per_degree = new_ppd
    xds, grid = load_displacement_map(pixels_per_degree)

    return {}

@app.post("/generate/2d")
def generate_2d_map():
    options: Dict[str, Any] = request.json # type: ignore

    force_regen = options.get("force_regen", False)
    options.pop("force_regen", None)
    options["__resolution"] = pixels_per_degree

    options_hash = sha256(json.dumps(options).encode()).hexdigest()

    region = RegionOptions.load_options(options)

    if not region.is_valid():
        return {
            "error": "Invalid region"
        }

    # To remove the need to constantly regenerate, we cache using hashes to identify
    # We store the complete image and then remove the legend and send it separately
    # This allows us to select a region and see displacement solely on the map without the legend causing problems
    complete_save_loc = f"./generated/{options_hash}_2d_complete.png"
    no_legend_save_loc = f"./generated/{options_hash}_2d_no_legend.png"
    legend_only_save_loc = f"./generated/{options_hash}_2d_legend_only.png"

    # The part of the grid that is specified by the region
    selected_grid = grid[(90 - region.max_y) * pixels_per_degree : (90 - region.min_y) * pixels_per_degree, 
                       (region.min_x + 180) * pixels_per_degree : (region.max_x + 180) * pixels_per_degree].to_numpy()

    min_disp = selected_grid.min()
    max_disp = selected_grid.max()

    # print(
    #     (90 - options.region_max_y) * pixels_per_degree,
    #     (90 - options.region_min_y) * pixels_per_degree,
    #     (options.region_min_x + 180) * pixels_per_degree, 
    #     (options.region_max_x + 180) * pixels_per_degree
    # )
    
    # print(arr.shape, selected_raw.shape)

    cmap = options.get("colour_map")

    # Generate a Zebra Stripe colour map
    if cmap == "zebra":
        # Delete old CPTs
        shutil.rmtree("./cpts")
        os.makedirs("./cpts")

        split_count = int(options.get("zebra_stripe_count", 8))
        interval = (max_disp - min_disp) / split_count

        mod_map = ["#ffffff", "#000000"]
        colours = [mod_map[i % len(mod_map)] for i in range(split_count)]
        series_str = f"{min_disp}/{max_disp}/{interval}"

        save_name = f"./cpts/{time.time()}.cpt"

        pygmt.makecpt(cmap=",".join(colours), series=series_str, categorical=True, output=save_name)

        cmap = save_name

    # Forcefully cause a regeneration of the images
    if force_regen:
        if os.path.isfile(complete_save_loc):
            try:
                os.remove(complete_save_loc)
            except:
                pass
        
        if os.path.isfile(no_legend_save_loc):
            try:
                os.remove(no_legend_save_loc)
            except:
                pass
        
        if os.path.isfile(legend_only_save_loc):
            try:
                os.remove(legend_only_save_loc)
            except:
                pass

    # Generate if the file doesn't already exist
    if not os.path.isfile(complete_save_loc):
        fig = pygmt.Figure()

        grdimage_options = {
            "grid": grid,
            "projection": f"Q30c",
            "cmap": cmap,
            "region": region.as_tuple() 
        }

        # Shade the map according to the directional derivative
        if options.get("gradient_shading_enabled"):
            grdimage_options["shading"] = "+d"

        # Plot the map
        fig.grdimage(**grdimage_options)

        contour_options = options.get("contours", dict())

        # If they want to plot the contours
        if contour_options.get("enabled"):
            contour_params: Dict[str, Any] = {
                "grid": grid
            }
            
            contour_line_interval = float(contour_options.get("line_interval", 0))
            contour_line_thickness = float(contour_options.get("line_thickness", 1))
            contour_line_colour = contour_options.get("line_colour", "black")
            contour_annotation_interval = float(contour_options.get("annotation_interval", 0))

            # Set the interval and annotation intervals
            if contour_line_interval > 0:
                contour_params["interval"] = contour_line_interval 
                contour_params["pen"] = f"{contour_line_thickness if contour_line_thickness > 0 else 1}p,{contour_line_colour}"
                
                if contour_annotation_interval > 0:
                    contour_params["annotation"] = contour_annotation_interval 
            
            # Only plot if valid
            if len(contour_params.keys()) > 1:
                fig.grdcontour(**contour_params)
        
        # Add the colour bar at the bottom and save the figure
        fig.colorbar(frame=["x+ldisplacement", "y+lkm"])
        fig.savefig(complete_save_loc)

        # Remove the legend and save them separately
        # Currently use a trick since the legend space is 295px
        # TODO: Make it responsive
        with_legend = Image.open(complete_save_loc)
        width, height = with_legend.size

        without_legend = with_legend.crop((0, 0, width, height - 295))
        without_legend.save(no_legend_save_loc)

        legend_only = with_legend.crop((0, height - 295, width, height))
        legend_only.save(legend_only_save_loc)

    return {
        "output_location": f"{options_hash}_2d_no_legend.png",
        "legend_location": f"{options_hash}_2d_legend_only.png",
        "selected_raw": selected_grid.tolist(),
        "min_disp": float(min_disp),
        "max_disp": float(max_disp)
    }

@app.post("/generate/3d")
def generate_3d():
    options: Dict[str, Any] = request.json # type: ignore

    force_regen = options.get("force_regen", False)
    options.pop("force_regen", None)
    options["__resolution"] = pixels_per_degree

    options_hash = sha256(json.dumps(options).encode()).hexdigest()

    region = RegionOptions.load_options(options)

    if not region.is_valid():
        return {
            "error": "Invalid region"
        }
    
    # To remove the need to constantly regenerate, we cache using hashes to identify
    perspective_save_loc = f"./generated/{options_hash}_perspective.png"

    # The part of the grid that is specified by the region
    selected_grid = grid[(90 - region.max_y) * pixels_per_degree : (90 - region.min_y) * pixels_per_degree, 
                       (region.min_x + 180) * pixels_per_degree : (region.max_x + 180) * pixels_per_degree].to_numpy()

    min_disp = selected_grid.min()
    max_disp = selected_grid.max()

    cmap = options.get("colour_map")

    # Generate a Zebra Stripe colour map
    if cmap == "zebra":
        # Delete old CPTs
        shutil.rmtree("./cpts_3d")
        os.makedirs("./cpts_3d")

        split_count = int(options.get("zebra_stripe_count", 8))
        interval = (max_disp - min_disp) / split_count

        mod_map = ["#ffffff", "#000000"]
        colours = [mod_map[i % len(mod_map)] for i in range(split_count)]
        series_str = f"{min_disp}/{max_disp}/{interval}"

        save_name = f"./cpts_3d/{time.time()}.cpt"
        pygmt.makecpt(cmap=",".join(colours), series=series_str, categorical=True, output=save_name)
        cmap = save_name

    # Forcefully cause a regeneration of the images
    if force_regen:
        if os.path.isfile(perspective_save_loc):
            try:
                os.remove(perspective_save_loc)
            except:
                pass

    if not os.path.isfile(perspective_save_loc):
        fig = pygmt.Figure()

        grdview_params = {
            "grid": grid,
            "region": (*region.as_tuple(), min_disp - abs(min_disp * 0.1), max_disp + abs(max_disp * 0.1)), # type: ignore
            "frame": ["a5f1g5", "za5f1g5"],
            "projection": "Q30c",
            "zscale": "2.5c",
            "surftype": "s",
            "cmap": cmap,
            "perspective": [options.get("azimuth", 135), options.get("elevation", 30)]
        }

        contour_options = options.get("contours", dict())

        if contour_options.get("enabled"):
            contour_line_interval = float(contour_options.get("line_interval", 0))
            
            contour_line_thickness = float(contour_options.get("line_thickness", 1))
            contour_line_colour = contour_options.get("line_colour", "black")

            if contour_line_interval > 0:
                grdview_params["contourpen"] = f"{contour_line_thickness if contour_line_thickness > 0 else 1}p,{contour_line_colour}"

        fig.grdview(**grdview_params)
        fig.colorbar(frame=["x+ldisplacement", "y+lkm"])
        fig.savefig(perspective_save_loc)

    return {
        "output_location": f"{options_hash}_perspective.png",
        "min_disp": float(min_disp),
        "max_disp": float(max_disp)
    }

@app.post("/generate/gradient_glyphs")
def generate_glyphs():
    options: Dict[str, Any] = request.json # type: ignore

    force_regen = options.get("force_regen", False)
    options.pop("force_regen", None)
    options["__resolution"] = pixels_per_degree

    options_hash = sha256(json.dumps(options).encode()).hexdigest()

    region = RegionOptions.load_options(options)

    if not region.is_valid():
        return {
            "error": "Invalid region"
        }

    # To remove the need to constantly regenerate, we cache using hashes to identify
    glyph_save_loc = f"./generated/{options_hash}_glyphs.png"

    # The part of the grid that is specified by the region
    selected_grid = grid[(90 - region.max_y) * pixels_per_degree : (90 - region.min_y) * pixels_per_degree, 
                       (region.min_x + 180) * pixels_per_degree : (region.max_x + 180) * pixels_per_degree].to_numpy()

    # Forcefully cause a regeneration of the images
    if force_regen:
        if os.path.isfile(glyph_save_loc):
            try:
                os.remove(glyph_save_loc)
            except:
                pass

    if not os.path.isfile(glyph_save_loc):
        # Calculate gradients and generate the glyph plot
        npg = np.array(np.gradient(selected_grid))
        sample_ratio = options.get("sample_ratio", "auto")
        graphs.generate_gradient_glyphs(npg, pixels_per_degree, sample_ratio, options.get("colour_map", "rocket"), region, glyph_save_loc)

    return {
        "file_loc": f"{options_hash}_glyphs.png"
    }

@app.post("/generate/gradient_heatmap")
def generate_heatmap():
    options: Dict[str, Any] = request.json # type: ignore

    force_regen = options.get("force_regen", False)
    options.pop("force_regen", None)
    options["__resolution"] = pixels_per_degree

    options_hash = sha256(json.dumps(options).encode()).hexdigest()

    region = RegionOptions.load_options(options)

    if not region.is_valid():
        return {
            "error": "Invalid region"
        }

    # To remove the need to constantly regenerate, we cache using hashes to identify
    heatmap_save_loc = f"./generated/{options_hash}_heatmap.png"

    # The part of the grid that is specified by the region
    selected_grid = grid[(90 - region.max_y) * pixels_per_degree : (90 - region.min_y) * pixels_per_degree, 
                       (region.min_x + 180) * pixels_per_degree : (region.max_x + 180) * pixels_per_degree].to_numpy()

    # Forcefully cause a regeneration of the images
    if force_regen:
        if os.path.isfile(heatmap_save_loc):
            try:
                os.remove(heatmap_save_loc)
            except:
                pass

    if not os.path.isfile(heatmap_save_loc):
        # Calculate gradients and generate the magnitude heatmap
        npg = np.array(np.gradient(selected_grid))
        graphs.generate_gradient_magnitude_heatmap(npg, options.get("colour_map", "rocket"), region, heatmap_save_loc)

    return {
        "file_loc": f"{options_hash}_heatmap.png"
    }

@app.get("/generated/<file_loc>")
def fetch_generated_file(file_loc):
    file_path = f"./generated/{file_loc}"
    return send_file(file_path, "image/png")

if __name__ == "__main__":
    real_path = f"file://{os.path.realpath('./gui/index.html')}"
    threading.Timer(3, lambda: webbrowser.open(real_path, new=2)).start()
    app.run()