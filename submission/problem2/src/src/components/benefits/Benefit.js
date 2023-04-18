import React from 'react'

export const Benefit = (props) => {
  return (
    <div className="flex-col" onClick={() => {
        props.updateParent(props.name, props.description)
    }}>
        <img
            src={props.imgPath}
            className="responsive-image"
        />
    </div>
  )
}
