import { Link, useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { Input } from "../../components/input/Input";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { register, whoAmI } from "../../redux/slices/user";

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPasswor] = useState<string>("");
  const [repPassword, setRepPasswor] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [repPasswordError, setRepPasswordError] = useState<string>("");

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

  const validate = () => {
    let isValid = true;

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Некорректная почта");
      isValid = false;
    } else {
      setEmailError("");
    }

    // password validation
    if (password.length < 5) {
      setPasswordError("Пароль должен быть не менее 5 символов");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // repeat password
    if (password !== repPassword) {
      setRepPasswordError("Пароли не совпадают");
      isValid = false;
    } else {
      setRepPasswordError("");
    }

    return isValid;
  };

  return (
    <div className="w-[400px]">
      <div className="text-[28px] font-bold text-center text-liquid-auth-text">
        Создайте аккаунт!
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
          setEmail(v);
        }}
        type="email"
        autocomplete="email"
        className="mt-[10px]"
        label="Почта"
        error={emailError}
      />
      <Input
        onChange={(v) => {
          setPasswor(v);
        }}
        type="password"
        autocomplete="password"
        className="mt-[10px]"
        label="Пароль"
        error={passwordError}
      />
      <Input
        onChange={(v) => {
          setRepPasswor(v);
        }}
        type="password"
        autocomplete="reppassword"
        className="mt-[10px] mb-[10px]"
        label="Повторите пароль"
        error={repPasswordError}
      />

      <Link to={"/auth/login"} className="text-[#6498ff] underline">
        Уже есть аккаунт?
      </Link>

      <div className="mt-[20px] flex justify-center">
        <PrimaryButton
          text="Зарегистрироваться"
          onClick={() => {
            if (!validate()) return;
            dispatch(register({ username, email, password }));
          }}
        />
      </div>
    </div>
  );
};

export default Register;
