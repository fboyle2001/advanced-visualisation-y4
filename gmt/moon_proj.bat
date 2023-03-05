gmt begin GMT_mercator
    gmt set GMT_THEME cookbook
    gmt set MAP_FRAME_TYPE fancy-rounded
    gmt grdimage ../code/data/displacement/ldem_4.tif
gmt end show