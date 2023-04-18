import React, { useRef, useState } from 'react'
import { clamp } from '../utils';
import { Landmark } from './Landmark';
import { Globe } from '../globe/Globe';

// Data sourced from Wikipedia about the moon landing locations
const landmarks = [
  {
    "name": "Tranquillity Base",
    "significance": "Apollo 11",
    "astronauts": "Neil Armstrong, Michael Collins, Buzz Aldrin",
    "date": new Date("1969-07-20"),
    "lat": 23.4,
    "lon": 0.7,
    "short_id": "sot",
    "description": "The first manned mission to the Moon was achieved by NASA in 1969 and took just over 8 days to complete. The astronauts collected samples of the lunar surface and NASA probed the viability of landing humans on other objects in the Solar System."
  },
  {
    "name": "Ocean of Storms",
    "significance": "Apollo 12",
    "astronauts": "Charles 'Pete' Conrad, Richard Gordon, Alan Bean",
    "date": new Date("1969-11-19"),
    "lat": -57.4,
    "lon": 18.4,
    "short_id": "oos",
    "description": "The second manned mission to the Moon was another success. The astronauts spent over a day on the surface of the Moon."
  },
  {
    "name": "Fra Mauro",
    "significance": "Apollo 14",
    "astronauts": "Alan Shepard, Stuart Roosa, Edgar Mitchell",
    "date": new Date("1971-02-04"),
    "lat": -17.5,
    "lon": -3.6,
    "short_id": "fra",
    "description": "Following the failure of Apollo 13 - a stark reminder of the difficulties of space travel - Apollo 14 was the first mission to land in the lunar highlands."
  },
  {
    "name": "Hadley Rille",
    "significance": "Apollo 15",
    "astronauts": "David Scott, Alfred Worden, James Irwin",
    "date": new Date("1971-07-30"),
    "lat": 3.6,
    "lon": 26.1,
    "short_id": "hri",
    "description": "Apollo 15 was the first extended stay on the moon and the first to use the Lunar Rover. The mission took over 12 days to complete."
  },
  {
    "name": "Descartes Highlands",
    "significance": "Apollo 16",
    "astronauts": "John Young, Thomas Kenneth Mattingly, Charles Duke",
    "date": new Date("1972-04-24"),
    "lat": 15.5,
    "lon": -9.0,
    "short_id": "des",
    "description": "The penulimate moon landing arrived a site scientists suspected of being formed by volcanic activity (although this did not turn out to be the case). They collected over 95kg of Moon rocks for analysis."
  },
  {
    "name": "Taurus-Littrow",
    "significance": "Apollo 17",
    "astronauts": "Eugene Cernan, Ronald Evans, Harrison Schmitt",
    "date": new Date("1972-12-11"),
    "lat": 30.7,
    "lon": 20.1,
    "short_id": "tau",
    "description": "Apollo 17 marks the last time humans were on the Moon. Scientists wanted to further investigate volcanic formations on the Moon's surface and the astronauts spent 3 days on the surface of the Moon."
  }
]

export const LandmarkMap = () => {
  const overlayRef = useRef();
  const globeRef = useRef();

  const [mainMapLoaded, setMainMapLoaded] = useState(false);

  const [activeLandmarkID, setActiveLandmarkID] = useState(null);
  const [activeLandmarkName, setActiveLandmarkName] = useState(null);
  const [flagType, setFlagType] = useState("bo_flag");

  const [selectedMapType, setSelectedMapType] = useState("globe");

  // Change the flag for the selected item and rotate the 3D globe if it is available
  const focusLandmark = (name) => {
    setActiveLandmarkID(landmarks.findIndex(x => x.name === name));
    setActiveLandmarkName(name);

    if(globeRef && globeRef.current) {
      globeRef.current.rotateToLandmark(name);
    }
  }

  // Display a timeline of events
  const displayTimeline = () => {
    const sortedLandmarks = landmarks.sort((a, b) => a.date > b.date ? 1 : -1);

    // Calculate the max duration
    const firstDate = sortedLandmarks[0].date;
    const lastDate = sortedLandmarks[sortedLandmarks.length - 1].date;
    const maxDiffDays = (lastDate - firstDate) / (86400 * 1000);

    // Display alternating above and below the timeline
    return (
      <div className="flex-col margin-b">
        <div className="timeline-row">
          <div className="timeline-row-inner">
            {
              sortedLandmarks.map((landmark, i) => {
                if(i % 2 === 1) {
                  return null;
                }

                const diffDays = (landmark.date - firstDate) / (86400 * 1000);
                let percentage = (diffDays / maxDiffDays) * 80;

                return (
                  <div 
                    className={`timeline-item-top ${landmark.name === activeLandmarkName ? "selected-item" : ""}`}
                    style={{
                      left: `${10 + percentage}%`
                    }}
                    onClick={() => focusLandmark(landmark.name)}
                    key={i}
                  >
                    {landmark.significance} - {landmark.date.toLocaleString().split(",")[0]}
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className="timeline-separator"></div>
        <div className="timeline-row">
          <div className="timeline-row-inner">
            {
              sortedLandmarks.map((landmark, i) => {
                if(i % 2 === 0) {
                  return null;
                }

                const diffDays = (landmark.date - firstDate) / (86400 * 1000);
                let percentage = (diffDays / maxDiffDays) * 80;

                return (
                  <div 
                  className={`timeline-item-bottom ${landmark.name === activeLandmarkName ? "selected-item" : ""}`}
                    style={{
                      left: `${10 + percentage}%`
                    }}
                    onClick={() => focusLandmark(landmark.name)}
                    key={i}
                  >
                    {landmark.significance} - {landmark.date.toLocaleString().split(",")[0]}
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    );
  }

  // Determine where to place the flag on the map using the latitude and longitude
  const calculateImagePosition = (lat, lon) => {
    const { width: boundingWidth, height: boundingHeight } = overlayRef.current.getBoundingClientRect();

    const latRatio = clamp(Math.ceil(boundingWidth * (lat + 180) / 360), 0, boundingWidth);
    const lonRatio = clamp(Math.ceil(boundingHeight * (lon + 90) / 180), 0, boundingHeight);

    return [lonRatio, latRatio];
  }

  const renderLandmark = (id, name, lat, lon) => {
    if(!mainMapLoaded) {
      return;
    }

    const [bottom, left] = calculateImagePosition(lat, lon);

    // Place a landmark on the map
    return (
      <div key={id} className="landmark" style={{
        "bottom": bottom,
        "left": left
      }}>
        <Landmark
          isActive={activeLandmarkName === name}
          onClick={() => focusLandmark(name)}
          flag={flagType}
        />
      </div>
    )
  }

  // Show the information when they are focused on the landmark
  const renderLandmarkInformation = () => {
    if(activeLandmarkID === null) {
      return (
        <div className="flex-col information-box">
          <div className="flex-row margin-b input-row">
            <span className="input-name">Flag Colours:</span>
            <select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value)}
            >
              <option value="flag">Red / Green</option>
              <option value="bo_flag">Blue / Orange</option>
            </select>
          </div>
          <h2>Select a Flag</h2>
          <span className="information-box-normal">Click a flag on the map to find out more about the mission and where it landed!</span>
        </div>
      )
    }

    const { name, date, significance, lat, lon, description, astronauts } = landmarks[activeLandmarkID];

    return (
      <div className="flex-col information-box">
        <div className="flex-row margin-b input-row">
          <span className="input-name">Flag Colours:</span>
          <select
            value={flagType}
            onChange={(e) => setFlagType(e.target.value)}
          >
            <option value="flag">Red / Green</option>
            <option value="bo_flag">Blue / Orange</option>
          </select>
        </div>
        <h2>{name}</h2>
        <span className="information-box-sig">{significance} landed here on {date.toLocaleString().split(",")[0]} (Latitude: {lat}°, Longitude: {lon}°)</span>
        <span className="information-box-normal">{description}</span>
        <span className="information-box-normal">The astronauts from NASA involved in this mission were: {astronauts}.</span>
      </div>
    )
  }

  // Show either the 3D Globe, the 3D Surface, or the 2D Top-Down View
  const renderCloseUp = () => {
    if(selectedMapType === "globe") {
      return <Globe 
        landmarks={landmarks}
        ref={globeRef}
      />;
    }

    globeRef.current = null;

    return (
      <img 
        src={`./moon/pygmt/${landmarks[activeLandmarkID]["short_id"]}_${selectedMapType}.png`}
        alt="Map"
      />
    )
  }

  return (
    <>
      <div className="height-100 information-box">
        <h3>Timeline</h3>
        <span className="information-box-normal margin-b">Click an event on the timeline below to find out more about the mission and where it landed!</span>
        { displayTimeline() }
      </div>
      <div className="flex-col width-100">
        <div className="flex-row width-100">
          <div className="width-35 outline-border flex-col">
            <div className="flex-row input-row">
              <span className="input-name">Map Type:</span>
              <select
                value={selectedMapType}
                onChange={(e) => setSelectedMapType(e.target.value)}
              >
                <option value="globe">Globe</option>
                <option value="3d" disabled={activeLandmarkID === null}>3D Close Up</option>
                <option value="2d" disabled={activeLandmarkID === null}>2D Close Up</option>
              </select>
            </div>
            <div className="flex-col flex-center height-100">
              { renderCloseUp() }
            </div>
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
                  landmarks.map(({name, lat, lon}, id) => (
                    renderLandmark(id, name, lat, lon)
                  ))
                }
              </div>
              { renderLandmarkInformation() }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
