import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { TwoDimensionalImagePanel } from '../components/TwoDimensionalImagePanel'
import { LoadingHolder } from '../components/LoadingHolder';
import { ThreeDimensionalImagePanel } from '../components/ThreeDimensionalImagePanel';
import { mod } from '../components/utils';

const apiURL = "http://127.0.0.1:5000";

const resolutionLookup = {
  "normal": 4,
  "high": 16
}

export const SciVisPage = () => {
  const [inputValid, setInputValid] = useState(true);
  const [inputValidMessage, setInputValidMessage] = useState("");

  const [shouldFastPerspectiveUpdate, setShouldFastPerspectiveUpdate] = useState(false);
  const [shouldFastUpdateAll, setShouldFastUpdateAll] = useState(false);

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
  const [mainPlotDisplay, setMainPlotDisplay] = useState("2d");

  const [nextRegionMinX, setNextRegionMinX] = useState(-180);
  const [nextRegionMaxX, setNextRegionMaxX] = useState(180);
  const [nextRegionMinY, setNextRegionMinY] = useState(-90);
  const [nextRegionMaxY, setNextRegionMaxY] = useState(90);

  const [colourMap, setColourMap] = useState("geo");
  const [zebraStripeCount, setZebraStripeCount] = useState(8);

  const [contoursEnabled, setContoursEnabled] = useState(false);
  const [contourLineInterval, setContourLineInterval] = useState(-1);
  const [contourLineColour, setContourLineColour] = useState("black");
  const [contourLineThickness, setContourLineThickness] = useState(1);
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
  const [glyphPlotColourMap, setGlyphPlotColourMap] = useState("flare");

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

  const checkValidity = () => {
    if(nextRegionMinX?.length === 0 || Number(nextRegionMinX) < -180) {
      return [false, "Latitude must be >= -180"];
    }

    if(nextRegionMaxX?.length === 0 || Number(nextRegionMaxX) > 180) {
      return [false, "Latitude must be <= 180"];
    }

    if(nextRegionMinY?.length === 0 || Number(nextRegionMinY) < -90) {
      return [false, "Longitude must be >= -90"];
    }

    if(nextRegionMaxY?.length === 0 || Number(nextRegionMaxY) > 90) {
      return [false, "Longitude must be <= 90"];
    }

    if(Number(nextRegionMinX) >= Number(nextRegionMaxX)) {
      return [false, "Minimum latitude must be less than the maximum"];
    }
    
    if(Number(nextRegionMinY) >= Number(nextRegionMaxY)) {
      return [false, "Minimum longitude must be less than the maximum"];
    }

    if(perspectiveAzimuth?.length === 0 || Number(perspectiveAzimuth) > 360) {
      return [false, "Elevation must <= 360"];
    }

    if(Number(perspectiveAzimuth) < 0) {
      return [false, "Elevation must >= 0"];
    }

    if(perspectiveElevation?.length === 0 || Number(perspectiveElevation) >= 90) {
      return [false, "Elevation must < 90"];
    }

    if(Number(perspectiveElevation) <= 0) {
      return [false, "Elevation must > 0"];
    }

    if(glyphPlotSampleRatio?.length === 0 || Number(glyphPlotSampleRatio <= 0) || Number(glyphPlotSampleRatio > 1)) {
      return [false, "Glyph plot sample ratio must between 0 and 1."];
    }

    return [true, ""];
  }

  useEffect(() => {
    const [valid, message] = checkValidity();

    setInputValid(valid);
    setInputValidMessage(message);
  }, [nextRegionMinX, nextRegionMaxX, nextRegionMinY, nextRegionMaxY, perspectiveAzimuth, perspectiveElevation, mainPlotDisplay, glyphPlotSampleRatio]);

  useEffect(() => {
    if(!shouldFastPerspectiveUpdate) {
      return;
    }

    load3DMap();

    setShouldFastPerspectiveUpdate(false);
  }, [shouldFastPerspectiveUpdate]);

  useEffect(() => {
    if(!shouldFastUpdateAll) {
      return;
    }

    loadMaps();

    setShouldFastUpdateAll(false);
  }, [shouldFastUpdateAll]);

  const resetToGlobalView = () => {
    setNextRegionMinX(-180);
    setNextRegionMaxX(180);
    setNextRegionMinY(-90);
    setNextRegionMaxY(90);

    setMainPlotDisplay("2d");

    setShouldFastUpdateAll(true);
  }

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
      "zebra_stripe_count": zebraStripeCount,
      "contours": {
        "enabled": contoursEnabled,
        "line_interval": contourLineInterval,
        "line_thickness": contourLineThickness,
        "line_colour": contourLineColour,
        "annotation_interval": contourAnnotationInterval,
      },
      "gradient_shading_enabled": gradientShadingEnabled,
      "force_regen": false
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

    set2DViewLoading(false);
    set2DVisible(true);
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
        "line_thickness": contourLineThickness,
        "line_colour": contourLineColour,
        "annotation_interval": contourAnnotationInterval
      },
      "gradient_shading_enabled": gradientShadingEnabled,
      "azimuth": perspectiveAzimuth,
      "elevation": perspectiveElevation,
      "force_regen": false
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

    setRegionMinX(Number(nextRegionMinX));
    setRegionMaxX(Number(nextRegionMaxX));
    setRegionMinY(Number(nextRegionMinY));
    setRegionMaxY(Number(nextRegionMaxY));
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
      "force_regen": false
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
      "force_regen": false
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
          twoDVisible  ? (
            <div className="flex-col plot-panel">
              <div className="flex-col description-panel">
                <h1>2D Displacement Map</h1>
                <span>Displays a 2D top-down view of the selected region. Hover over the plot to see the exact displacement values.</span>
                <span>Click two points on the map to select a region to zoom in on!</span>
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
              <span>Works best for small regions</span>
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
        <div className="options-sticky">
          <h1>Map Options</h1>
          <div className="flex-col contained">
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
              <span className="input-help">Note 16 pixels/degree is substantially slower!</span>
            </div>
          </div>
          <div className="flex-col contained">
            <h2>Height Plot Settings</h2>
            <button
              onClick={resetToGlobalView}
            >Reset to Global View</button>
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
                  <span>Region Latitude:</span>
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
                <span className="input-help">Between -180 and 180 inclusive, limits cannot be equal.</span>
              </div>
              <div className="input-container">
                <div className="input-row">
                  <span>Region Longitude:</span>
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
                <span className="input-help">Between -90 and 90 inclusive, limits cannot be equal.</span>
              </div>
              <div className="input-container">
                <div className="input-row">
                  <span>Colour Map</span>
                  <select 
                    value={colourMap}
                    onChange={(e) => setColourMap(e.target.value)}
                  >
                    <option value="cubhelix">Cubhelix</option>
                    <option value="elevation">Elevation</option>
                    <option value="magma">Magma</option>
                    <option value="lajolla">Lajolla</option>
                    <option value="hawaii">Hawaii</option>
                    <option value="davos">Davos</option>
                    <option value="gray">Gray</option>
                    <option value="topo">topo</option>
                    <option value="geo">Geo</option>
                    <option value="haxby">Rainbow</option>
                    <option value="zebra">Zebra</option>
                  </select>
                </div>
                <span className="input-help"></span>
              </div>
              {
                colourMap === "zebra" ? (
                  <div className="input-container">
                    <div className="input-row">
                      <span>Zebra Stripe Count:</span>
                      <input
                        type="number"
                        value={zebraStripeCount}
                        onChange={(e) => setZebraStripeCount(e.target.value)}
                      />
                    </div>
                    <span className="input-help">The number of dividing stripes for the Zebra colour map</span>
                  </div>
                ) : null
              }
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
                            min={0}
                            type="number"
                            value={contourLineInterval}
                            onChange={(e) => setContourLineInterval(e.target.value)}
                          />
                        </div>
                        <span className="input-help"></span>
                      </div>
                      <div className="input-container">
                        <div className="input-row">
                          <span>Contour Line Thickness</span>
                          <input
                            type="number"
                            min={1}
                            value={contourLineThickness}
                            onChange={(e) => setContourLineThickness(e.target.value)}
                          />
                        </div>
                        <span className="input-help"></span>
                      </div>
                      <div className="input-container">
                        <div className="input-row">
                          <span>Contour Line Colour</span>
                          <select
                            value={contourLineColour}
                            onChange={(e) => setContourLineColour(e.target.value)}
                          >
                            <option value="black">Black</option>
                            <option value="blue">Blue</option>
                            <option value="red">Red</option>
                            <option value="white">White</option>
                            <option value="green">Green</option>
                            <option value="purple">Purple</option>
                          </select>
                        </div>
                        <span className="input-help"></span>
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
                <span className="input-help">Set the horizontal camera angle (between 0 and 360 inclusive).</span>
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
                <span className="input-help">Set the vertical camera angle (between 0 and 90 exclusive).</span>
              </div>
            </div>
            <button
              onClick={loadMaps}
              disabled={!inputValid}
              className="render-all-button"
            >Render All Plots</button>
            {
              inputValid ? null : (
                <span>{inputValidMessage}</span>
              )
            }
          </div>
          <span>You can also manually adjust the Heatmap and Glyph Plot and load them without reloading the main plots:</span>
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
                    <option value="flare">Flare</option>
                    <option value="flare_r">Flare Reversed</option>
                    <option value="mako">Mako</option>
                    <option value="mako_r">Mako Reversed</option>
                    <option value="crest">Crest</option>
                    <option value="crest_r">Crest Reversed</option>
                  </select>
                </div>
                <span className="input-help"></span>
              </div>
              <button
                disabled={!inputValid}
                onClick={loadHeatMap}
              >Update Gradient Heat Map</button>
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
                    <option value="flare">Flare</option>
                    <option value="flare_r">Flare Reversed</option>
                    <option value="mako">Mako</option>
                    <option value="mako_r">Mako Reversed</option>
                    <option value="crest">Crest</option>
                    <option value="crest_r">Crest Reversed</option>
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
                <span className="input-help">Attempts to determine a reasonable number of glyphs to show. Disable this to manually configure.</span>
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
              <button
                disabled={!inputValid}
                onClick={() => loadGlyphPlot(true)}
              >Update Glyph Plot</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
