// src/pages/Home.tsx
// import { Navigate, Route, Routes } from 'react-router-dom';
// import Login from '../views/home/auth/Login';
// import Register from '../views/home/auth/Register';
// import Menu from '../views/home/menu/Menu';
// import { useAppDispatch, useAppSelector } from '../redux/hooks';
// import { useEffect } from 'react';
// import { fetchWhoAmI } from '../redux/slices/auth';
// import Missions from '../views/home/missions/Missions';
// import Articles from '../views/home/articles/Articles';
// import Groups from '../views/home/groups/Groups';
// import Group from '../views/home/group/Group';
// import Account from '../views/home/account/Account';
// import ProtectedRoute from '../components/router/ProtectedRoute';
// import { MissionsRightPanel } from '../views/home/rightpanel/Missions';
// import { ArticlesRightPanel } from '../views/home/rightpanel/Articles';
// import { GroupRightPanel } from '../views/home/rightpanel/group/Group';
// import GroupInvite from '../views/home/groupinviter/GroupInvite';
import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { Contest } from "../../../types/contest";
import { CheckboxView } from "../../../components/checkbox/CheckboxView";
import { setComparisonSettings } from "../../../redux/slices/store";
import { ReverseButton } from "../../../components/button/ReverseButton";
import { GradientRightRange } from "../../../components/input/GradientRightRange";

interface ComparisonRightPanelProps {
  contest: Contest;
}

export const ComparisonRightPanel: FC<ComparisonRightPanelProps> = ({
  contest,
}) => {
  const dispatch = useAppDispatch();

  const comparisonSettings = useAppSelector(
    (state) => state.store.comparison.settings,
  );

  return (
    <div className="w-[250px] h-full grid grid-rows-[40px,1fr] fixed top-0 items-center box-border pt-[35px] text-liquid-white">
      <div className="text-[20px] font-bold  h-full truncate px-[4px]">
        {contest.name}
      </div>
      <div className="h-full flex-1 overflow-auto thin-dark-scrollbar px-[4px]">
        <div className="font-bold mt-[10px]">Статистика</div>

        <ReverseButton
          onClick={() => {
            dispatch(
              setComparisonSettings({
                ...comparisonSettings,
                activeModalComparisonPairs: true,
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
              setComparisonSettings({
                ...comparisonSettings,
                activeModalComparisonContestants: true,
              }),
            );
          }}
          className="mt-[10px] w-full"
        >
          <div className="text-[16px]">Участники с плагиатом</div>
        </ReverseButton>

        <div className="font-bold mt-[20px] mb-[8px]">
          Настройки отображения
        </div>
        <CheckboxView
          onClick={() => {
            dispatch(
              setComparisonSettings({
                ...comparisonSettings,
                redNamePlagiators: !comparisonSettings.redNamePlagiators,
              }),
            );
          }}
          active={comparisonSettings.redNamePlagiators}
          color="secondary"
          label="Выделять плагиаторов"
        />
        <CheckboxView
          onClick={() => {
            dispatch(
              setComparisonSettings({
                ...comparisonSettings,
                fillRedFieldPlagiat: !comparisonSettings.fillRedFieldPlagiat,
              }),
            );
          }}
          active={comparisonSettings.fillRedFieldPlagiat}
          color="secondary"
          label="Выделять посылки с плагиатом"
        />

        <CheckboxView
          onClick={() => {
            dispatch(
              setComparisonSettings({
                ...comparisonSettings,
                fillRedRowPlagiator: !comparisonSettings.fillRedRowPlagiator,
              }),
            );
          }}
          active={comparisonSettings.fillRedRowPlagiator}
          color="secondary"
          label="Выделять строки с плагиатом"
        />

        <CheckboxView
          onClick={() => {
            dispatch(
              setComparisonSettings({
                ...comparisonSettings,
                useNormalization: !comparisonSettings.useNormalization,
              }),
            );
          }}
          active={comparisonSettings.useNormalization}
          color="secondary"
          label="Использовать нормализацию"
        />

        <GradientRightRange
          onChange={(v: number) => {
            dispatch(
              setComparisonSettings({
                ...comparisonSettings,
                originalityColorThreshold: v,
              }),
            );
          }}
          value={comparisonSettings.originalityColorThreshold}
        />
      </div>
    </div>
  );
};
