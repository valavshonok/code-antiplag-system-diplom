import { Navigate, Route, Routes } from "react-router-dom";
// import { PrimaryButton } from "./components/button/PrimaryButton";
// import { SecondaryButton } from "./components/button/SecondaryButton";
// import { Checkbox } from "./components/checkbox/Checkbox";
// import { Input } from "./components/input/Input";
// import { Switch } from "./components/switch/Switch";
import Home from "./pages/Home";
import Contest from "./pages/Contest";
import ProtectedRoute from "./components/router/ProtectedRoute";
import Auth from "./pages/Auth";
import { Switch } from "./components/switch/Switch";

function App() {
  return (
    <div className="w-full h-full bg-liquid-background flex justify-center">
      <Switch
        className="fixed right-[10px] bottom-[10px] z-50"
        variant="theme"
        size="lg"
        defaultState={localStorage.getItem("theme") === "dark"}
        onChange={(state: boolean) => {
          const theme = state ? "dark" : "light";

          document.documentElement.setAttribute("data-theme", theme);
          localStorage.setItem("theme", theme);
        }}
      />
      <div className="relative w-full max-w-[1600px] h-full ">
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/contest/:id/*" element={<Contest />} />
            <Route path="*" element={<Home />} />
          </Route>
          <Route path="/auth/*" element={<Auth />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
