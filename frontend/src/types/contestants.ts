export interface Contestant {
  id: number;
  contestId: number;
  name: string;
}

export const defaultContestant: Contestant = {
  id: 0,
  contestId: 0,
  name: "",
};
