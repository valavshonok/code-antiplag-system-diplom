import { FC, useEffect, useState } from "react";
import { Modal } from "../../components/modal/Modal";
import { PrimaryButton } from "../../components/button/PrimaryButton";
import { SecondaryButton } from "../../components/button/SecondaryButton";
import { Input } from "../../components/input/Input";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createContest, fetchContests } from "../../redux/slices/contests";
import { useNavigate } from "react-router-dom";
import { setContestRequestStatus } from "../../redux/slices/contests";

interface ModalCreateContestProps {
  active: boolean;
  setActive: (value: boolean) => void;
}

const ModalCreateContest: FC<ModalCreateContestProps> = ({
  active,
  setActive,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");

  const { contest, status } = useAppSelector(
    (state) => state.contests.createContest,
  );

  useEffect(() => {
    setName("");
  }, [active]);

  useEffect(() => {
    if (status === "successful") {
      dispatch(
        setContestRequestStatus({ type: "createContest", status: "idle" }),
      );
      dispatch(fetchContests());
      setActive(false);
      navigate(contest ? `/contest/${contest.id}` : "");
    }
  }, [status]);

  const handleSubmit = () => {
    dispatch(createContest({ name }));
  };

  return (
    <Modal
      className="bg-liquid-modal-background border-liquid-modal-border border-[2px] p-[25px] rounded-[20px] text-liquid-modal-text"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
    >
      <div className="w-[550px]">
        <div className="font-bold text-[30px] mb-[10px]">Создать контест</div>

        <Input
          name="name"
          type="text"
          label="Название"
          className="mt-[10px]"
          placeholder="Введите название"
          onChange={(v) => setName(v)}
        />

        <div className="flex flex-row w-full items-center justify-end mt-[20px] gap-[20px]">
          <PrimaryButton
            onClick={() => {
              handleSubmit();
            }}
            text="Создать"
            disabled={status === "loading"}
          />
          <SecondaryButton
            onClick={() => {
              setActive(false);
            }}
            text="Отмена"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateContest;
