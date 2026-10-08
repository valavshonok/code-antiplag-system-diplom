import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setMenuActivePage } from "../../../redux/slices/store";
// import { cn } from "../../../lib/cn";
import { Contest } from "../../../types/contest";
import { fetchContestProcesses } from "../../../redux/slices/contests";
import { ImportProcesses } from "./import-process/ImportProcess";
import { ModalStopProcess } from "./ModalStopProcess";
import { ComparisonProcesses } from "./comparison/ComparisonProcess";
import { ConditionProcesses } from "./condition/ConditionProcess";

interface ProcessesProps {
  contest: Contest;
}

export const Processes: FC<ProcessesProps> = ({ contest }) => {
  const dispatch = useAppDispatch();

  const { processes } = useAppSelector(
    (state) => state.contests.fetchContestProcesses,
  );

  const [modalStopProcessActive, setModalStopProcessActive] =
    useState<boolean>(false);

  useEffect(() => {
    dispatch(setMenuActivePage("processes"));
    dispatch(fetchContestProcesses(contest.id));
  }, []);

  useEffect(() => {
    dispatch(setMenuActivePage("processes"));

    // первый вызов сразу
    dispatch(fetchContestProcesses(contest.id));

    const interval = setInterval(() => {
      dispatch(fetchContestProcesses(contest.id));
    }, 5000); // 10 секунд

    return () => clearInterval(interval);
  }, [contest.id, dispatch]);

  return (
    <>
      <div className="h-screen w-full box-border p-[10px] pr-[5px] border-liquid-border border-x">
        <div className="h-full flex flex-col">
          <div className="h-[50px] text-[40px] font-bold text-liquid-white flex items-center mb-4">
            Процессы
          </div>

          <div className="flex-1 overflow-auto thin-dark-scrollbar">
            <ImportProcesses
              contest={contest}
              processes={processes}
              setModalStopProcessActive={setModalStopProcessActive}
            />
            <ComparisonProcesses
              contest={contest}
              processes={processes}
              setModalStopProcessActive={setModalStopProcessActive}
            />

            <ConditionProcesses
              contest={contest}
              processes={processes}
              setModalStopProcessActive={setModalStopProcessActive}
            />
          </div>
        </div>
      </div>

      <ModalStopProcess
        active={modalStopProcessActive}
        setActive={setModalStopProcessActive}
      />
    </>
  );
};
