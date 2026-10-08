import { FC, useState } from "react";
import {
  ConditionConfig,
  ContestConfig,
  ProblemsConfig,
} from "../../../types/contest";
import { cn } from "../../../lib/cn";
import { ChevroneDown } from "../../../assets/icons/groups";
import { RealNumberInput } from "../../../components/input/RealNumberInput";
import { ReverseButton } from "../../../components/button/ReverseButton";
import { Input } from "../../../components/input/Input";
import { TextArea } from "../../../components/input/TextArea";
import { Trash } from "../../../assets/icons/input";

interface ProblemsSettingsProps {
  config: ContestConfig;
  setConfig: React.Dispatch<React.SetStateAction<ContestConfig>>;
}

export const ProblemsSettings: FC<ProblemsSettingsProps> = ({
  config,
  setConfig,
}) => {
  const [comparisonSettingsActive, setComparisonsSettingActive] =
    useState<boolean>(true);

  const updateProblem = (index: number, updated: ProblemsConfig) => {
    setConfig((prev) => ({
      ...prev,
      problems: prev.problems.map((p, i) => (i === index ? updated : p)),
    }));
  };

  const updateScore = (index: number, score: number) => {
    const problem = config.problems[index];
    updateProblem(index, { ...problem, score });
  };

  const addCondition = (problemIndex: number) => {
    const newCondition: ConditionConfig = {
      title: "",
      description: "",
      penalty: 0,
    };

    const problem = config.problems[problemIndex];

    updateProblem(problemIndex, {
      ...problem,
      conditions: [...problem.conditions, newCondition],
    });
  };

  const addConditionDangerComments = (problemIndex: number) => {
    const newCondition: ConditionConfig = {
      title: "Без объяснительных комментариев",
      description: `Нужно проверить код на наличие недопустимых комментариев.

Разрешены ТОЛЬКО следующие типы комментариев:
- Комментарии, в которых полностью закомментирован код (например: // int x = 5; или /* printf("test"); */)
- Один блочный комментарий в самом начале файла, содержащий только метаданные (ФИО, группа, задание, дата и т.п.)

ЗАПРЕЩЕНО:
- Любые комментарии, содержащие пояснения, описания или объяснения (включая технические замечания)
- Любые комментарии на естественном языке, не являющиеся закомментированным кодом
- Любые комментарии, кроме закомментированного кода и блока с метаданными в начале

Правило строгое:
- Если комментарий не является очевидно закомментированным кодом или метаданными - считать его запрещённым
- Если найден хотя бы один запрещённый комментарий - то условие считается "НЕ ВЫПОЛНЕНО"
- Если запрещённых комментариев нет - условие "ВЫПОЛНЕНО"
  `,
      penalty: 1,
    };

    const problem = config.problems[problemIndex];

    updateProblem(problemIndex, {
      ...problem,
      conditions: [...problem.conditions, newCondition],
    });
  };

  const addConditionDangerVariablesName = (problemIndex: number) => {
    const newCondition: ConditionConfig = {
      title: "Самостоятельность кода",
      description: `Нужно определить, писал ли участник код самостоятельно.
Определять это будем по именам переменных

Допустимые переменные:
Однобуквенные: a, b, c, i, j, k
Короткие стандартные аббревиатуры: sum, cnt, n, m, l, r, x, y, z, left, right
2-4 символа: dp, val, cur
Нумерованные короткие: dp0, dp1, s1, s2, s3
Переменные с подчеркиванием для подмножества: a_x, a_y, b_x, b_y, x_0, x_1

Подозрительные переменные:
Названия длиннее 6-7 символов уже подозрительно.
Слова, описывающие конкретные действия или данные: sumLeftDigits, requestString, leftIndices, guess, alarms
Смешение нескольких слов в camelCase или snake_case, если оно слишком разговорное или специфичное.

То есть, если хотя бы 2-3 переменных подозрительные, можно сказать, что условие для "самостоятельного кода" не выполнено.
      `,
      penalty: 1,
    };

    const problem = config.problems[problemIndex];

    updateProblem(problemIndex, {
      ...problem,
      conditions: [...problem.conditions, newCondition],
    });
  };

  const updateCondition = (
    problemIndex: number,
    conditionIndex: number,
    updated: ConditionConfig,
  ) => {
    setConfig((prev) => ({
      ...prev,
      problems: prev.problems.map((p, pIndex) => {
        if (pIndex !== problemIndex) return p;

        return {
          ...p,
          conditions: p.conditions.map((c, cIndex) =>
            cIndex === conditionIndex ? updated : c,
          ),
        };
      }),
    }));
  };

  const removeCondition = (problemIndex: number, conditionIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      problems: prev.problems.map((p, pIndex) => {
        if (pIndex !== problemIndex) return p;

        return {
          ...p,
          conditions: p.conditions.filter(
            (_, cIndex) => cIndex !== conditionIndex,
          ),
        };
      }),
    }));
  };

  return (
    <div
      className={cn(
        " border-b-[1px] border-b-liquid-border rounded-[10px] mb-[20px] text-liquid-white",
      )}
    >
      <div
        className={cn(
          " h-[40px] text-[24px] font-bold flex gap-[10px] items-center cursor-pointer border-b-[1px] border-b-transparent transition-all duration-300",
          // comparisonSettingsActive && "border-b-liquid-border",
        )}
        onClick={() => {
          setComparisonsSettingActive(!comparisonSettingsActive);
        }}
      >
        <span className=" select-none">{"Настройки оценивания"}</span>
        <img
          src={ChevroneDown}
          className={cn(
            "transition-all duration-300 select-none",
            comparisonSettingsActive && "rotate-180",
          )}
        />
      </div>
      <div
        className={cn(
          " grid grid-flow-row grid-rows-[0fr] opacity-0 transition-all duration-300",
          comparisonSettingsActive && "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-[10px]">
            {config.problems.map((problem, index) => (
              <div
                key={index}
                className="rounded-[10px] p-[10px] mb-[25px] border-[1px] border-solid mr-[6px] relative border-liquid-border"
              >
                <div className=" absolute right-[10px] top-[10px] flex flex-row gap-[10px] opacity-80">
                  <ReverseButton
                    onClick={() => addConditionDangerComments(index)}
                    text={"Нет комментариев"}
                  />
                  <ReverseButton
                    onClick={() => addConditionDangerVariablesName(index)}
                    text={"Названия перменных"}
                  />
                </div>

                <div className="text-[22px] font-bold mb-[5px] text-liquid-brightmain">
                  Задача {problem.problem}
                </div>

                <div className=" flex items-center gap-[10px]">
                  <span className="text-[20px]">Балл:</span>
                  <RealNumberInput
                    onChange={(v: number) => updateScore(index, v)}
                    defaultState={problem.score}
                    className="w-[200px]"
                  />
                </div>

                <div
                  className={cn(
                    "flex justify-between items-center",
                    problem.conditions.length == 0 && "mt-[10px]",
                  )}
                >
                  {problem.conditions.length != 0 && (
                    <span className="text-[20px] font-bold">Ограничения</span>
                  )}
                  <ReverseButton
                    onClick={() => addCondition(index)}
                    text={"Добавить ограничение"}
                  />
                </div>
                <div className="flex flex-col gap-[15px] mt-[5px]">
                  {problem.conditions.map((condition, cIndex) => (
                    <div
                      key={cIndex}
                      className="border-liquid-lighter rounded-[5px] p-[5px] border-[1px] border-solid mr-[6px] w-full relative"
                    >
                      <Input
                        onChange={(v: string) =>
                          updateCondition(index, cIndex, {
                            ...condition,
                            title: v,
                          })
                        }
                        type="text"
                        placeholder="Название"
                        className="w-[350px] mb-[5px]"
                        inputClassName="p-[8px] py-[3px] h-[30px] rounded-[6px] font-bold"
                        defaultState={condition.title}
                      />

                      <div className=" flex items-center gap-[10px]">
                        <span className="text-[20px]">Штраф:</span>
                        <RealNumberInput
                          onChange={(v: number) =>
                            updateCondition(index, cIndex, {
                              ...condition,
                              penalty: v,
                            })
                          }
                          defaultState={condition.penalty}
                          className="w-[100px]"
                          inputClassName="p-[8px] h-[30px] text-[15px] rounded-[6px]"
                        />
                      </div>

                      <TextArea
                        onChange={(v: string) =>
                          updateCondition(index, cIndex, {
                            ...condition,
                            description: v,
                          })
                        }
                        defaultState={condition.description}
                        className="mt-[5px]"
                        inputClassName=" rounded-[8px] p-[8px] py-[6px] thin-dark-light-scrollbar"
                        placeholder="Описание"
                        autoResize={true}
                      />

                      <div
                        className={cn(
                          "h-[36px] w-[36px] absolute right-[15px] top-[15px] cursor-pointer flex items-center justify-center hover:bg-liquid-red rounded-[8px] transition-all duration-300 active:scale-95 group",
                          false &&
                            "cursor-default pointer-events-none hover:bg-transparent opacity-35",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCondition(index, cIndex);
                        }}
                      >
                        <Trash
                          className={cn(
                            "cursor-default pointer-events-none hover:bg-transparent text-red-400 group-hover:text-[#edf6f7] transition-all",
                          )}
                        />
                      </div>
                    </div>

                    // <div key={cIndex} className="flex gap-2 mt-2">
                    //   <input
                    //     type="text"
                    //     value={condition.title}
                    //     onChange={(e) => {
                    //       const updatedConditions = problem.conditions.map(
                    //         (c, i) =>
                    //           i === cIndex ? { ...c, title: e.target.value } : c,
                    //       );

                    //       updateProblem(index, {
                    //         ...problem,
                    //         conditions: updatedConditions,
                    //       });
                    //     }}
                    //     placeholder="Название"
                    //     className="border p-1"
                    //   />

                    //   <input
                    //     type="number"
                    //     value={condition.penalty}
                    //     onChange={(e) => {
                    //       const updatedConditions = problem.conditions.map(
                    //         (c, i) =>
                    //           i === cIndex
                    //             ? { ...c, penalty: Number(e.target.value) }
                    //             : c,
                    //       );

                    //       updateProblem(index, {
                    //         ...problem,
                    //         conditions: updatedConditions,
                    //       });
                    //     }}
                    //     placeholder="Штраф"
                    //     className="border p-1 w-20"
                    //   />

                    //   <button onClick={() => removeCondition(index, cIndex)}>
                    //     Удалить
                    //   </button>
                    // </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
