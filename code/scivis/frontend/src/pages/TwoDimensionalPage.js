import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { TwoDimensionalImagePanel } from '../components/2d/TwoDimensionalImagePanel'
import { LoadingHolder } from '../components/LoadingHolder';

const absoluteXBound = 180;
const absoluteYBound = 90;
const apiURL = "http://127.0.0.1:5000";

export const TwoDimensionalPage = () => {
  // 
  const [loading, setLoading] = useState(true);

  // Current Values
  const [imageLocation, setImageLocation] = useState(null);
  const [legendLocation, setLegendLocation] = useState(null);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [rawDisplacements, setRawDisplacements] = useState([]); 

  const [regionMinX, setRegionMinX] = useState(-180);
  const [regionMaxX, setRegionMaxX] = useState(180);
  const [regionMinY, setRegionMinY] = useState(-90);
  const [regionMaxY, setRegionMaxY] = useState(90);

  // Buffered Next Values
  const [nextRegionMinX, setNextRegionMinX] = useState(-180);
  const [nextRegionMaxX, setNextRegionMaxX] = useState(180);
  const [nextRegionMinY, setNextRegionMinY] = useState(-90);
  const [nextRegionMaxY, setNextRegionMaxY] = useState(90);

  const [nextColourMap, setNextColourMap] = useState("geo");

  const [contoursEnabled, setContoursEnabled] = useState(false);
  const [contourLineInterval, setContourLineInterval] = useState(-1);
  const [contourAnnotationInterval, setContourAnnotationInterval] = useState(-1);
  
  const [gradientShadingEnabled, setGradientShadingEnabled] = useState(false);

  const loadMap = async () => {
    setLoading(true);

    const options = {
      "region": {
        "min_x": nextRegionMinX,
        "max_x": nextRegionMaxX,
        "min_y": nextRegionMinY,
        "max_y": nextRegionMaxY,
      },
      "colour_map": nextColourMap,
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

    setImageLocation(outputLoc);
    setLegendLocation(legendLoc);
    setImageRefreshKey(Date.now());
    setRawDisplacements(selectedRaw);

    setRegionMinX(nextRegionMinX);
    setRegionMaxX(nextRegionMaxX);
    setRegionMinY(nextRegionMinY);
    setRegionMaxY(nextRegionMaxY);

    setLoading(false);
  }

  useEffect(() => {
    loadMap();
  }, []);

  return (
    <div className="flex-row">
      <div className="width-75 height-100">
        {
          imageLocation === null || loading ? (
            <LoadingHolder />
          ) : (
            <TwoDimensionalImagePanel
              imageLocation={imageLocation}
              legendLocation={legendLocation}
              rawDisplacements={rawDisplacements}
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
              key={imageRefreshKey}
            />
          )
        }
        
      </div>
      <div className="width-25 height-100 flex-col">
        <h2>Map Options</h2>
        <div className="flex-row">
          <span>Region X:</span>
          <div className="flex-row">
            <input value={nextRegionMinX} /> 
            <span>{"<"} x {"<"} </span>
            <input value={nextRegionMaxX}/>
          </div>
        </div>
        <div className="flex-row">
          <span>Region Y:</span>
          <div className="flex-row">
            <input value={nextRegionMinY} /> 
            <span>{"<"} y {"<"} </span>
            <input value={nextRegionMaxY} />
          </div>
        </div>
        <div className="flex-row">
          <span>Colour Map</span>
          <select onChange={(e) => setNextColourMap(e.target.value)}>
            <option value="geo">Geo</option>
            <option value="haxby">Rainbow</option>
          </select>
        </div>
        <div className="flex-row">
          <span>Gradient Shading Enabled</span>
          <input
            type="checkbox"
            checked={gradientShadingEnabled}
            onChange={(e) => setGradientShadingEnabled(e.target.checked)}
          />
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
            <div className="flex-col">
              <h3>Contours</h3>
              <div>
                <span>Contour Line Interval</span>
                <input
                  type="number"
                  value={contourLineInterval}
                  onChange={(e) => setContourLineInterval(e.target.value)}
                />
              </div>
              <div>
                <span>Contour Annotation Interval</span>
                <input
                  type="number"
                  value={contourAnnotationInterval}
                  onChange={(e) => setContourAnnotationInterval(e.target.value)}
                />
              </div>
            </div>
          ) : null
        }
        <button
          onClick={loadMap}
        >Load Map</button>
      </div>
    </div>
  )
}
