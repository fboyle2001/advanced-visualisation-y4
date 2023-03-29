import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { TwoDimensionalImagePanel } from '../components/TwoDimensionalImagePanel'
import { LoadingHolder } from '../components/LoadingHolder';
import { ThreeDimensionalImagePanel } from '../components/ThreeDimensionalImagePanel';
import { mod } from '../components/utils';

const absoluteXBound = 180;
const absoluteYBound = 90;
const apiURL = "http://127.0.0.1:5000";

const resolutionLookup = {
  "normal": 4,
  "high": 16
}

export const SciVisPage = () => {
  const [shouldFastPerspectiveUpdate, setShouldFastPerspectiveUpdate] = useState(false);

  // 
  const [twoDViewLoading, set2DViewLoading] = useState(true);
  const [threeDViewLoading, set3DViewLoading] = useState(true);
  const [heatMapLoading, setHeatMapLoading] = useState(true);
  const [glyphPlotLoading, setGlyphPlotLoading] = useState(true);

  const [twoDVisible, set2DVisible] = useState(true);
  const [threeDVisible, set3DVisible] = useState(false);
  
  const [heatMapLocation, setHeatMapLocation] = useState(null);
  const [glyphPlotLocation, setGlyphPlotLocation] = useState(null);

  // Current Values
  // 2D
  const [twoDImageLocation, set2DImageLocation] = useState(null);
  const [twoDLegendLocation, set2DLegendLocation] = useState(null);
  const [twoDImageRefreshKey, set2DImageRefreshKey] = useState(Date.now());
  const [twoDRawDisplacements, set2DRawDisplacements] = useState([]); 

  // 3D
  const [threeDImageLocation, set3DImageLocation] = useState(null);
  const [threeDImageRefreshKey, set3DImageRefreshKey] = useState(Date.now());

  const [regionMinX, setRegionMinX] = useState(-40);
  const [regionMaxX, setRegionMaxX] = useState(40);
  const [regionMinY, setRegionMinY] = useState(-40);
  const [regionMaxY, setRegionMaxY] = useState(40);

  const [resolution, setResolution] = useState("normal");

  // Next Values
  const [nextResolution, setNextResolution] = useState("normal");

  // Shared Main Options
  const [mainPlotDisplay, setMainPlotDisplay] = useState("3d"); // useState("2d");

  const [nextRegionMinX, setNextRegionMinX] = useState(-40);
  const [nextRegionMaxX, setNextRegionMaxX] = useState(40);
  const [nextRegionMinY, setNextRegionMinY] = useState(-40);
  const [nextRegionMaxY, setNextRegionMaxY] = useState(40);

  const [colourMap, setColourMap] = useState("geo");

  const [contoursEnabled, setContoursEnabled] = useState(false);
  const [contourLineInterval, setContourLineInterval] = useState(-1);
  const [contourAnnotationInterval, setContourAnnotationInterval] = useState(-1);
  
  const [gradientShadingEnabled, setGradientShadingEnabled] = useState(false);

  // 3D Specific Options
  const [perspectiveAzimuth, setPerspectiveAzimuth] = useState(135);
  const [perspectiveElevation, setPerspectiveElevation] = useState(30);

  // Heat Map Options
  const [heatMapColourMap, setHeatMapColourMap] = useState("mako");

  // Glyph Plot Options
  const [glyphPlotSampleAuto, setGlyphPlotSampleAuto] = useState(true);
  const [glyphPlotSampleRatio, setGlyphPlotSampleRatio] = useState(0.4);
  const [glyphPlotColourMap, setGlyphPlotColourMap] = useState("rocket");

  const [minDisp, setMinDisp] = useState(0);
  const [maxDisp, setMaxDisp] = useState(0);

  const fastUpdateAzimuth = (degrees) => {
    setPerspectiveAzimuth(mod(Number(perspectiveAzimuth) + Number(degrees), 360));
    setShouldFastPerspectiveUpdate(true);
  }

  const fastUpdateElevation = (degrees) => {
    setPerspectiveElevation(Number(perspectiveElevation) + Number(degrees));
    setShouldFastPerspectiveUpdate(true);
  }

  useEffect(() => {
    if(!shouldFastPerspectiveUpdate) {
      return;
    }

    load3DMap();

    setShouldFastPerspectiveUpdate(false);
  }, [shouldFastPerspectiveUpdate]);

  const changeResolution = async () => {
    let result;

    try {
      result = await axios.post(`${apiURL}/resolution`, {
        "resolution": nextResolution
      });
    } catch (error) {
      alert("Error");
      console.log({error});
      return;
    }

    setResolution(nextResolution);
  }

  const load2DMap = async () => {
    set2DViewLoading(true);

    const options = {
      "region": {
        "min_x": nextRegionMinX,
        "max_x": nextRegionMaxX,
        "min_y": nextRegionMinY,
        "max_y": nextRegionMaxY,
      },
      "colour_map": colourMap,
      "contours": {
        "enabled": contoursEnabled,
        "line_interval": contourLineInterval,
        "annotation_interval": contourAnnotationInterval
      },
      "gradient_shading_enabled": gradientShadingEnabled
    };

    let result;

    try {
      result = await axios.post(`${apiURL}/generate/2d`, options);
    } catch (error) {
      alert("Error");
      console.log({error});
      return;
    }
    
    const { output_location: outputLoc, legend_location: legendLoc, selected_raw: selectedRaw, min_disp: foundMinDisp, max_disp: foundMaxDisp } = result.data;

    setMinDisp(foundMinDisp);
    setMaxDisp(foundMaxDisp);

    set2DImageLocation(outputLoc);
    set2DLegendLocation(legendLoc);
    set2DRawDisplacements(selectedRaw);
    set2DImageRefreshKey(Date.now());

    set2DVisible(true);
    set2DViewLoading(false);
  }

  const load3DMap = async () => {
    set3DViewLoading(true);

    const options = {
      "region": {
        "min_x": nextRegionMinX,
        "max_x": nextRegionMaxX,
        "min_y": nextRegionMinY,
        "max_y": nextRegionMaxY,
      },
      "colour_map": colourMap,
      "contours": {
        "enabled": contoursEnabled,
        "line_interval": contourLineInterval,
        "annotation_interval": contourAnnotationInterval
      },
      "gradient_shading_enabled": gradientShadingEnabled,
      "azimuth": perspectiveAzimuth,
      "elevation": perspectiveElevation
    };

    let result;

    try {
      result = await axios.post(`${apiURL}/generate/3d`, options);
    } catch (error) {
      alert("Error");
      console.log({error});
      return;
    }
    
    const { output_location: outputLoc, min_disp: foundMinDisp, max_disp: foundMaxDisp } = result.data;

    setMinDisp(foundMinDisp);
    setMaxDisp(foundMaxDisp);

    set3DImageLocation(outputLoc);
    set3DImageRefreshKey(Date.now());

    set3DVisible(true);
    set3DViewLoading(false);
  }

  const loadMaps = async () => {
    await changeResolution();

    loadGlyphPlot(false);
    loadHeatMap();

    set2DViewLoading(true);
    set3DViewLoading(true);

    if(mainPlotDisplay === "both" || mainPlotDisplay === "2d") {
      await load2DMap();
      set2DVisible(true);
    } else {
      set2DVisible(false);
    }

    if(mainPlotDisplay === "both" || mainPlotDisplay === "3d") {
      await load3DMap();
      set3DVisible(true);
    } else {
      set3DVisible(false);
    }

    setRegionMinX(nextRegionMinX);
    setRegionMaxX(nextRegionMaxX);
    setRegionMinY(nextRegionMinY);
    setRegionMaxY(nextRegionMaxY);
  }

  const loadHeatMap = async() => {
    setHeatMapLoading(true);

    const options = {
      "region": {
        "min_x": nextRegionMinX,
        "max_x": nextRegionMaxX,
        "min_y": nextRegionMinY,
        "max_y": nextRegionMaxY,
      },
      "colour_map": heatMapColourMap,
      "force_regen": true
    }

    let result;

    try {
      result = await axios.post(`${apiURL}/generate/gradient_heatmap`, options);
    } catch (error) {
      alert("Error");
      console.log({error});
      return;
    }

    const { file_loc: heatMapLoc } = result.data;

    setHeatMapLocation(heatMapLoc);
    setHeatMapLoading(false);
  }

  const loadGlyphPlot = async(inline) => {
    setGlyphPlotLoading(true);

    const options = {
      "region": {
        "min_x": inline ? regionMinX : nextRegionMinX,
        "max_x": inline ? regionMaxX : nextRegionMaxX,
        "min_y": inline ? regionMinY : nextRegionMinY,
        "max_y": inline ? regionMaxY : nextRegionMaxY,
      },
      "sample_ratio": glyphPlotSampleAuto ? "auto" : glyphPlotSampleRatio,
      "colour_map": glyphPlotColourMap,
      "force_regen": true
    }

    let result;

    try {
      result = await axios.post(`${apiURL}/generate/gradient_glyphs`, options);
    } catch (error) {
      alert("Error");
      console.log({error});
      return;
    }

    const { file_loc: glyphPlotLoc } = result.data;

    setGlyphPlotLocation(glyphPlotLoc);
    setGlyphPlotLoading(false);
  }

  useEffect(() => {
    loadMaps();
  }, []);

  return (
    <div className="flex-row">
      <div className="width-75 flex-col plots-panel">
        <div className="flex-col plot-panel">
          <h2>Selected Region Information</h2>
          <span>Displaying Region: {regionMinX}° ≤ x ≤ {regionMaxX}°, {regionMinY}° ≤ y ≤ {regionMaxY}°</span>
          <span>Displacement Range: {minDisp} km ≤ z ≤ {maxDisp} km</span>
        </div>
        {
          threeDVisible ? (
            <div className="flex-col plot-panel">
              <div className="flex-col description-panel">
                <h1>3D Displacement Map</h1>
                <span>Displays a 3D perspective map of the selected region. Use the arrows to rotate the plot or manually adjust the settings on the right.</span>
              </div>
              {
                threeDImageLocation === null || threeDViewLoading ? (
                  <LoadingHolder />
                ) : (
                  <ThreeDimensionalImagePanel
                    imageLocation={threeDImageLocation}
                    fastUpdateAzimuth={fastUpdateAzimuth}
                    fastUpdateElevation={fastUpdateElevation}
                    currentElevation={perspectiveElevation}
                    currentAzimuth={perspectiveAzimuth}
                    key={threeDImageRefreshKey}
                  />
                )
              }
            </div>
          ) : null
        }
        {
          twoDVisible ? (
            <div className="flex-col plot-panel">
              <div className="flex-col description-panel">
                <h1>2D Displacement Map</h1>
                <span>Displays a 2D top-down view of the selected region. Hover over the plot to see the exact displacement values.</span>
              </div>
              {
                twoDImageLocation === null || twoDViewLoading ? (
                  <LoadingHolder />
                ) : (
                  <TwoDimensionalImagePanel
                    imageLocation={twoDImageLocation}
                    legendLocation={twoDLegendLocation}
                    rawDisplacements={twoDRawDisplacements}
                    pixelsPerDegree={resolutionLookup[resolution]}
                    regionMinX={regionMinX}
                    regionMaxX={regionMaxX}
                    regionMinY={regionMinY}
                    regionMaxY={regionMaxY}
                    updateSelectedRegion={(minX, maxX, minY, maxY) => {
                      setNextRegionMinX(minX);
                      setNextRegionMaxX(maxX);
                      setNextRegionMinY(minY);
                      setNextRegionMaxY(maxY);
                    }}
                    key={twoDImageRefreshKey}
                  />
                )
              }
            </div>
          ) : null
        }
        <div className="flex-row plot-panel bottom-panel">
          <div className="flex-col width-50 segment-panel">
            <div className="flex-col description-panel">
              <h2>Heat Map</h2>
              <span>Displays a 2D Heat Map of the selected region showing the magnitude of the gradient at each point.</span>
              <span>Collective regions of low gradient suggest flat areas relative to the rest of the region.</span>
            </div>
            {
              heatMapLocation === null || heatMapLoading ? (
                <LoadingHolder />
              ) : (
                <img 
                  src={`http://localhost:5000/generated/${heatMapLocation}`}
                  className="cover flex-center-vertical"
                  alt="Gradient Heat Map"
                />
              )
            }
          </div>
          <div className="flex-col width-50 segment-panel">
            <div className="flex-col description-panel">
              <h2>Glyph Map</h2>
              <span>Displays a 2D Glyph Plot of the selected region showing the direction and magnitude of the gradients at each point.</span>
              <span>Regions with small arrows suggest flat areas relative to the rest of the region.</span>
            </div>
            {
              glyphPlotLoading === null || glyphPlotLoading ? (
                <LoadingHolder />
              ) : (
                <img 
                  src={`http://localhost:5000/generated/${glyphPlotLocation}`}
                  className="cover flex-center-vertical"
                  alt="Gradient Glyph Plot"
                />
              )
            }
          </div>
        </div>
      </div>
      <div className="width-25 flex-col options-panel">
        <h1>Map Options</h1>
        <div className="flex-col contained">
          <h2>Primary Settings</h2>
          <div className="input-container">
            <div className="input-row">
              <span>Resolution:</span>
              <select
                value={nextResolution}
                onChange={(e) => setNextResolution(e.target.value)}
              >
                <option value="normal">Normal (4 pixels/degree)</option>
                <option value="high">Very High (16 pixels/degree)</option>
              </select>
            </div>
            <span className="input-help">Use 4</span>
          </div>
        </div>
        <div className="flex-col contained">
          <h2>Height Plot Settings</h2>
          <div className="flex-col contained">
            <h3>2D and 3D Shared Settings</h3>
            <div className="input-container">
              <div className="input-row">
                <span>Main Plot Type:</span>
                <select
                  value={mainPlotDisplay}
                  onChange={(e) => setMainPlotDisplay(e.target.value)}
                >
                  <option value="2d">2D Only</option>
                  <option value="3d">3D Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <span className="input-help">Recommended to use 2D only for large regions!</span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Region X:</span>
                <input 
                  value={nextRegionMinX}
                  onChange={(e) => setNextRegionMinX(e.target.value)}
                  type="number"
                />° 
                <span>≤ x ≤</span>
                <input 
                  value={nextRegionMaxX}
                  onChange={(e) => setNextRegionMaxX(e.target.value)}
                  type="number"
                />°
              </div>
              <span className="input-help"></span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Region Y:</span>
                <input 
                  value={nextRegionMinY} 
                  onChange={(e) => setNextRegionMinY(e.target.value)}
                  type="number"
                />°
                <span>≤ y ≤</span>
                <input 
                  value={nextRegionMaxY} 
                  onChange={(e) => setNextRegionMaxY(e.target.value)}
                  type="number"
                />°
              </div>
              <span className="input-help"></span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Colour Map</span>
                <select 
                  value={colourMap}
                  onChange={(e) => setColourMap(e.target.value)}
                >
                  <option value="geo">Geo</option>
                  <option value="haxby">Rainbow</option>
                </select>
              </div>
              <span className="input-help"></span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Gradient Shading Enabled</span>
                <input
                  type="checkbox"
                  checked={gradientShadingEnabled}
                  onChange={(e) => setGradientShadingEnabled(e.target.checked)}
                />
              </div>
              <span className="input-help"></span>
            </div>
            <div className="flex-row">
              <span>Contours Enabled</span>
              <input
                type="checkbox"
                checked={contoursEnabled}
                onChange={(e) => setContoursEnabled(e.target.checked)}
              />
            </div>
            {
              contoursEnabled ? (
                <div className="flex-col contained">
                  <h4>Contours</h4>
                  <div className="flex-col">
                    <div className="input-container">
                      <div className="input-row">
                        <span>Contour Line Interval</span>
                        <input
                          type="number"
                          value={contourLineInterval}
                          onChange={(e) => setContourLineInterval(e.target.value)}
                        />
                      </div>
                      <span className="input-help">Set to -1 to not draw lines</span>
                    </div>
                    <div className="input-container">
                      <div className="input-row">
                        <span>Contour Annotation Interval</span>
                        <input
                          type="number"
                          value={contourAnnotationInterval}
                          onChange={(e) => setContourAnnotationInterval(e.target.value)}
                        />
                      </div>
                      <span className="input-help">Set to -1 to not draw annotations</span>
                    </div>
                  </div>
                </div>
              ) : null
            }
          </div>
          <div className="flex-col contained">
            <h3>3D Specific Options</h3>
            <div className="input-container">
              <div className="input-row">
                <span>Azimuth:</span>
                <input
                  type="number"
                  value={perspectiveAzimuth}
                  onChange={(e) => setPerspectiveAzimuth(e.target.value)}
                />
              </div>
              <span className="input-help">Recommeneded to use 2D only for large regions!</span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Elevation:</span>
                <input
                  type="number"
                  value={perspectiveElevation}
                  onChange={(e) => setPerspectiveElevation(e.target.value)}
                />
              </div>
              <span className="input-help">Recommeneded to use 2D only for large regions!</span>
            </div>
          </div>
          <button
            onClick={loadMaps}
          >Render All Plots</button>
        </div>
        <div className="flex-col contained">
          <h2>Gradient Plots</h2>
          <div className="flex-col contained">
            <h3>Heatmap</h3>
            <div className="input-container">
              <div className="input-row">
                <span>Heat Map Colour Map:</span>
                <select
                  value={heatMapColourMap}
                  onChange={(e) => setHeatMapColourMap(e.target.value)}
                >
                  <option value="rocket">Rocket</option>
                  <option value="mako">Mako</option>
                  <option value="flare">Flare</option>
                  <option value="crest">Crest</option>
                  <option value="magma">Magma</option>
                  <option value="viridis">Viridis</option>
                </select>
              </div>
              <span className="input-help"></span>
            </div>
            <button onClick={loadHeatMap}>Update Gradient Heat Map</button>
          </div>
          <div className="flex-col contained">
            <h3>Glyph Plot</h3>
            <div className="input-container">
              <div className="input-row">
                <span>Glyph Plot Colour Map:</span>
                <select
                  value={glyphPlotColourMap}
                  onChange={(e) => setGlyphPlotColourMap(e.target.value)}
                >
                  <option value="rocket">Rocket</option>
                  <option value="mako">Mako</option>
                  <option value="flare">Flare</option>
                  <option value="crest">Crest</option>
                  <option value="magma">Magma</option>
                  <option value="viridis">Viridis</option>
                </select>
              </div>
              <span className="input-help"></span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Auto Sample Ratio:</span>
                <input
                  type="checkbox"
                  checked={glyphPlotSampleAuto}
                  onChange={(e) => setGlyphPlotSampleAuto(e.target.checked)}
                />
              </div>
              <span className="input-help"></span>
            </div>
            { glyphPlotSampleAuto ? null : (
              <div className="input-container">
              <div className="input-row">
                <span>Sample Ratio:</span>
                <input
                  type="number"
                  value={glyphPlotSampleRatio}
                  min={0.0001}
                  max={1}
                  step={0.01}
                  onChange={(e) => setGlyphPlotSampleRatio(e.target.value)}
                />
              </div>
              <span className="input-help"></span>
              </div>
            )}
            <button onClick={() => loadGlyphPlot(true)}>Update Glyph Plot</button>
          </div>
        </div>
      </div>
    </div>
  )
}
