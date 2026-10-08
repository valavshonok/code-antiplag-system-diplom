import { FC, useEffect } from "react";
import { Modal } from "../../components/modal/Modal";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { SecondaryButton } from "../../components/button/SecondaryButton";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  deleteContest,
  fetchContests,
  setContestRequestStatus,
} from "../../redux/slices/contests";

interface ModalDeleteContestProps {
  active: boolean;
  setActive: (value: boolean) => void;
}

const ModalDeleteContest: FC<ModalDeleteContestProps> = ({
  active,
  setActive,
}) => {
  const dispatch = useAppDispatch();

  const { status } = useAppSelector((state) => state.contests.deleteContest);

  const contest = useAppSelector((state) => state.store.contests.deleteContest);

  useEffect(() => {
    if (status === "successful") {
      dispatch(
        setContestRequestStatus({ type: "deleteContest", status: "idle" }),
      );
      dispatch(fetchContests());
      setActive(false);
    }
  }, [status, dispatch, setActive]);

  const handleDelete = () => {
    dispatch(deleteContest(contest.id));
  };

  const handleClose = () => {
    setActive(false);
  };

  return (
    <Modal
      className="bg-liquid-modal-background border-liquid-modal-border border-[2px] p-[25px] rounded-[20px] text-liquid-modal-text"
      onOpenChange={handleClose}
      open={active}
      backdrop="blur"
    >
      <div className="w-[500px]">
        <div className="font-bold text-[26px] mb-[15px]">Удаление контеста</div>

        <div className="text-[16px] mb-[25px]">
          Вы действительно хотите удалить контест
          <div className="font-semibold"> "{contest.name}"</div>
        </div>

        <div className="flex justify-end gap-[15px]">
          <PrimaryButton
            color="error"
            onClick={handleDelete}
            text="Удалить"
            disabled={status === "loading" || !contest.id}
          />
          <SecondaryButton
            onClick={handleClose}
            text="Отмена"
            disabled={status === "loading"}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalDeleteContest;
