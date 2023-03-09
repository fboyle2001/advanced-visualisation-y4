import pygmt
from pygmt.io import load_dataarray
import xarray
import numpy as np
from matplotlib import pyplot as plt

pygmt.config(PROJ_ELLIPSOID="moon")

"""
The displacement maps are global cylindrical projects at 4, 16 and 64 pixels per degree
Reference surface is a sphere of radius 1737.4km
LOLA's gridded elvation data is in half-meters relative to the radius
Centred on 0 degree longitude
Using floating-point TIFFs in kilometers relative to radius of 1737.4km 
Maybe need to use arcseconds?
"""

# grid = pygmt.datasets.load_earth_relief(resolution="10m", region=[-108, -103, 35, 40])

# print(grid)

# exit()

# pygmt.show_versions()

xds = xarray.open_dataset("./data/displacement/ldem_4.tif", engine="rasterio")
xds = xds.squeeze()

xds["x"] = xds["x"] / 4 - 180
xds["y"] = xds["y"] / 720 - 90 # 

# copied = xds["x"]

# xds["x"] = xds["y"]
# xds["y"] = copied

#
# xds["x"] = xds["x"] / 4
# xds["y"] = xds["y"] / 360 - 180

print(xds)

arr = xds.to_array().squeeze()

# grid = pygmt.xyz2grd(arr.to_numpy(), region=[0, 180, -89, 89], spacing=(1, 1))
# print(grid)

# print(pygmt.grdinfo(arr))


# xs = range(0, arr.shape[1])
# ys = range(0, arr.shape[0])

# triplets = [(x, y, arr[x, y]) for x in xs for y in ys]
# print(len(triplets))

nparr = xds.to_array().squeeze().to_numpy()
# proj = pygmt.project()

fig = pygmt.Figure()
fig.grdview(
    grid="./data/displacement/ldem_4.tif"
)
# fig.grdimage(
#     grid="./data/displacement/ldem_4.tif",
#     cmap="haxby",
#     projection="M10c",
#     frame=True,
# )
# fig.grdcontour(
#     annotation=1,
#     interval=1,
#     grid=arr
# )
# fig.colorbar(frame=["x+lelevation", "y+lm"])
fig.show()

# fig = pygmt.Figure()
# fig.grdview(
#     grid=arr,
#     perspective=[130, 30],
#     projection="M15c",
#     zsize="1.5c"
# )
# fig.show()

# print(nparr)

# m = np.min(arr)
# M = np.max(arr)

# X, Y = np.meshgrid(xs, ys)

# # img = plt.imshow(arr, cmap="gray")
# # plt.show()
# fig = plt.figure()
# ax = fig.add_subplot(projection="3d")
# surf = ax.plot_surface(X, Y, arr, cmap="gray")

# #surf = ax.plot(arr[0,], Y, Z, cmap=cm.coolwarm, linewidth=0, antialiased=False)
# plt.show()

# print(xds.coords["x"].shape)
# print(xds.coords["y"].shape)
# print("A", xds.isel(x=89, y=65))

# grid = pygmt.grdsample(grid=xds, translate=True, spacing=[1, 1])

# fig = pygmt.Figure()
# # fig.grdview(grid=arr, surftype="i", cmap="gray")
# fig.grdcontour(grid=arr, interval=250)
# fig.show()