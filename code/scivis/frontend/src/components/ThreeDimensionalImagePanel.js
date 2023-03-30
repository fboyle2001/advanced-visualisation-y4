import React from 'react'

export const ThreeDimensionalImagePanel = (props) => {
  const { 
    imageLocation,
    currentElevation,
    fastUpdateElevation, fastUpdateAzimuth
  } = props;

  const updateElevation = (degrees) => {
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
          "transform": "translateX(-50%)"
        }}
      >
        <div className="map-container-3d">
          <img 
            src={`http://localhost:5000/generated/${imageLocation}`}
            className="map-display"
            alt="3D Displacement Map"
          />
        </div>
        <div>
          <div className="map-overlay">
            <div className="arrow-main-div">
              <button
                disabled={currentElevation >= 80}
                onClick={() => updateElevation(10)}
                title="Increase camera elevation by 10°"
                className="arrow-button"
              >↑</button>
              <div className="arrow-horizontal-div">
                <button
                  onClick={() => updateAzimuth(15)}
                  title="Rotate camera left by 15°"
                  className="arrow-button"
                >←</button>
                <button 
                  onClick={() => updateAzimuth(-15)}
                  title="Rotate camera right by 15°"
                  className="arrow-button"
                >→</button>
              </div>
              <button
                disabled={currentElevation <= 10}
                onClick={() => updateElevation(-10)}
                title="Decrease camera elevation by 10°"
                className="arrow-button"
              >↓</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
