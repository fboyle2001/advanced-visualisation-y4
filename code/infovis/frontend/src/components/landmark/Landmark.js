import React, { useState } from 'react'

export const Landmark = (props) => {
  return (
    <img 
      src="./flag.png" alt="" 
      onClick={props.setActiveLandmark}
    />
  )
}
