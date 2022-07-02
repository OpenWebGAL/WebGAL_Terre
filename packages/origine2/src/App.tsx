import {PrimaryButton } from '@fluentui/react/lib/Button';
import './App.css';
import { logger } from "./utils/logger";

function App() {

  const handleClick = ()=>{
    logger.info('clicked');
  };

  return (
    <div className="App">
      <PrimaryButton text="Primary" onClick={handleClick} allowDisabledFocus/>
    </div>
  );
}

export default App;
