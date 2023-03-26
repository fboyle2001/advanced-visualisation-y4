import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadingHolder } from '../components/LoadingHolder';
import { TwoDimensionalSettingsPanel } from '../components/2d/TwoDimensionalSettingsPanel';
import { TwoDimensionalImagePanel } from '../components/2d/TwoDimensionalImagePanel';

export const SciVisPage = () => {
  // Don't auto reload when we receive changes to the options
  // Instead buffer them until they hit a button

  return (
    <div className="flex-row">
      <div className="width-75 height-100">
        <TwoDimensionalImagePanel
          imageLocation={"649f2c4c642b28a4d8c9bb6ea5ae41e9b9f4816c593a6fcac43bf16910e01565.png"}
          regionMinX={-180}
          regionMaxX={180}
          regionMinY={-90}
          regionMaxY={90}
        />
      </div>
      <div className="width-25 height-100 flex-col">
        <TwoDimensionalSettingsPanel />
      </div>
    </div>
  )
}
