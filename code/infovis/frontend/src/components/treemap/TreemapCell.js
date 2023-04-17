import React, { useLayoutEffect, useRef, useState } from 'react'
import { hslToRgb, rgbToHsl, RGBtoHex } from '../utils';

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

const formatValue = (value) => {
  const realValue = value * 10 ** 6;
  return `$${realValue.toLocaleString()}`;
}

export const TreemapCell = (props) => {
  const selfRef = useRef();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const createInnerContainer = (remainingWidth, remainingHeight, remainingEntries, dim, labelledChildren, deeper) => {
    if(Object.keys(remainingEntries).length === 0 || remainingHeight === 0 || remainingWidth === 0) {
      return null;
    }

    let sum = 0;

    for(const entry of remainingEntries) {
      sum += entry[Object.keys(entry)[0]];
    }

    let norm = [];
    let i = 0;

    for(const entry of remainingEntries) {
      const k = Object.keys(entry)[0];
      const v = remainingEntries[i][k];
      norm.push({[k]: v / sum});
      i++;
    }

    const currentHSL = rgbToHsl(...props.colour);
    const nextHSL = [currentHSL[0], currentHSL[1], currentHSL[2] * 0.7];
    console.log({n: props.name, nextHSL})
    const nextRGB = hslToRgb(...nextHSL);

    let largest = Math.max(remainingWidth, remainingHeight);
    const scalar = largest;
    const smallest = Math.min(remainingWidth, remainingHeight);
    const widthFocus = remainingWidth > remainingHeight;

    let children = [];

    let remaining = 100;

    while(largest > smallest && Object.keys(norm).length > 0) {
      const entry = norm[0];
      const entryKey = Object.keys(entry)[0];
      const entryValue = entry[entryKey];
      largest -= entryValue * scalar;
      remaining -= entryValue * 100;

      let data = {};
      let totalValue = 0;

      if(Object.keys(deeper).includes(entryKey)) {
        data = deeper[entryKey];
        totalValue = labelledChildren[entryKey];
      } else {
        data.value = labelledChildren[entryKey]
      }

      console.log({c: labelledChildren[entryKey]})

      children.push(
        <TreemapCell
          name={entryKey}
          scale={entryValue * 100}
          direction={widthFocus ? "horizontal" : "vertical"}
          totalValue={totalValue}
          data={data}
          colour={nextRGB}
          whiteFont={nextHSL[2] < 0.6}
        />
      )

      norm.shift();
    }

    children.push(createInnerContainer(widthFocus ? largest : smallest, widthFocus ? smallest : largest, norm, remaining, labelledChildren, deeper));

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
    backgroundColor: RGBtoHex(...props.colour),
    color: props.whiteFont ? "white" : "black"
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
        title={`${props.name}: ${formatValue(props.data.value)}`}
      >
        {props.name}: {formatValue(props.data.value)}
      </div>
    )
  }

  const { children } = props.data;
  const sortedParentWidths = normaliseAndSort(children);

  let deeper = {};

  const labelledChildren = children.reduce((acc, v) => {
    if(Object.keys(v).includes("value")) {
      acc[v.name] = v.value;
    } else {
      acc[v.name] = recursiveSum(v);
      deeper[v.name] = v;
    }
    return acc;
  }, {})

  return (
    <div
      className="treemap-cell"
      style={style}
      ref={selfRef}
      title={`${props.name}: ${formatValue(props.totalValue)}`}
    >
      <span className="information-box-normal">{props.name}: {formatValue(props.totalValue)}</span>
      { createInnerContainer(width, height, sortedParentWidths, 100, labelledChildren, deeper) }
      {/* <span>N: {props.name}, W: {width}, H: {height}, T: {props.totalValue} </span> */}
    </div>
  )
}
