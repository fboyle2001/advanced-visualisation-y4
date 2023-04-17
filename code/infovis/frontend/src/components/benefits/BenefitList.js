import React, { useState } from 'react'
import { Benefit } from './Benefit';

export const BenefitList = () => {
  const [name, setName] = useState(null); 
  const [description, setDescription] = useState(null); 

  const updateParent = (name, description) => {
    setName(name);
    setDescription(description);
  }

  return (
    <div className="flex-col">
      <div className="flex-row spaced margin-b" style={{ maxHeight: "300px"}}>
        <Benefit 
          imgPath="./gps.jpg"
          name="Satellites"
          description="Rockets allow us to put satellites in orbit around the Earth. We use these all the time without realising. They provide communication and location data such as GPS."
          updateParent={updateParent}
        />
        <Benefit 
          imgPath="./phone.jpg"
          name="Electronics"
          description="The Apollo Program needed many electronics to fit into a tiny space, as such NASA developed techniques to reduce the size of electronics paving the way for small form factor devices such as mobile phones."
          updateParent={updateParent}
        />
        <Benefit 
          imgPath="./solar_panels.jpg"
          name="Solar Panels"
          description="Advancements developed by NASA during the Apollo Program to generate electricity on the command module lead to the invention of the solar panel. They help to reduce pollution and harness renewable energy."
          updateParent={updateParent}
        />
      </div>
      <div className="flex-col">
        <h3>{name ? name : "Select an Invention"}</h3>
        {
          description ? (
            <span className="information-box-normal">{description}</span>
          ) : null
        }
      </div>
    </div>
    
  )
}
