import React from 'react'
import { TreemapCell } from './TreemapCell';
import data from './data.json';

// Pastel colours
// Generated using https://coolors.co/palettes/popular/pastel
const colours = [
  [251, 248, 204],
  [253, 228, 207],
  [255, 207, 210],
  [241, 192, 232],
  [207, 186, 240],
  [163, 196, 243],
  [144, 219, 244],
  [142, 236, 245],
  [152, 245, 225]
]

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

    let sortedKeys = Object.keys(parentWidths).sort((a, b) => parentWidths[a] > parentWidths[b] ? -1 : 1);

    // A bit of hardcoding to fix the parents

    return (
      <div className="flex-row inner-border" style={{ height: "700px" }}>
        {
          sortedKeys.slice(0, 2).map((parentName, i) => {
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
        <div className="flex-col inner-border" style={{ width: "40%", height: "100%"}}>
          {
            sortedKeys.slice(2, 4).map((parentName, i) => {
              return (
                <TreemapCell
                  name={parentName}
                  scale={100 * parentWidths[parentName] / (1 - 0.601355)}
                  direction="vertical"
                  totalValue={parentSums[parentName]}
                  data={data.filter(x => x.name === parentName)[0]}
                  colour={colours[i + 2]}
                />
              )
            })
          }
          <div className="flex-row inner-border" style={{ width: "100%", height: "28%"}}>
          {
            sortedKeys.slice(4).map((parentName, i) => {
              return (
                <TreemapCell
                  name={parentName}
                  scale={100 * parentWidths[parentName] / (1 - 0.601355 - 0.31)}
                  direction="horizontal"
                  totalValue={parentSums[parentName]}
                  data={data.filter(x => x.name === parentName)[0]}
                  colour={colours[i + 4]}
                />
              )
            })
          }
        </div>
        </div>
      </div>
    );
  }

  return displayTopLevel();
}
