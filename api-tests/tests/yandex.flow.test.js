import { createApi } from "../config/axios.js";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("Yandex import process flow", () => {
  let api;
  let contestId;
  let processId;

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

    const token = register.data.token;
    api = createApi(token);
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
    expect(res.data.id).toBeDefined();

    contestId = res.data.id;
  });

  // -----------------------------
  // START IMPORT
  // -----------------------------
  test("start yandex import", async () => {
    const filePath = path.resolve(
      process.cwd(),
      "resources/test-yandex-import.zip",
    );

    expect(fs.existsSync(filePath)).toBe(true);

    const fileBuffer = fs.readFileSync(filePath);

    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]), "test-yandex-import.zip");

    const res = await api.post(
      `/contests/${contestId}/processes/import-yandex-contest`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();

    processId = res.data.id;
  });

  // -----------------------------
  // WAIT FOR PROCESS (POLLING)
  // -----------------------------
  test("wait for process creation", async () => {
    const process = await waitForProcessCreated(api, contestId, processId);

    expect(process).toBeDefined();
    expect(process.id).toBe(processId);
  });

  // -----------------------------
  // WAIT FOR COMPLETION
  // -----------------------------
  test("wait for process completion", async () => {
    const process = await waitForProcessDone(api, contestId, processId);

    expect(process.status).toBe("done");
  });
});

// =====================================================
// HELPERS
// =====================================================

async function waitForProcessCreated(api, contestId, processId) {
  for (let i = 0; i < 15; i++) {
    const res = await api.get(`/contests/${contestId}/processes`);

    const process = res.data.find((p) => p.id === processId);

    if (process) {
      return process;
    }

    await sleep(1000);
  }

  throw new Error("Process was not created");
}

async function waitForProcessDone(api, contestId, processId) {
  for (let i = 0; i < 40; i++) {
    const res = await api.get(`/contests/${contestId}/processes`);

    const process = res.data.find((p) => p.id === processId);

    if (!process) {
      throw new Error("Process disappeared");
    }

    if (process.status === "done") {
      return process;
    }

    if (process.status === "error") {
      throw new Error("Process ended with error");
    }

    await sleep(1000);
  }

  throw new Error("Process timeout");
}
