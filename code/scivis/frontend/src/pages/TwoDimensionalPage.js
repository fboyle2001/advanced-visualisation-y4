import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { TwoDimensionalImagePanel } from '../components/2d/TwoDimensionalImagePanel'
import { LoadingHolder } from '../components/LoadingHolder';

const absoluteXBound = 180;
const absoluteYBound = 90;
const apiURL = "http://127.0.0.1:5000";

export const TwoDimensionalPage = () => {
  // Current Values
  const [imageLocation, setImageLocation] = useState(null);
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

  const loadMap = async () => {
    const options = {
      "region": {
        "min_x": nextRegionMinX,
        "max_x": nextRegionMaxX,
        "min_y": nextRegionMinY,
        "max_y": nextRegionMaxY,
      },
      "colour_map": nextColourMap
    };

    let result;

    try {
      result = await axios.post(`${apiURL}/generate/2d`, options);
    } catch (error) {
      alert("Error");
      console.log({error});
      return;
    }

    const { output_location: outputLocation, selected_raw: selectedRaw } = result.data;

    setImageLocation(outputLocation);
    setImageRefreshKey(Date.now());
    setRawDisplacements(selectedRaw);

    setRegionMinX(nextRegionMinX);
    setRegionMaxX(nextRegionMaxX);
    setRegionMinY(nextRegionMinY);
    setRegionMaxY(nextRegionMaxY);
  }

  useEffect(() => {
    loadMap();
  }, []);

  return (
    <div className="flex-row">
      <div className="width-75 height-100">
        {
          imageLocation === null ? (
            <LoadingHolder />
          ) : (
            <TwoDimensionalImagePanel
              imageLocation={imageLocation}
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
        <button
          onClick={loadMap}
        >Load Map</button>
      </div>
    </div>
  )
}
