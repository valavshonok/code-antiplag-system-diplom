import { Link, useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { Input } from "../../components/input/Input";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { login, whoAmI } from "../../redux/slices/user";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPasswor] = useState<string>("");

  const token = useAppSelector((state) => state.user.login.token);

  console.log(token);

  useEffect(() => {
    dispatch(whoAmI());
  }, []);

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token]);

  return (
    <div className="w-[400px]">
      <div className="text-[28px] font-bold text-center text-liquid-auth-text">
        Добро пожаловать!
      </div>
      <Input
        onChange={(v) => {
          setUsername(v);
        }}
        type="text"
        autocomplete="username"
        className="mt-[30px]"
        label="Логин"
      />
      <Input
        onChange={(v) => {
          setPasswor(v);
        }}
        type="password"
        autocomplete="password"
        className="mt-[10px] mb-[10px]"
        label="Пароль"
      />

      <Link to={"/auth/register"} className="text-[#6498ff] underline">
        Зарегистрироватся
      </Link>

      <div className="mt-[20px] flex justify-center">
        <PrimaryButton
          text="Войти"
          onClick={() => {
            dispatch(login({ username, password }));
          }}
        />
      </div>
    </div>
  );
};

export default Login;
