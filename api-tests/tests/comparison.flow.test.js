import { createApi } from "../config/axios.js";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("Yandex import + comparison flow", () => {
  let api;
  let contestId;
  let importProcessId;
  let comparisonProcessId;

  let comparisons;
  let targetComparisonId;

  const username = `test_yandex_${Date.now()}`;
  const email = `${username}@mail.com`;
  const password = "123456";

  // -----------------------------
  // AUTH
  // -----------------------------
  test("auth", async () => {
    const res = await createApi().post("/auth/register", {
      username,
      email,
      password,
    });

    expect(res.status).toBe(200);
    api = createApi(res.data.token);
  }, 30000);

  // -----------------------------
  // CREATE CONTEST
  // -----------------------------
  test("create contest", async () => {
    const res = await api.post("/contests", {
      name: "comparison-test",
      config: {},
    });

    expect(res.status).toBe(200);
    contestId = res.data.id;
  }, 30000);

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
    formData.append("file", new Blob([fileBuffer]), "import.zip");

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
    importProcessId = res.data.id;
  }, 30000);

  test("wait import done", async () => {
    await waitForProcessDone(api, contestId, importProcessId);
  }, 60000);

  // -----------------------------
  // START COMPARISON
  // -----------------------------
  test("start comparison", async () => {
    const res = await api.post(`/contests/${contestId}/processes/comparison`);

    expect(res.status).toBe(200);
    comparisonProcessId = res.data.id;
  }, 30000);

  // -----------------------------
  // WAIT COMPARISON DONE
  // -----------------------------
  test("wait comparison done", async () => {
    await waitForProcessDone(api, contestId, comparisonProcessId);
  }, 60000);

  // -----------------------------
  // GET COMPARISONS LIST
  // -----------------------------
  test("get comparisons list", async () => {
    const res = await waitForComparisons(api, contestId);

    expect(res.length).toBeGreaterThan(0);

    comparisons = res;
    targetComparisonId = res[0].id;
  }, 60000);

  // -----------------------------
  // SET PLAGIARISM
  // -----------------------------
  test("set plagiarism", async () => {
    const res = await api.put(
      `/contests/${contestId}/comparisons/${targetComparisonId}/plagiarism`,
      true,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(res.status).toBe(200);
  }, 30000);

  // -----------------------------
  // GET SINGLE COMPARISON
  // -----------------------------
  test("get comparison detail", async () => {
    const res = await api.get(
      `/contests/${contestId}/comparisons/${targetComparisonId}`,
    );

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(targetComparisonId);
    expect(Array.isArray(res.data.diffStringBlocks)).toBe(true);
  }, 30000);
});

// =====================================================
// HELPERS
// =====================================================

async function waitForProcessDone(api, contestId, processId) {
  for (let i = 0; i < 60; i++) {
    const res = await api.get(`/contests/${contestId}/processes`);

    const p = res.data.find((x) => x.id === processId);

    if (!p) throw new Error("Process missing");

    if (p.status === "done") return p;
    if (p.status === "error") throw new Error("Process error");

    await sleep(1000);
  }

  throw new Error("Timeout");
}

async function waitForComparisons(api, contestId) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await api.get(`/contests/${contestId}/comparisons`);

      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // ignore 409 / not ready
    }

    await sleep(1000);
  }

  throw new Error("Comparisons timeout");
}
