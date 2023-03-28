import numpy as np
import math
import seaborn as sns

from matplotlib.figure import Figure

# Override matplotlib default styles with better Seaborn ones
sns.set_theme()

def generate_gradient_glyphs(region_np_gradients, sample_ratio, file_location):
    npg = region_np_gradients.copy()

    # Flip the axes order so that we have them the correct way up for displaying
    # This is caused by the graphs starting in bottom-left
    # But the grid data is top-left
    npg[0, :, :] = npg[0, ::-1, :]
    npg[1, :, :] = npg[1, ::-1, :]

    if sample_ratio == "auto":
        # TODO: Find a better way for this
        sample_ratio = 0.4
    
    sample_count = math.floor(sample_ratio * npg.shape[1] * npg.shape[2])

    bottom_left = np.array([0, 0])
    top_right = np.array([npg.shape[1] - 1, npg.shape[2] - 1])

    # Sample indices
    # e.g. np.array([[1, 2], [1, 4], [4, 5], [9, 15], [23, 24]])
    selected_indices = np.random.randint((0, 0), (npg.shape[1], npg.shape[2]), size=(sample_count, 2)) 
    appended_indices = []

    # Force the inclusion of the opposite corners to maintain region
    if bottom_left not in selected_indices:
        appended_indices.append(bottom_left)

    if top_right not in selected_indices:
        appended_indices.append(top_right)
    
    np.append(selected_indices, [bottom_left, top_right])

    # Select the relevant gradients
    # dx = npg[1, :, :][Y_INDICES, X_INDICES]
    dx = npg[1, :, :][selected_indices[:, 0], selected_indices[:, 1]]
    dy = npg[0, :, :][selected_indices[:, 0], selected_indices[:, 1]]

    # Define the colour of the glyphs
    n = -2
    color_array = np.sqrt(((dx-n)/2)**2 + ((dy-n)/2)**2)

    # Define the coordinates for which we will be plotting
    x_range = np.arange(0, npg.shape[2])[selected_indices[:, 1]]
    y_range = np.arange(0, npg.shape[1])[selected_indices[:, 0]]

    # Use Figure instead of matplotlib.pyplot
    # Otherwise major issue with threading
    # See https://matplotlib.org/stable/gallery/user_interfaces/web_application_server_sgskip.html
    fig = Figure()
    ax = fig.add_subplot(111)

    # print(x_range.shape, y_range.shape)
    # print(dx.shape, dy.shape)
    # print(color_array.shape)

    """
    len(x_range) === dx.shape[1] 
    len(y_range) === dx.shape[0]
    dx.shape === dy.shape === color_array.shape
    """

    ax.quiver(x_range, y_range, dx, dy, color_array, angles="xy")

    ax.set_aspect("equal")
    ax.axis("off")
    ax.margins(0)
    fig.savefig(file_location, bbox_inches="tight", pad_inches=0)

def generate_gradient_magnitude_heatmap(region_np_gradients, file_location):
    npg = region_np_gradients.copy()

    # Flip the axes order so that we have them the correct way up for displaying
    # This is caused by the graphs starting in bottom-left
    # But the grid data is top-left
    npg[0, :, :] = npg[0, ::-1, :]
    npg[1, :, :] = npg[1, ::-1, :]

    # Currently shaped as (2, A, B) reshape to (A, B, 2)
    npg = np.moveaxis(npg, 0, -1)
    # Compute the magnitudes reduces shape to (A, B)
    npg = np.sqrt(np.square(npg).sum(axis=2))

    fig = Figure()
    ax = fig.add_subplot(111)
    sns.heatmap(npg, ax=ax)
    ax.invert_yaxis()
    ax.set_aspect("equal")
    fig.savefig(file_location, bbox_inches="tight")

def generate_gradient_magnitude_histogram():
    pass