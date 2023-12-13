import { Outlet } from "react-router-dom";
import ReloadPrompt from "./ReloadPrompt";

function App() {
  // replaced dyanmicaly
  const date = "__DATE__";

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div>
        Built at:
        {date}
      </div>
      <Outlet />
      <ReloadPrompt />
    </main>
  );
}

export default App;
