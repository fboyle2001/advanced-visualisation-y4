import React from 'react'
import { TreemapCell } from './TreemapCell';
import data from './data.json';

const colours = [[242, 146, 131], [136, 131, 242], [117, 128, 51], [122, 43, 118]]

const recursiveSum = (obj) => {
  let sum = 0;

  if(Object.keys(obj).includes("children")) {
    sum = obj.children.reduce((current, child) => current + recursiveSum(child), 0);
  } else if(Object.keys(obj).includes("value")) { 
    sum = obj.value;
  }

  return sum;
}

export const Treemap = () => {
  const displayTopLevel = () => {
    const parentSums = {};
    let parentTotal = 0;

    for(const parent of data) {
      const total = recursiveSum(parent);
      parentSums[parent.name] = total;
      parentTotal += total;
    }

    const parentWidths = {};
    
    for(const parentName in parentSums) {
      parentWidths[parentName] = parentSums[parentName] / parentTotal;
    }

    return (
      <div className="flex-row" style={{ height: "500px" }}>
        {
          Object.keys(parentWidths).sort((a, b) => parentWidths[a] > parentWidths[b] ? -1 : 1).map((parentName, i) => {
            return (
              <TreemapCell
                name={parentName}
                scale={parentWidths[parentName] * 100}
                direction="horizontal"
                totalValue={parentSums[parentName]}
                data={data.filter(x => x.name === parentName)[0]}
                colour={colours[i]}
              />
            )
          })
        }
      </div>
    );
  }

  return displayTopLevel();
}
