import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadingHolder } from '../components/LoadingHolder';
import { TwoDimensionalPage } from './TwoDimensionalPage';

export const SciVisPage = () => {
  // Don't auto reload when we receive changes to the options
  // Instead buffer them until they hit a button

  return (
    <TwoDimensionalPage />
  )
}
