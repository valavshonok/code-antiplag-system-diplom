import { FC, useEffect, useState } from "react";
import { Modal } from "../../components/modal/Modal";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { SecondaryButton } from "../../components/button/SecondaryButton";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchContests,
  setContestRequestStatus,
  updateContest,
} from "../../redux/slices/contests";
import { Input } from "../../components/input/Input";

interface ModalUpdateContestProps {
  active: boolean;
  setActive: (value: boolean) => void;
}

const ModalUpdateContest: FC<ModalUpdateContestProps> = ({
  active,
  setActive,
}) => {
  const dispatch = useAppDispatch();

  const { status } = useAppSelector((state) => state.contests.updateContest);

  const [name, setName] = useState<string>("");

  const contest = useAppSelector((state) => state.store.contests.updateContest);

  useEffect(() => {
    if (status === "successful") {
      dispatch(
        setContestRequestStatus({ type: "updateContest", status: "idle" }),
      );
      dispatch(fetchContests());
      setActive(false);
    }
  }, [status]);

  const handleUpdate = () => {
    dispatch(updateContest({ ...contest, name }));
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
        <div className="font-bold text-[26px] mb-[15px]">
          Переименовать контест
        </div>

        <Input
          defaultState={contest.name}
          name="name"
          type="text"
          label="Название"
          className="mt-[10px]"
          placeholder="Введите название"
          onChange={(v) => setName(v)}
        />

        <div className="flex justify-end gap-[15px] mt-[30px]">
          <PrimaryButton
            onClick={handleUpdate}
            text="Обновить"
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

export default ModalUpdateContest;
