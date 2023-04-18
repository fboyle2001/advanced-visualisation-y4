export const Landmark = (props) => {
  // Just displays a clickable flag on the map
  return (
    <img 
      src={props.isActive ? `./${props.flag}_active.png` : `./${props.flag}.png`} alt="Flag" 
      onClick={props.onClick}
    />
  )
}
