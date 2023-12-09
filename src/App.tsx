import { Outlet } from "react-router-dom";
import ReloadPrompt from "./ReloadPrompt";
import "./App.css";

function App() {
  // replaced dyanmicaly
  const date = "__DATE__";

  return (
    <main className="App">
      <div className="Home-built text-red-600">
        Built at:
        {date}
      </div>
      <Outlet />
      <ReloadPrompt />
    </main>
  );
}

export default App;
