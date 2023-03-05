#!/usr/bin/env bash
#
# Plot lunar map
#

#
# Convert the GeoTiff file to geographical NetCDF file. Then convert it to a coarser resolution for plottting.
#
if [[ ! -e moon.grd ]]
then
        gmt grdproject moon.tif -Gmoon.grd \
                -I -JQ0/0/10916406.15 -C -Rd -V
fi

if [[ ! -e coarsemoon.grd ]]
then
        gmt grdsample moon.grd -Gcoarsemoon.grd -I0.5/.05 -Rd
fi

gmt begin map pdf,png A+m1c
        gmt gmtset FONT_ANNOT_PRIMARY    10p,Helvetica,black
        gmt gmtset FONT_LABEL                        14p,Helvetica,black
        gmt gmtset FONT_TITLE                         18p,Helvetica,black
        gmt gmtset FORMAT_GEO_MAP            dddF
        gmt gmtset MAP_ANNOT_OBLIQUE      15
        gmt gmtset MAP_ANNOT_OBLIQUE      15
        gmt gmtset PROJ_ELLIPSOID                moon
        gmt gmtset PROJ_LENGTH_UNIT           c

        gmt grdimage coarsemoon.grd -Cbathy -JR30 -Rd -B+t"Lunar Topography" \
        -Bpxyf10a30g30 -Q -I+d
        gmt plot -Wthick,red <<- END
        -90     0
        0               90
        90      0
        0               -90
        -90     0
        END
  gmt colorbar -DJBC+w15/0.25+h -Bpxf500a2000 \
    -Bpx+l"Elevation (m)"
gmt end

gmt grdproject moon.tif -R0/40/20/40 -Jc4p --PROJ_ELLIPSOID=MOON -Gout=nb
gmt grdimage out -pdf