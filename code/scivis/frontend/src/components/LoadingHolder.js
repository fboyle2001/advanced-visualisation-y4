import React from 'react'

export const LoadingHolder = () => {
  return (
    <div
      className="loading-div"
    >
      <span className="loading-title">Image Generating...</span>
      <span>This may take a little while depending on the parameters set and the size of the region.</span>
    </div>
  )
}
