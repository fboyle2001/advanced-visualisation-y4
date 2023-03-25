import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadingHolder } from '../components/LoadingHolder';

export const SciVisPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentImageLocation, setCurrentImageLocation] = useState("");
  const [lastLoadingTime, setLastLoadingTime] = useState(0);

  const [shouldLoadMap, setShouldLoadMap] = useState(true);
  const [selectedColourMap, setSelectedColourMap] = useState("haxby");
  const [selectedView, setSelectedView] = useState("2d");

  const [regionMinX, setRegionMinX] = useState(0);
  const [regionMaxX, setRegionMaxX] = useState(40);
  const [regionMinY, setRegionMinY] = useState(-40);
  const [regionMaxY, setRegionMaxY] = useState(0);

  const loadMap = async () => {
    let result;

    setLoading(true);

    let postOptions = {};
    
    if(selectedView === "2d") {
      postOptions = {
        projection: "Q",
        size: "15c"
      }
    }

    postOptions = {
      ...postOptions, 
      region: [regionMinX, regionMaxX, regionMinY, regionMaxY],
      colour_map: selectedColourMap
    }

    try {
      result = await axios.post(`http://127.0.0.1:5000/generate/${selectedView}`, postOptions)
    } catch (error) {
      alert("Unable to load initial map. Is the server running?")
      return;
    }

    const { output_location: outputLocation, generation_time: generationTime } = result.data;
    
    setCurrentImageLocation(outputLocation);
    setLastLoadingTime(generationTime);
    setShouldLoadMap(false);
    setLoading(false);
  }

  useEffect(() => {
    if(shouldLoadMap) {
      loadMap();
    }
  }, [shouldLoadMap]);

  // Don't auto reload when we receive changes to the options
  // Instead buffer them until they hit a button

  return (
    <div className="flex-row">
      <div className="width-75 height-100">
        {
          loading ? ( 
            <LoadingHolder /> 
          ) : (
            <img
              src={`http://127.0.0.1:5000/generated/${currentImageLocation}`}
              className="width-100"
            />
          )
        }
      </div>
      <div className="width-25 height-100 flex-col">
        <div className="flex-col width-100">
        <div className="flex-row">
            <span>View:</span>
            <select onChange={(e) => setSelectedView(e.target.value)} value={selectedView} disabled={loading}>
              <option value="2d">2D</option>
              <option value="3d">3D</option>
            </select>
          </div>
          <div className="flex-row">
            <span>Colour Map:</span>
            <select onChange={(e) => setSelectedColourMap(e.target.value)} value={selectedColourMap} disabled={loading}>
              <option value="haxby">Rainbow</option>
              <option value="geo">Standard Earth Geology</option>
              <option value="zebra">Zebra</option>
            </select>
          </div>
          <div className="flex-row">
            { // xmin/xmax/ymin/ymax 
            } 
            <span>Region:</span>
            <div className="flex-col">
              <div className="flex-row">
                <span>Min X:</span>
                <input
                  type="number"
                  value={regionMinX}
                  onChange={(e) => setRegionMinX(e.target.value)}
                  min={-180}
                  max={180}
                />
              </div>
              <div className="flex-row">
                <span>Max X:</span>
                <input
                  type="number"
                  value={regionMaxX}
                  onChange={(e) => setRegionMaxX(e.target.value)}
                  min={-180}
                  max={180}
                />
              </div>
              <div className="flex-row">
                <span>Min Y:</span>
                <input
                  type="number"
                  value={regionMinY}
                  onChange={(e) => setRegionMinY(e.target.value)}
                  min={-90}
                  max={90}
                />
              </div>
              <div className="flex-row">
                <span>Max Y:</span>
                <input
                  type="number"
                  value={regionMaxY}
                  onChange={(e) => setRegionMaxY(e.target.value)}
                  min={-90}
                  max={90}
                />
              </div>
            </div>
          </div>
          <button disabled={loading} onClick={(e) => setShouldLoadMap(true)}>Load Map</button>
        </div>
      </div>
    </div>
  )
}
