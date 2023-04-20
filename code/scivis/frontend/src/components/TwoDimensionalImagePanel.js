import React, { useEffect, useRef, useState } from 'react';
import { clamp, coordRounding } from './utils';

export const TwoDimensionalImagePanel = (props) => {
  const {
    regionMinX, regionMaxX, regionMinY, regionMaxY, 
    imageLocation, legendLocation,
    rawDisplacements,
    updateSelectedRegion,
    pixelsPerDegree
  } = props;

  const overlayRef = useRef();

  const [overlayCoords, setOverlayCoords] = useState([null, null, null, null]);
  const [currentDisplacement, setCurrentDisplacement] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState([null, null]);

  const [cornerOne, setCornerOne] = useState([null, null]);
  const [cornerTwo, setCornerTwo] = useState([null, null]);
  const [currentCorner, setCurrentCorner] = useState(true); 

  const onRegionSelectClick = (e) => {
    const { clientX, clientY } = e;
    const { x: startX, y: startY } = overlayRef.current.getBoundingClientRect();
    const realClickedX = clientX - startX;
    const realClickedY = clientY - startY;

    if(currentCorner) {
      setCornerOne([realClickedX, realClickedY]);
      setCornerTwo([null, null]);
    } else {
      setCornerTwo([realClickedX, realClickedY]);
    }

    setCurrentCorner(!currentCorner);
  }

  const onHover = (e) => {
    const { clientX, clientY } = e;
    const { x: startX, y: startY, width: boundingWidth, height: boundingHeight } = overlayRef.current.getBoundingClientRect();
    const realClickedX = clientX - startX;
    const realClickedY = clientY - startY;

    const pixelY = clamp(Math.ceil(rawDisplacements.length * realClickedY / boundingHeight) - 1, 0, rawDisplacements.length - 1);
    const selectedArray = rawDisplacements[pixelY];
    const pixelX = clamp(Math.ceil(selectedArray.length * realClickedX / boundingWidth) - 1, 0, selectedArray.length - 1);

    const displacement = selectedArray[pixelX];

    setCurrentDisplacement(displacement);
    setCurrentCoordinates([
      coordRounding(regionMinX + ((regionMaxX - regionMinX) * realClickedX) / boundingWidth, pixelsPerDegree, regionMinX, regionMaxX),
      coordRounding(regionMinY + ((regionMaxY - regionMinY) * (boundingHeight - realClickedY)) / boundingHeight, pixelsPerDegree, regionMinY, regionMaxY)
    ]);
  }

  const onMouseOut = (e) => {
    setCurrentDisplacement(null);
    setCurrentCoordinates([null, null]);
  }

  useEffect(() => {
    const [cornerOneX, cornerOneY] = cornerOne;
    const [cornerTwoX, cornerTwoY] = cornerTwo;

    if(cornerOneX === null || cornerTwoX === null) {
      return;
    }

    const calculateRegionYCoord = (y) => {
      const { height: boundingHeight } = overlayRef.current.getBoundingClientRect();
      return clamp(Math.round(regionMinY + ((regionMaxY - regionMinY) * (boundingHeight - y)) / boundingHeight), regionMinY, regionMaxY);
    }
  
    const calculateRegionXCoord = (x) => {
      const { width: boundingWidth } = overlayRef.current.getBoundingClientRect();
      return clamp(Math.round(regionMinX + ((regionMaxX - regionMinX) * x) / boundingWidth), regionMinX, regionMaxX);
    }

    const { width: boundingWidth, height: boundingHeight } = overlayRef.current.getBoundingClientRect();

    const top = Math.round(cornerOneY < cornerTwoY ? cornerOneY : cornerTwoY);
    const left = Math.round(cornerOneX < cornerTwoX ? cornerOneX : cornerTwoX);
    const bottom = Math.round(boundingHeight - (cornerOneY < cornerTwoY ? cornerTwoY : cornerOneY));
    const right = Math.round(boundingWidth - (cornerOneX < cornerTwoX ? cornerTwoX : cornerOneX));

    const topR = calculateRegionYCoord(top);
    const leftR = calculateRegionXCoord(left);
    const bottomR = calculateRegionYCoord(boundingHeight - bottom);
    const rightR = calculateRegionXCoord(boundingWidth - right);

    console.log("change")

    setOverlayCoords([top, left, bottom, right]);
    updateSelectedRegion(leftR, rightR, bottomR, topR);
  }, [cornerOne, cornerTwo, regionMinX, regionMaxX, regionMinY, regionMaxY]);

  const renderSelectedRegionOverlay = () => {
    const [top, left, bottom, right] = overlayCoords;

    return (
      <div className="selected-region" style={{
        "top": top,
        "left": left,
        "bottom": bottom,
        "right": right
      }}>
      </div>
    )
  }

  return (
    <div>
      <div className="flex-col description-panel">
        <span>
          <strong>Current Values: </strong>
          {currentCoordinates[0] === null ? "Outside Region" : `Latitude (x): ${currentCoordinates[0]}°, Longitude (y): ${currentCoordinates[1]}°, Displacement (z): ${currentDisplacement} km`}
        </span> 
      </div>
      <div
        style={{
          "position": "relative",
          "display": "inline-block",
          "left": "50%",
          "transform": "translateX(-50%)"
        }}
      >
        <img 
          src={`http://localhost:5000/generated/${imageLocation}`}
          className="map-display"
          alt="test"
        />
        
        <div className="map-overlay" 
          onClick={onRegionSelectClick}
          onMouseLeave={onMouseOut}
          onMouseMove={onHover}
          ref={overlayRef}
        />
        { renderSelectedRegionOverlay() }
      </div>
      <img
        src={`http://localhost:5000/generated/${legendLocation}`}
        className="map-display"
        alt="legend"
      /> 
    </div>
  )
}
