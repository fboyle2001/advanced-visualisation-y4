import './App.css';
import { BenefitList } from './components/benefits/BenefitList';
import { LandmarkMap } from './components/landmark/LandmarkMap';
import { Treemap } from './components/treemap/Treemap';

function App() {
  return (
    <div className="flex-col">
      <div className="flex-row information-box flex-split outline-border">
        <div className="flex-col flex-center">
          <h1>Artemis 3</h1>
          <span className="information-box-sig">Returning to the Moon by the end of 2025</span>
        </div>
        <div className="flex-row img-container">
          <img src="./artemis_logo.svg" className="responsive-image" alt="Artemis Logo" />
          <img src="./nasa_logo.svg" className="responsive-image" alt="NASA Logo" />
        </div>
      </div>
      <div className="flex-col outline-border information-box">
        <h2>The Cost of Space Travel</h2>
        <span className="information-box-normal margin-b">Leaving Earth isn't cheap, during 2023 NASA has a budget of $25,383,700,000. Hover each section below to see the exact value that is being spent!</span>
        <Treemap />
      </div>
      <div className="flex-col outline-border"> 
        <div className="information-box">
          <h2>Where to Land?</h2>
          <span className="information-box-normal">Explore the landing sites and the history of the Moon Landings below! On July 20th 1969, Apollo 11 touched down on the Moon and the first human, Neil Armstrong, walked on the Moon!</span>
          <span className="information-box-normal">Click on a flag or an event on the timeline to find out more about each landing site. You can select either a 3D globe view, a 3D surface view, or a 2D top-down view for each site.</span>
          <span className="information-box-normal">You can visualise the height of the moon by adjusting the 'Displacement' slider on the 3D globe.</span>
        </div>
        <LandmarkMap />
      </div>
      <div className="flex-col outline-border information-box">
        <h2>The Benefits</h2>
        <span className="information-box-normal margin-b">The Apollo Program required huge amounts of research and development. Many of the breakthroughs encouraged by the program are used daily by many people.</span>
        <BenefitList />
      </div>
    </div>
  );
}

export default App;