import pygmt
import xarray
import abc
import time

pygmt.config(PROJ_ELLIPSOID="Moon")
path = "./data/displacement/ldem_4.tif"

def load_displacement_map(pixels_per_degree, apply_transform=True):
    loc = f"./data/displacement/ldem_{pixels_per_degree}.tif"

    xds = xarray.open_dataset(loc, engine="rasterio")
    xds = xds.squeeze()

    if apply_transform:
        xds["x"] = xds["x"] / pixels_per_degree - 180
        xds["y"] = 90 - xds["y"] / pixels_per_degree

    arr = xds.to_array().squeeze()

    return xds, arr

def draw_contour_map(interval, annotation):
    pass


"""
Map x: -180 to 180
Map y: 90 to -90
"""

ppd = 4
xds, arr = load_displacement_map(ppd, apply_transform=True)
print(xds)

region = [0, 40, -40, 0]

fig = pygmt.Figure()

# fig.plot(
#     data=arr.to_numpy(),
#     cmap="haxby",
#     projection="M30c",
#     frame="a30f15",
#     region=[-180, 180, -70, 70] # type: ignore
# )

# Didn't work
gradient = pygmt.grdgradient(
    grid=arr,
    region=region, # type: ignore
    radiance="m"
)

# fig.grdimage(
#     grid=arr,
#     cmap="haxby",
#     projection="M30c", #"J0/30c", #"X30c/15c", #"Y0/0/30c", #"Cyl_stere/0/0/30c", #"M30c",
#     frame="a30f15",
#     region=region, # type: ignore
#     shading=gradient
# )

# https://www.pygmt.org/latest/gallery/3d_plots/grdview_surface.html#sphx-glr-gallery-3d-plots-grdview-surface-py
fig.grdview(
    grid=arr,
    region=region, # type: ignore
    frame=["a5f1g5", "za5f1g5"],
    projection="x0.5c",
    zscale="0.5c",
    surftype="s",
    cmap="geo",
    perspective=[135, 30],
    # shading="+a45",
    contourpen="1p,blue",
    # plane="+ggray"
)

# fig.grdcontour(
#     grid=arr,
#     interval=2,
#     # annotation=5
# )

fig.colorbar(frame=["x+lelevation", "y+lkm"])
print("Saving...")
fig.savefig(f"./temp_output/{time.time()}.png")
print("Saved")