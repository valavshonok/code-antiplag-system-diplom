import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import Menu from "../views/contest/menu/Menu";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchContest } from "../redux/slices/contests";
import { Processes } from "../views/contest/processes/Processes";
import { Settings } from "../views/contest/settings/Settings";
import { Comparisons } from "../views/contest/comparisons/Comparisons";
import { ComparisonRightPanel } from "../views/contest/comparisons/ComparisonRightPanel";
import { Conditions } from "../views/contest/conditions/Conditions";
import { ConditionRightPanel } from "../views/contest/conditions/ConditionRightPanel";
import { StatisticsRightPanel } from "../views/contest/statistics.tsx/StatisticsRightPanel";
import { Statistics } from "../views/contest/statistics.tsx/Statistics";

const Contest = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { id } = useParams();
  const { contest, status } = useAppSelector(
    (state) => state.contests.fetchContest,
  );

  useEffect(() => {
    const contestId = Number(id);
    if (!isNaN(contestId)) {
      dispatch(fetchContest(contestId));
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className="w-full bg-liquid-background grid grid-cols-[250px,1fr,250px]">
      <div className="min-h-screen">
        <Menu contest={contest} />
      </div>
      <div className="h-screen">
        {contest.id == Number(id) && status == "successful" ? (
          <Routes>
            <Route
              path="comparisons/*"
              element={<Comparisons contest={contest} />}
            />
            <Route path="settings/*" element={<Settings contest={contest} />} />
            <Route
              path="processes/*"
              element={<Processes contest={contest} />}
            />
            <Route
              path="statistics/*"
              element={<Statistics contest={contest} />}
            />
            <Route
              path="conditions/*"
              element={<Conditions contest={contest} />}
            />
            <Route
              path="*"
              element={<Navigate to={`/contest/${id}/processes`} replace />}
            />
          </Routes>
        ) : (
          <></>
        )}
      </div>
      <div className="h-screen">
        {contest.id == Number(id) && status == "successful" ? (
          <Routes>
            <Route
              path="comparisons/*"
              element={<ComparisonRightPanel contest={contest} />}
            />
            <Route
              path="conditions/*"
              element={<ConditionRightPanel contest={contest} />}
            />
            <Route
              path="statistics/*"
              element={<StatisticsRightPanel contest={contest} />}
            />
            <Route
              path="*"
              element={
                <div className="w-[250px] h-full fixed top-0 items-center box-border p-[20px] pt-[35px]">
                  <div>{contest.name}</div>
                </div>
              }
            />
          </Routes>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Contest;
