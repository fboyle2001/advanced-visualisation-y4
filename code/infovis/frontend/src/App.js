import './App.css';
import { LandmarkMap } from './components/landmark/LandmarkMap';

function App() {
  return (
    <div className="flex-col">
      <h1>Artemis 3</h1>
      <div className="flex-col outline-border">
        <h2>What are the benefits of going to the Moon?</h2>
      </div>
      <div className="flex-col outline-border"> 
        <h2>Where did we land before?</h2>
        <span>Explore the landing sites and the history of the Moon Landings below! On July 20th 1969, Apollo 11 touched down on the Moon and the first human, Neil Armstrong, walked on the Moon!</span>
        <LandmarkMap />
      </div>
    </div>
  );
}

export default App;
