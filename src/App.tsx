import { Outlet } from "react-router-dom";
import ReloadPrompt from "./ReloadPrompt";

function App() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <Outlet />
      <ReloadPrompt />
    </main>
  );
}

export default App;
