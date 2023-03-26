import React, { useEffect, useRef, useState } from 'react';

export const TwoDimensionalImagePanel = (props) => {
  const {regionMinX, regionMaxX, regionMinY, regionMaxY, imageLocation} = props;

  const overlayRef = useRef();

  const [nextRegionMinX, setNextRegionMinX] = useState(-180);
  const [nextRegionMaxX, setNextRegionMaxX] = useState(180);
  const [nextRegionMinY, setNextRegionMinY] = useState(-90);
  const [nextRegionMaxY, setNextRegionMaxY] = useState(90);

  const [overlayCoords, setOverlayCoords] = useState([null, null, null, null]);

  const [cornerOne, setCornerOne] = useState([null, null]);
  const [cornerTwo, setCornerTwo] = useState([null, null]);
  const [currentCorner, setCurrentCorner] = useState(true); 

  const onClickTest = (e) => {
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

  useEffect(() => {
    const [cornerOneX, cornerOneY] = cornerOne;
    const [cornerTwoX, cornerTwoY] = cornerTwo;

    if(cornerOneX === null || cornerTwoX === null) {
      return;
    }

    const calculateRegionYCoord = (y) => {
      const { height: boundingHeight } = overlayRef.current.getBoundingClientRect();
      return Math.round(regionMinY + ((regionMaxY - regionMinY) * (boundingHeight - y)) / boundingHeight);
    }
  
    const calculateRegionXCoord = (x) => {
      const { width: boundingWidth } = overlayRef.current.getBoundingClientRect();
      return Math.round(regionMinX + ((regionMaxX - regionMinX) * x) / boundingWidth);
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
    <>
      <div
        style={{
          "position": "relative",
          "display": "inline-block"
        }}
      >
        <img 
          src={`http://localhost:5000/generated/${imageLocation}`}
          // src="http://localhost:5000/generated/649f2c4c642b28a4d8c9bb6ea5ae41e9b9f4816c593a6fcac43bf16910e01565.png"
          className="map-display"
          alt="test"
        />
        <div className="map-overlay" 
          onClick={onClickTest}
          ref={overlayRef}
        >
        </div>
        { renderSelectedRegionOverlay() }
      </div>
      <p>{currentCorner ? null : "Select another point"}</p>
      <p>Selected Region: {nextRegionMinX} {"<="} x {"<="} {nextRegionMaxX}, {nextRegionMinY} {"<="} y {"<="} {nextRegionMaxY}</p>
    </>
  )
}
