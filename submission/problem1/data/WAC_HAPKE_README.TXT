PROJECT NAME
  Photometrically normalized 7-color semi-global mosaic using Hapke parameter maps

CONTENTS
  Photometrically normalized radiance factor (I/F)

WAVELENGTH
  321, 360, 415, 566, 604, 643, and 689 nm

AREAL COVERAGE
  70°N-70°S, 0°E- 360°E

MAP PROJECTION
  Equirectangular (centered at 0°N, 0°E; 400 m/pixel at the equator) using ephemeris
  data provided by Lunar Orbiter Laser Altimeter (LOLA) and Gravity Recovery and
  Interior Laboratory (GRAIL) teams [1] and an improved geometric camera model [2].

IMAGE SOURCE
  ~124,300 images acquired by Wide Angle Camera from January 21, 2010 to May 1st, 2013

PHOTOMETRIC NORMALIZATION
  Normalized to the angles of phase (g) = incidence (i) = 60°, emission (e) = 0° by
  Hapke bidirectional reflectance function [3] using Hapke parameter maps [4]. The 
  g, i, and e angles were calculated using the WAC stereo digital terrain model
  (GLD100) [5]. Each pixel value of this mosaic consists of a median of normalized 
  I/F from ~40 months of repeated observations (UV:58-59, visible:136-140 observations
  in average). For more methodological details, see [4].

PDS PRODUCT NAMING CONVENTION
  The semi-global 7-band mosaic is archived by each band with tiles of 70° latitude by
  90° longitude tiles. A 3-band 8-bit/band RGB (R=689 nm, G=415 nm, B=321 nm)  mosaic is 
  also archived using the same tiling scheme. All tiled product files are named in 
  following manner: 
WAC_HAPKE_[wavelength, e.g., 321NM|3BAND]_[projection, E for equirectangular][center latitude x10][N/S][center longitude x10]

  Product Name              | Latitude Range | Longitude Range
  ------------------------------------------------------------
  WAC_HAPKE_*****_E350N0450 |   0° to 70°    |   0° to 90°
  WAC_HAPKE_*****_E350S0450 | -70° to 0°     |   0° to 90°
  WAC_HAPKE_*****_E350N1350 |   0° to 70°    |  90° to 180°
  WAC_HAPKE_*****_E350S1350 | -70° to 0°     |  90° to 180°
  WAC_HAPKE_*****_E350N2250 |   0° to 70°    | 180° to 270°
  WAC_HAPKE_*****_E350S2250 | -70° to 0°     | 180° to 270°
  WAC_HAPKE_*****_E350N3150 |   0° to 70°    | 270° to 360°
  WAC_HAPKE_*****_E350S3150 | -70° to 0°     | 270° to 360°

BROWSE PNGS
  Low Resolution browsable png versions of these files can be found here:
  http://lroc.sese.asu.edu/data/LRO-L-LROC-5-RDR-V1.0/LROLRC_2001/EXTRAS/BROWSE/WAC_HAPKE/

PRODUCT CITATION
  When citing this product, use the following reference:
  Sato, H., Robinson, M.S., Lawrence, S.J., Denevi, B.W., Hapke, H., Jolliff, B.L.,
  Hiesinger, H. (2017) Lunar Mare TiO2 Abundances Estimated from UV/Vis Reflectance,
  Icarus, 296, 216-238. https://doi.org/10.1016/j.icarus.2017.06.013.

RDR SIS
  http://lroc.sese.asu.edu/data/LRO-L-LROC-5-RDR-V1.0/LROLRC_2001/DOCUMENT/RDRSIS.PDF

REFERENCES
  [1] Mazarico, E., Rowlands, D.D., Neumann, G.A., Smith, D.E., Torrence, M.H.,
      Lemoine, F.G., Zuber, M.T., (2012), Orbit determination of the Lunar
      Reconnaissance Orbiter, Journal of Geodesy, Volume 86, Issue 3, pp.193-207,
      doi:10.1007/s00190-011-0509-4.
  [2] Speyerer, E.J., R.V. Wagner, M.S. Robinson, A. Licht, P.C. Thomas, K. Becker, J.
      Anderson, S.M. Brylow, D.C. Humm, M. Tschimmel (2014), Pre-flight and On-orbit
      Geometric Calibration of the Lunar Reconnaissance Orbiter Camera, Space Science
      Reviews, doi:10.1007/s11214-014-0073-3.
  [3] Hapke, B. (2012) Theory of reflectance and emittance spectroscopy. Cambridge
      University Press, New York.
  [4] Sato, H., Robinson, M.S., Hapke, B., Denevi, B.W., Boyd, A.K. (2014) Resolved
      Hapke parameter maps of the Moon. Journal of Geophysical Research Planets 119,
      1775–1805. doi:10.1002/2013JE004580.
  [5] Scholten, F., J. Oberst, K.-D. Matz, T. Roatsch, M. Wählisch, E.J. Speyerer,
      M.S. Robinson (2012), GLD100 – the near-global lunar 100 meter raster DTM from
      LROC WAC stereo image data, Journal of Geophysical Research, 117,
      doi:10.1029/2011JE003926.
