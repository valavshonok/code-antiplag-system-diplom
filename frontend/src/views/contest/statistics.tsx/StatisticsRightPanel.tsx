import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { Contest } from "../../../types/contest";
import { setStatisticsSettings } from "../../../redux/slices/store";
import { ReverseButton } from "../../../components/button/ReverseButton";
import { CheckboxView } from "../../../components/checkbox/CheckboxView";

interface StatisticsRightPanelProps {
  contest: Contest;
}

export const StatisticsRightPanel: FC<StatisticsRightPanelProps> = ({
  contest,
}) => {
  const dispatch = useAppDispatch();

  const statisticSettings = useAppSelector(
    (state) => state.store.statistics.settings,
  );

  return (
    <div className="w-[250px] h-full grid grid-rows-[40px,1fr] fixed top-0 items-center box-border pt-[35px] text-liquid-white">
      <div className="text-[20px] font-bold  h-full truncate px-[4px]">
        {contest.name}
      </div>
      <div className="h-full flex-1 overflow-auto thin-dark-scrollbar px-[4px]">
        <div className="font-bold mt-[20px] mb-[8px]">
          Настройки подсчета оценок
        </div>
        <div className="relative">
          <CheckboxView
            onClick={() => {
              dispatch(
                setStatisticsSettings({
                  ...statisticSettings,
                  resetResultForPlagiarism:
                    !statisticSettings.resetResultForPlagiarism,
                }),
              );
            }}
            active={statisticSettings.resetResultForPlagiarism}
            color="secondary"
            label="Обнулять результат за плагиат"
          />
        </div>
        <CheckboxView
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                resetScoreOnPlagiarismTask:
                  !statisticSettings.resetScoreOnPlagiarismTask,
              }),
            );
          }}
          active={statisticSettings.resetScoreOnPlagiarismTask}
          color="secondary"
          label="Обнулять балл задачи за плагиат"
        />
        <CheckboxView
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                trustAINetworks: !statisticSettings.trustAINetworks,
              }),
            );
          }}
          active={statisticSettings.trustAINetworks}
          color="secondary"
          label="Доверять оценке ИИ"
        />

        <div className="font-bold mt-[20px]">Скачать результат</div>

        <ReverseButton
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                modalDownloadScoreActive:
                  !statisticSettings.modalDownloadScoreActive,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Получить оценки</div>
        </ReverseButton>

        <ReverseButton
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                modalDownloadPlagiatorsActive:
                  !statisticSettings.modalDownloadPlagiatorsActive,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Участники с плагиатом</div>
        </ReverseButton>

        <ReverseButton
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                modalDownloadPlagiatPairsActive:
                  !statisticSettings.modalDownloadPlagiatPairsActive,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Пары с плагиатом</div>
        </ReverseButton>

        <ReverseButton
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                modalDownloadConditionsActive:
                  !statisticSettings.modalDownloadConditionsActive,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Выполнение условий</div>
        </ReverseButton>

        <ReverseButton
          onClick={() => {
            dispatch(
              setStatisticsSettings({
                ...statisticSettings,
                modalDownloadAllActive:
                  !statisticSettings.modalDownloadAllActive,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Скачать все</div>
        </ReverseButton>
      </div>
    </div>
  );
};
