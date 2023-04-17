import React, { useState } from 'react'

export const Landmark = (props) => {
  const onClickHandler = (e) => {
    props.setActiveLandmark();
    props.onClickRotate();
  }
  return (
    <img 
      src="./flag.png" alt="" 
      onClick={onClickHandler}
    />
  )
}
