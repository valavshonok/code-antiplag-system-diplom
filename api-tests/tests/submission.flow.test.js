import { createApi } from "../config/axios.js";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("Yandex import → submissions flow", () => {
  let api;
  let contestId;
  let processId;
  let contestants;
  let submissions;

  const username = `test_yandex_${Date.now()}`;
  const email = `${username}@mail.com`;
  const password = "123456";

  // -----------------------------
  // AUTH
  // -----------------------------
  test("register + login", async () => {
    const register = await createApi().post("/auth/register", {
      username,
      email,
      password,
    });

    expect(register.status).toBe(200);

    api = createApi(register.data.token);
  });

  // -----------------------------
  // CREATE CONTEST
  // -----------------------------
  test("create contest", async () => {
    const res = await api.post("/contests", {
      name: "yandex-import-test",
      config: {},
    });

    expect(res.status).toBe(200);
    contestId = res.data.id;
  });

  // -----------------------------
  // IMPORT
  // -----------------------------
  test("start import", async () => {
    const filePath = path.resolve(
      process.cwd(),
      "resources/test-yandex-import.zip",
    );

    expect(fs.existsSync(filePath)).toBe(true);

    const fileBuffer = fs.readFileSync(filePath);

    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]), "test.zip");

    const res = await api.post(
      `/contests/${contestId}/processes/import-yandex-contest`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    expect(res.status).toBe(200);
    processId = res.data.id;
  });

  // -----------------------------
  // WAIT DONE
  // -----------------------------
  test("wait import done", async () => {
    const process = await waitForDone(api, contestId, processId);

    expect(process.status).toBe("done");
  });

  // -----------------------------
  // CONTESTANTS
  // -----------------------------
  test("get contestants", async () => {
    const res = await api.get(`/contests/${contestId}/contestants`);

    expect(res.status).toBe(200);
    contestants = res.data;
    expect(contestants.length).toBeGreaterThan(0);
  });

  // -----------------------------
  // SUBMISSIONS
  // -----------------------------
  test("get submissions", async () => {
    const res = await api.get(`/contests/${contestId}/submissions`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    submissions = res.data;

    const sample = submissions[0];

    expect(sample).toHaveProperty("id");
    expect(sample).toHaveProperty("contestantId");
    expect(sample).toHaveProperty("code");
    expect(sample).toHaveProperty("verdict");

    const contestantIds = new Set(contestants.map((c) => c.id));
    expect(contestantIds.has(sample.contestantId)).toBe(true);
  });
});

// -----------------------------
// HELPERS
// -----------------------------
async function waitForDone(api, contestId, processId) {
  for (let i = 0; i < 40; i++) {
    const res = await api.get(`/contests/${contestId}/processes`);

    const process = res.data.find((p) => p.id === processId);

    if (!process) throw new Error("Process disappeared");

    if (process.status === "done") return process;
    if (process.status === "error") throw new Error("Process error");

    await sleep(1000);
  }

  throw new Error("Timeout");
}
