import React, { useLayoutEffect, useRef, useState } from 'react'
import { HSVtoRGB, RGBtoHSV, RGBtoHex } from '../utils';

const recursiveSum = (obj) => {
  let sum = 0;

  if(Object.keys(obj).includes("children")) {
    sum = obj.children.reduce((current, child) => current + recursiveSum(child), 0);
  } else if(Object.keys(obj).includes("value")) { 
    sum = obj.value;
  }

  return sum;
}

const normaliseAndSort = (arr) => {
  const parentSums = {};
  let parentTotal = 0;

  for(const parent of arr) {
    const total = recursiveSum(parent);
    parentSums[parent.name] = total;
    parentTotal += total;
  }

  const parentWidths = {};
  
  for(const parentName in parentSums) {
    parentWidths[parentName] = parentSums[parentName] / parentTotal;
  }

  const sortedParentWidths = Object.keys(parentWidths).sort((a, b) => parentWidths[a] > parentWidths[b] ? -1 : 1).map(k => ({[k]: parentWidths[k]}));
  return sortedParentWidths;
}

export const TreemapCell = (props) => {
  const selfRef = useRef();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const createInnerContainer = (remainingWidth, remainingHeight, remainingEntries, dim) => {
    if(Object.keys(remainingEntries).length === 0 || remainingHeight === 0 || remainingWidth === 0) {
      return null;
    }

    let sum = 0;

    console.log(JSON.stringify({remainingEntries}))

    for(const entry of remainingEntries) {
      sum += entry[Object.keys(entry)[0]];
    }

    let norm = [];
    let i = 0;

    for(const entry of remainingEntries) {
      const k = Object.keys(entry)[0];
      const v = remainingEntries[i][k];
      console.log({k ,v})
      norm.push({[k]: v/sum});
      i++;
    }

    console.log(JSON.stringify({norm}))
    

    console.log({sum})

    const currentHSV = RGBtoHSV(...props.colour);
    const nextHSV = [currentHSV.h, currentHSV.s, currentHSV.v * 0.8];
    const nextRGB = HSVtoRGB(...nextHSV);
    const nextRGBArray = [nextRGB.r, nextRGB.g, nextRGB.b];

    let largest = Math.max(remainingWidth, remainingHeight);
    const scalar = largest;
    const smallest = Math.min(remainingWidth, remainingHeight);
    const widthFocus = remainingWidth > remainingHeight;

    let children = [];
    console.log({largest, smallest})

    console.log(JSON.stringify({remainingEntries}))
    console.log(JSON.stringify({norm}))

    let remaining = 100;

    while(largest > smallest && Object.keys(norm).length > 0) {
      const entry = norm[0];
      console.log({entry})
      const entryKey = Object.keys(entry)[0];
      const entryValue = entry[entryKey];
      console.log({entry, entryKey, v: entry[entryKey]})
      largest -= entryValue * scalar;

      let style = {};

      remaining -= entryValue * 100;

      children.push(
        <TreemapCell
          name={entryKey}
          scale={entryValue * 100}
          direction={widthFocus ? "horizontal" : "vertical"}
          totalValue={0}
          data={{value: 0}}
          colour={nextRGBArray}
        />
      )
      console.log({largest, smallest})
      norm.shift();
    }

    console.log({remaining})

    children.push(createInnerContainer(widthFocus ? largest : smallest, widthFocus ? smallest : largest, norm, remaining));
    const ratio = 100//100 * (scalar - largest) / scalar;

    return (
      <div className={widthFocus ? "flex-row" : "flex-col"} style={{width: !widthFocus ? `${dim}%` : "100%", height: !widthFocus ? "100%" : `${dim}%`}}>
        {children}
      </div>
    )
  }

  useLayoutEffect(() => {
    if(selfRef.current) {
      setWidth(selfRef.current.offsetWidth);
      setHeight(selfRef.current.offsetHeight);
    }
  }, []);

  const style = {
    backgroundColor: RGBtoHex(...props.colour)
  }

  // Orient the parent
  if(props.direction == "horizontal") {
    style.width = `${props.scale}%`;
    style.height = "100%"
  } else {
    style.height = `${props.scale}%`;
    style.width = "100%"
  }

  if(Object.keys(props.data).includes("value")) {
    return (
      <div
        className="treemap-cell"
        style={style}
      >(END) {props.name}: {props.data.value}</div>
    )
  }

  const sortedParentWidths = normaliseAndSort(props.data.children)  
  console.log({sortedParentWidths})

  for(const k in sortedParentWidths) {
    console.log({[k]: sortedParentWidths[k]})
  }

  return (
    <div
      className="treemap-cell"
      style={style}
      ref={selfRef}
    >
      <span>N: {props.name}, W: {width}, H: {height}, T: {props.totalValue} </span>
      { createInnerContainer(width, height, sortedParentWidths, 100) }
    </div>
  )
}
