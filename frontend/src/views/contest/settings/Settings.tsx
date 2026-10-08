import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setMenuActivePage } from "../../../redux/slices/store";
import { Contest } from "../../../types/contest";
import { ReverseButton } from "../../../components/button/ReverseButton";
import {
  fetchContest,
  setContestRequestStatus,
  updateContest,
} from "../../../redux/slices/contests";
import { SecondaryButton } from "../../../components/button/SecondaryButton";
import { ComparisonConfig } from "./ComparisonConfig";
import { ProblemsSettings } from "./ProblemsSettings";
import { cn } from "../../../lib/cn";
interface SettingsProps {
  contest: Contest;
}

export const Settings: FC<SettingsProps> = ({ contest }) => {
  const dispatch = useAppDispatch();

  const [config, setConfig] = useState(contest?.config ?? {});

  const { status } = useAppSelector((state) => state.contests.updateContest);

  useEffect(() => {
    dispatch(setMenuActivePage("settings"));
  }, []);

  useEffect(() => {
    if (status == "successful") {
      dispatch(fetchContest(contest.id));
      dispatch(
        setContestRequestStatus({ type: "updateContest", status: "idle" }),
      );
    }
  }, [status]);

  useEffect(() => {
    setConfig(contest?.config ?? {});
  }, [contest]);

  return (
    <>
      <div className="h-screen w-full box-border p-[10px] pr-[5px] border-liquid-border border-x">
        <div className="h-full flex flex-col">
          <div className="h-[50px] text-[40px] font-bold text-liquid-white flex items-center mb-4 relative">
            Настройки
            {
              <div
                className={cn(
                  "absolute right-[10px] top-[10px] flex items-center text-liquid-orange border-liquid-orange border-solid border-[1px] p-[10px] rounded-[10px] text-[18px] h-[40px] opacity-0 transition-all duration-300",
                  config != contest?.config && " opacity-100",
                )}
              >
                Есть несохранённые изменения!
              </div>
            }
          </div>

          <div className="flex-1 overflow-auto thin-dark-scrollbar">
            {/* Кнопки */}
            <div className="mb-[20px] flex gap-[20px]">
              <ReverseButton
                text="Сохранить"
                onClick={() => {
                  dispatch(
                    updateContest({
                      id: contest.id,
                      name: contest.name,
                      config: config,
                    }),
                  );
                }}
              />
              <SecondaryButton
                text="Отмена"
                onClick={() => {
                  dispatch(fetchContest(contest.id));
                }}
              />
            </div>

            {/* Блок с найстройкима оценивания */}
            <ProblemsSettings config={config} setConfig={setConfig} />

            {/* Блок с найстройкима сравнения */}
            <ComparisonConfig config={config} setConfig={setConfig} />
          </div>
        </div>
      </div>
    </>
  );
};
