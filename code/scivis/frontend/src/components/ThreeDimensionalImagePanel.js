import React from 'react'

export const ThreeDimensionalImagePanel = (props) => {
  const { 
    imageLocation,
    currentElevation, currentAzimuth,
    fastUpdateElevation, fastUpdateAzimuth
  } = props;

  const updateElevation = (degrees) => {
    console.log({currentElevation})
    fastUpdateElevation(degrees);
  }

  const updateAzimuth = (degrees) => {
    fastUpdateAzimuth(degrees)
  }

  return (
    <div>
      <div
        style={{
          "position": "relative",
          "display": "inline-block",
          "left": "50%",
          "transform": "translateX(-50%)",
          "padding": "20px"
        }}
      >
        <img 
          src={`http://localhost:5000/generated/${imageLocation}`}
          className="map-display"
          alt="3D Displacement Map"
        />
        <div className="map-overlay arrow-buffer-div">
          <div className="arrow-main-div">
            <button
              disabled={currentElevation >= 80}
              onClick={() => updateElevation(10)}
            >Top</button>
            <div className="arrow-horizontal-div">
              <button
                onClick={() => updateAzimuth(15)}
              >Left</button>
              <button 
                onClick={() => updateAzimuth(-15)}
              >Right</button>
            </div>
            <button 
              disabled={currentElevation <= 10}
              onClick={() => updateElevation(-10)}
            >Bottom</button>
          </div>
        </div>
      </div>
    </div>
  )
}
