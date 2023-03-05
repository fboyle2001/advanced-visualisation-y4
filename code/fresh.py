import pygmt
import xarray

pygmt.config(PROJ_ELLIPSOID="Moon")
path = "./data/displacement/ldem_4.tif"

print(pygmt.grdinfo(path))

"""
Map x: -180 to 180
Map y: 90 to -90
"""

xds = xarray.open_dataset("./data/displacement/ldem_4.tif", engine="rasterio")
xds = xds.squeeze()

print(xds)

xds["x"] = xds["x"] / 4 - 180
xds["y"] = 90 - xds["y"] / 4

print(xds)

arr = xds.to_array().squeeze()

fig = pygmt.Figure()
fig.grdimage(
    grid=arr,
    cmap="haxby",
    projection="M10c",
    frame=True,
    region=[-180, 180, -85, 85],

)
# fig.grdcontour(
#     annotation=1,
#     interval=1,
#     grid=arr
# )
fig.colorbar(frame=["x+lelevation", "y+lm"])
fig.show()