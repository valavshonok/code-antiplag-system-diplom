import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { Contest } from "../../../types/contest";
import { setConditionSettings } from "../../../redux/slices/store";
import { ReverseButton } from "../../../components/button/ReverseButton";

interface ConditionRightPanelProps {
  contest: Contest;
}

export const ConditionRightPanel: FC<ConditionRightPanelProps> = ({
  contest,
}) => {
  const dispatch = useAppDispatch();

  const conditionSettings = useAppSelector(
    (state) => state.store.conditions.settings,
  );

  return (
    <div className="w-[250px] h-full grid grid-rows-[40px,1fr] fixed top-0 items-center box-border pt-[35px] text-liquid-white">
      <div className="text-[20px] font-bold  h-full truncate px-[4px]">
        {contest.name}
      </div>
      <div className="h-full flex-1 overflow-auto thin-dark-scrollbar px-[4px]">
        <div className="font-bold mt-[10px]">Управение</div>

        <ReverseButton
          onClick={() => {
            dispatch(
              setConditionSettings({
                ...conditionSettings,
                activeModalConditionsCritical: true,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Требуеться проверка</div>
        </ReverseButton>
        <ReverseButton
          onClick={() => {
            dispatch(
              setConditionSettings({
                ...conditionSettings,
                activeModalConditionsAll: true,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Ожидают просмотра</div>
        </ReverseButton>
      </div>
    </div>
  );
};
