import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { TwoDimensionalImagePanel } from '../components/TwoDimensionalImagePanel'
import { LoadingHolder } from '../components/LoadingHolder';

const absoluteXBound = 180;
const absoluteYBound = 90;
const apiURL = "http://127.0.0.1:5000";

const resolutionLookup = {
  "normal": 4,
  "high": 16
}

export const SciVisPage = () => {
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

  const [regionMinX, setRegionMinX] = useState(-180);
  const [regionMaxX, setRegionMaxX] = useState(180);
  const [regionMinY, setRegionMinY] = useState(-90);
  const [regionMaxY, setRegionMaxY] = useState(90);

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

  const [contoursEnabled, setContoursEnabled] = useState(false);
  const [contourLineInterval, setContourLineInterval] = useState(-1);
  const [contourAnnotationInterval, setContourAnnotationInterval] = useState(-1);
  
  const [gradientShadingEnabled, setGradientShadingEnabled] = useState(false);

  // 3D Specific Options
  const [perspectiveAzimuth, setPerspectiveAzimuth] = useState(135);
  const [perspectiveElevation, setPerspectiveElevation] = useState(30);

  // Heat Map Options
  const [heatMapColourMap, setHeatMapColourMap] = useState("rocket");

  // Glyph Plot Options
  const [glyphPlotSampleRatio, setGlyphPlotSampleRatio] = useState(0.4);

  // Histogram Options

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
    
    const { output_location: outputLoc, legend_location: legendLoc, selected_raw: selectedRaw } = result.data;

    set2DImageLocation(outputLoc);
    set2DLegendLocation(legendLoc);
    set2DRawDisplacements(selectedRaw);
    set2DImageRefreshKey(Date.now());

    set2DVisible(true);
    set2DViewLoading(false);
  }

  const load3DMap = async() => {
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
    
    const { output_location: outputLoc } = result.data;

    set3DImageLocation(outputLoc);
    set3DImageRefreshKey(Date.now());

    set3DVisible(true);
    set3DViewLoading(false);
  }

  const loadMaps = async () => {
    await changeResolution();

    loadGlyphPlot();
    loadHeatMap();

    if(mainPlotDisplay === "both" || mainPlotDisplay === "2d") {
      load2DMap();
      set2DVisible(true);
    } else {
      set2DVisible(false);
    }

    if(mainPlotDisplay === "both" || mainPlotDisplay === "3d") {
      load3DMap();
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
      "colour_map": heatMapColourMap
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

  const loadGlyphPlot = async() => {
    setGlyphPlotLoading(true);

    const options = {
      "region": {
        "min_x": nextRegionMinX,
        "max_x": nextRegionMaxX,
        "min_y": nextRegionMinY,
        "max_y": nextRegionMaxY,
      },
      "sample_ratio": glyphPlotSampleRatio
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
      <div className="width-75 flex-col">
        {
          twoDVisible ? (
            <>
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
            </>
          ) : null
        }
        {
          threeDVisible ? (
            <>
              {
                threeDImageLocation === null || threeDViewLoading ? (
                  <LoadingHolder />
                ) : (
                  <img 
                    src={`http://localhost:5000/generated/${threeDImageLocation}`}
                    className="map-display"
                    alt="test"
                  />
                )
              }
            </>
          ) : null
        }
        
        <div className="flex-row">
          <div className="flex-col width-50">
            <h2>Heat Map</h2>
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
          <div className="flex-col width-50">
            <h2>Glyph Plot</h2>
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
      <div className="width-25 flex-col">
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
            <h3>Shared</h3>
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
                /> 
                <span>{"<"} x {"<"} </span>
                <input 
                  value={nextRegionMaxX}
                  onChange={(e) => setNextRegionMaxX(e.target.value)}
                />
              </div>
              <span className="input-help"></span>
            </div>
            <div className="input-container">
              <div className="input-row">
                <span>Region Y:</span>
                <input 
                  value={nextRegionMinY} 
                  onChange={(e) => setNextRegionMinY(e.target.value)}
                /> 
                <span>{"<"} y {"<"} </span>
                <input 
                  value={nextRegionMaxY} 
                  onChange={(e) => setNextRegionMaxY(e.target.value)}
                />
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
            <h3>2D Specific Options</h3>
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
            <span>Visualise gradient magnitude to identify relatively flat locations</span>
            <div className="input-container">
              <div className="input-row">
                <span>Heat Map Colour Map</span>
                <select
                  value={heatMapColourMap}
                  onChange={(e) => setHeatMapColourMap(e.target.value)}
                >
                  <option value="rocket">Rocket</option>
                  <option value="mako">Mako</option>
                </select>
              </div>
              <span className="input-help"></span>
            </div>
            <button onClick={loadHeatMap}>Update Gradient Heat Map</button>
          </div>
          <div className="flex-col contained">
            <h3>Glyph Plot</h3>
            <span>Visualise gradients as glyphs to identify directional changes in gradient</span>
            <div className="input-container">
              <div className="input-row">
                <span>Sample Ratio</span>
                <input
                  type="number"
                  value={glyphPlotSampleRatio}
                  min={0.0001}
                  max={1}
                  onChange={(e) => setGlyphPlotSampleRatio(e.target.value)}
                />
              </div>
              <span className="input-help"></span>
            </div>
            <div className="flex-row">
            </div>
            <button onClick={loadGlyphPlot}>Update Glyph Plot</button>
          </div>
          <div className="flex-col contained">
            <h4>Histogram</h4>
            <span>Visualise distribution of gradients to summarise the flatness of the region</span>
            {/* <button onClick={loadHistogramPlot}>Load Histogram Plot</button> */}
          </div>
        </div>
      </div>
    </div>
  )
}
