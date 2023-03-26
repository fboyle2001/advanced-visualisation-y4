import React, { useEffect, useRef, useState } from 'react';
import { clamp } from '../utils';

export const TwoDimensionalImagePanel = (props) => {
  const {regionMinX, regionMaxX, regionMinY, regionMaxY, imageLocation, updateSelectedRegion, rawDisplacements} = props;

  console.log({rawDisplacements})

  const overlayRef = useRef();

  const [minDisp, setMinDisp] = useState(0);
  const [maxDisp, setMaxDisp] = useState(0);

  const [nextRegionMinX, setNextRegionMinX] = useState(regionMinX);
  const [nextRegionMaxX, setNextRegionMaxX] = useState(regionMaxX);
  const [nextRegionMinY, setNextRegionMinY] = useState(regionMinY);
  const [nextRegionMaxY, setNextRegionMaxY] = useState(regionMaxY);

  const [overlayCoords, setOverlayCoords] = useState([null, null, null, null]);
  const [currentDisplacement, setCurrentDisplacement] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState([null, null]);

  const [cornerOne, setCornerOne] = useState([null, null]);
  const [cornerTwo, setCornerTwo] = useState([null, null]);
  const [currentCorner, setCurrentCorner] = useState(true); 

  

  

  useEffect(() => {
    let currentMax = -1000;
    let currentMin = 1000;

    for(let i = 0; i < rawDisplacements.length; i++) {
      for(let j = 0; j < rawDisplacements[i].length; j++) {
        currentMax = Math.max(rawDisplacements[i][j], currentMax);
        currentMin = Math.min(rawDisplacements[i][j], currentMin)
      }
    }

    setMinDisp(currentMin);
    setMaxDisp(currentMax);
  }, [rawDisplacements]);

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

    const pixelY = Math.ceil(rawDisplacements.length * realClickedY / boundingHeight) - 1;
    const selectedArray = rawDisplacements[pixelY];
    const pixelX = Math.ceil(selectedArray.length * realClickedX / boundingWidth) - 1;

    const displacement = selectedArray[pixelX];
    console.log({pixelX, pixelY, displacement})
    setCurrentDisplacement(displacement);
    setCurrentCoordinates([
      clamp(regionMinX + ((regionMaxX - regionMinX) * realClickedX) / boundingWidth, regionMinX, regionMaxX),
      clamp(regionMinY + ((regionMaxY - regionMinY) * (boundingHeight - realClickedY)) / boundingHeight, regionMinY, regionMaxY)
    ]);
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

    setOverlayCoords([top, left, bottom, right]);
    setNextRegionMinX(leftR);
    setNextRegionMaxX(rightR);
    setNextRegionMinY(bottomR);
    setNextRegionMaxY(topR);

    updateSelectedRegion(leftR, rightR, bottomR, topR);
  }, [cornerOne, cornerTwo, regionMinX, regionMaxX, regionMinY, regionMaxY, updateSelectedRegion]);

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
    <>
      <div
        style={{
          "position": "relative",
          "display": "inline-block"
        }}
      >
        <img 
          src={`http://localhost:5000/generated/${imageLocation}`}
          className="map-display"
          alt="test"
        />
        <div className="map-overlay" 
          onClick={onRegionSelectClick}
          onMouseMove={onHover}
          ref={overlayRef}
        >
        </div>
        { renderSelectedRegionOverlay() }
      </div>
      <p>{currentCorner ? null : "Select another point"}</p>
      <p>Selected Region: {nextRegionMinX} {"<="} x {"<="} {nextRegionMaxX}, {nextRegionMinY} {"<="} y {"<="} {nextRegionMaxY}</p>
      <p>Current Displacement: {currentDisplacement ? currentDisplacement : null}</p>
      <p>Coords: {currentCoordinates}</p>
      <p>{minDisp} disp {"<"}= {maxDisp}</p>
    </>
  )
}
