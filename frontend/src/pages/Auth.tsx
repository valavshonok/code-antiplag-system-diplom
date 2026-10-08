import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../views/auth/Login";
import Register from "../views/auth/Register";

const Auth = () => {
  return (
    <div className="h-full w-full px-[250px] box-border flex items-center justify-center">
      <div className=" rounded-[10px] p-[20px] border-solid border-[1px] border-liquid-auth-border bg-liquid-auth-background">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Auth;
