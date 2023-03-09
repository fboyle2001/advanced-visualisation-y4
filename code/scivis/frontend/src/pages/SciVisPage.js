import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadingHolder } from '../components/LoadingHolder';

export const SciVisPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentImageLocation, setCurrentImageLocation] = useState("");
  const [lastLoadingTime, setLastLoadingTime] = useState(0);

  const [shouldLoadMap, setShouldLoadMap] = useState(true);
  const [selectedColourMap, setSelectedColourMap] = useState("haxby");

  const loadMap = async () => {
    let result;

    setLoading(true);

    try {
      result = await axios.post("http://127.0.0.1:5000/generate/2d", {
        projection: "Q",
        size: "15c",
        region: [-180, 180, -90, 90],
        colour_map: selectedColourMap
      })
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
            <span>Colour Map:</span>
            <select onChange={(e) => setSelectedColourMap(e.target.value)} value={selectedColourMap} disabled={loading}>
              <option value="haxby">Rainbow</option>
              <option value="geo">Standard Earth Geology</option>
            </select>
          </div>
          <button disabled={loading} onClick={(e) => setShouldLoadMap(true)}>Load Map</button>
        </div>
      </div>
    </div>
  )
}
