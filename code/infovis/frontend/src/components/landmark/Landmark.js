import React, { useState } from 'react'

export const Landmark = (props) => {
  return (
    <img 
      src={props.isActive ? "./flag_active.png" : "./flag.png"} alt="" 
      onClick={props.onClick}
    />
  )
}
