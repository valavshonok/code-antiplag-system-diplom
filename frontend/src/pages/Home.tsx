import { useEffect, useState } from "react";
import { SecondaryButton } from "../components/button/SecondaryButton";
import { cn } from "../lib/cn";
import { useAppDispatch, useAppSelector } from "../redux/hooks";

import ModalCreateContest from "../views/home/ModalCreateContest";
import ContestItem from "../views/home/ContestItem";
import { fetchContests } from "../redux/slices/contests";
import ModalDeleteContest from "../views/home/ModalDeleteContest";
import ModalUpdateContest from "../views/home/ModalUpdateContest";
import { logout } from "../redux/slices/user";
import { ReverseButton } from "../components/button/ReverseButton";

const Home = () => {
  const dispatch = useAppDispatch();

  const [modalCreateActive, setModalCreateActive] = useState<boolean>(false);
  const [modalUpdateActive, setModalUpdateActive] = useState<boolean>(false);
  const [modalDeleteActive, setModalDeleteActive] = useState<boolean>(false);

  const usetname = useAppSelector((state) => state.user.login.user?.username);

  const { contests, status } = useAppSelector(
    (state) => state.contests.fetchContests,
  );

  useEffect(() => {
    dispatch(fetchContests());
  }, []);

  return (
    <>
      <div className="h-full w-full grid grid-cols-[250px,1fr,250px] box-border ">
        <div></div>
        <div className="h-full box-border p-[10px]">
          <div className="relative flex items-center mb-[20px] ">
            <div
              className={cn(
                "h-[50px] text-[40px] font-bold text-liquid-white flex items-center",
              )}
            >
              Контесты
            </div>

            <SecondaryButton
              onClick={() => {
                setModalCreateActive(true);
              }}
              text="Создать контест"
              className="absolute right-0"
            />
          </div>

          {status == "loading" && (
            <div className="text-liquid-white p-4">Загрузка контестов...</div>
          )}
          {status == "successful" && (
            <>
              {contests.map((v, i) => (
                <ContestItem
                  key={i}
                  contest={v}
                  setModalUpdateActive={setModalUpdateActive}
                  setModalDeleteActive={setModalDeleteActive}
                />
              ))}
            </>
          )}
        </div>

        <div className="p-[10px]">
          <div className="text-[20px] font-bold h-[45px] flex items-center">
            {usetname}
          </div>
          <ReverseButton
            onClick={() => {
              dispatch(logout());
            }}
            text="Выйти"
            className=""
          />
        </div>
      </div>

      <ModalCreateContest
        active={modalCreateActive}
        setActive={setModalCreateActive}
      />
      <ModalDeleteContest
        active={modalDeleteActive}
        setActive={setModalDeleteActive}
      />
      <ModalUpdateContest
        active={modalUpdateActive}
        setActive={setModalUpdateActive}
      />
    </>
  );
};

export default Home;
