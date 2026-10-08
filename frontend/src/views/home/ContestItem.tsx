import { cn } from "../../lib/cn";
import { useNavigate } from "react-router-dom";
import { Edit } from "../../assets/icons/input";
import { Trash } from "../../assets/icons/input";
import { useAppDispatch } from "../../redux/hooks";
import { setDeleteContest, setUpdateContest } from "../../redux/slices/store";
import { Contest } from "../../types/contest";

export interface ContestItemProps {
  contest: Contest;
  setModalDeleteActive: (v: boolean) => void;
  setModalUpdateActive: (v: boolean) => void;
}

const ContestItem: React.FC<ContestItemProps> = ({
  contest,
  setModalDeleteActive,
  setModalUpdateActive,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleClickEdit = () => {
    dispatch(setUpdateContest(contest));
    setModalUpdateActive(true);
  };

  const handleClickDelete = () => {
    dispatch(setDeleteContest(contest));
    setModalDeleteActive(true);
  };

  return (
    <div
      className={cn(
        "w-full box-border relative rounded-[10px] px-[20px] py-[14px] text-liquid-white text-[16px] leading-[20px] cursor-pointer grid  items-center font-bold border-transparent hover:border-liquid-darkmain border-solid border-[1px] transition-all duration-300",
        "grid-cols-[1fr,36px,36px] gap-[20px]",
        "bg-liquid-lighter mb-[20px]",
      )}
      onClick={() => {
        navigate(`/contest/${contest.id}`);
      }}
    >
      <div className="text-left font-bold text-[18px]">{contest.name}</div>

      <div
        className={cn(
          "h-[36px] w-[36px] flex items-center justify-center hover:bg-liquid-darkmain rounded-[8px] transition-all duration-300",
          false &&
            "cursor-default pointer-events-none hover:bg-transparent opacity-35",
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleClickEdit();
        }}
      >
        <Edit
          className={cn(
            false &&
              "cursor-default pointer-events-none hover:bg-transparent opacity-35",
          )}
        />
      </div>

      <div
        className={cn(
          "h-[36px] w-[36px] flex items-center justify-center hover:bg-liquid-red rounded-[8px] transition-all duration-300",
          false &&
            "cursor-default pointer-events-none hover:bg-transparent opacity-35",
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleClickDelete();
        }}
      >
        <Trash
          className={cn(
            false &&
              "cursor-default pointer-events-none hover:bg-transparent opacity-35",
          )}
        />
      </div>
    </div>
  );
};

export default ContestItem;
