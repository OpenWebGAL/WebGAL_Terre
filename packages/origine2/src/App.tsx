import './App.css';
import { logger } from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";

function App() {

  return (
    // 将编辑器的根元素占满整个视口
    <div className="App" style={{width:'100vw',height:'100vh'}}>
      <DashBoard/>
    </div>
  );
}

export default App;
