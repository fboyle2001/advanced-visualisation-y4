import React, { useEffect, useRef, useState } from 'react'
import { clamp } from '../utils';
import { Landmark } from './Landmark';

const landmarks = [
  {
    "name": "Sea of Tranquillity",
    "significance": "Apollo 11 Landing Site",
    "lat": 31.4,
    "lon": 8.5,
    "short_id": "sot"
  },
  {
    "name": "Ocean of Storms",
    "significance": "Apollo 12 Landing Site",
    "lat": -57.4,
    "lon": 18.4,
    "short_id": "oos"
  },
  {
    "name": "Fra Mauro",
    "significance": "Apollo 14 Landing Site",
    "lat": -17.47136,
    "lon": -3.6453,
    "short_id": "fra"
  },
  {
    "name": "Hadley Rille",
    "significance": "Apollo 15 Landing Site",
    "lat": 3.63386,
    "lon": 26.13222,
    "short_id": "hri"
  },
  {
    "name": "Descartes Highlands",
    "significance": "Apollo 16 Landing Site",
    "lat": 15.50019,
    "lon": -8.97301,
    "short_id": "des"
  },
  {
    "name": "Taurus-Littrow",
    "significance": "Apollo 17 Landing Site",
    "lat": 30.7717,
    "lon": 20.1908,
    "short_id": "tau"
  }
]

export const LandmarkMap = () => {
  const overlayRef = useRef();

  const [mainMapLoaded, setMainMapLoaded] = useState(false);

  const [activeLandmarkID, setActiveLandmarkID] = useState(null);

  const [selectedMapType, setSelectedMapType] = useState("globe");

  const calculateImagePosition = (lat, lon) => {
    const { width: boundingWidth, height: boundingHeight } = overlayRef.current.getBoundingClientRect();

    const latRatio = clamp(Math.ceil(boundingWidth * (lat + 180) / 360), 0, boundingWidth);
    const lonRatio = clamp(Math.ceil(boundingHeight * (lon + 90) / 180), 0, boundingHeight);

    return [lonRatio, latRatio];
  }

  const renderLandmark = (id, lat, lon) => {
    if(!mainMapLoaded) {
      return;
    }

    const [bottom, left] = calculateImagePosition(lat, lon);

    return (
      <div className="landmark" style={{
        "bottom": bottom,
        "left": left
      }}>
        <Landmark 
          setActiveLandmark={() => {setActiveLandmarkID(id)}}
        />
      </div>
    )
  }

  const renderLandmarkInformation = () => {
    if(activeLandmarkID === null) {
      return <div>Click a flag</div>
    }

    const { name, significance, lat, lon } = landmarks[activeLandmarkID];

    return (
      <div className="flex-col">
        <h2>{name}</h2>
        <span>{significance}</span>
      </div>
    )
  }

  const renderCloseUp = () => {
    if(selectedMapType === "globe") {
      return null;
    }

    return (
      <img 
        src={`./moon/pygmt/${landmarks[activeLandmarkID]["short_id"]}_${selectedMapType}.png`}
        alt="Map"
      />
    )
  }

  return (
    <div className="flex-col width-100">
      <div className="flex-row width-100">
        <div className="width-35 outline-border flex-col">
          <select
            value={selectedMapType}
            onChange={(e) => setSelectedMapType(e.target.value)}
          >
            <option value="globe">Globe</option>
            <option value="3d" disabled={activeLandmarkID === null}>3D Close Up</option>
            <option value="2d" disabled={activeLandmarkID === null}>2D Close Up</option>
          </select>
          { renderCloseUp() }
        </div>
        <div className="width-65 outline-border">
          <div className="flex-col">
            <div className="map-container" ref={overlayRef}>
              <img 
                src="./moon/colour/lroc_color_poles_2k.png"
                alt="test"
                onLoad={() => setMainMapLoaded(true)}
              />
              {
                landmarks.map(({lat, lon}, id) => (
                  renderLandmark(id, lat, lon)
                ))
              }
            </div>
            { renderLandmarkInformation() }
          </div>
        </div>
      </div>
      <div>
        <h2>Timeline</h2>
      </div>
    </div>
  )
}