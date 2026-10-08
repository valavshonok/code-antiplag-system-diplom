import { createApi } from "../config/axios.js";

describe("Contest lifecycle flow", () => {
  let api;
  let token;
  let userId;
  let contestId;

  const username = `test_contest_${Date.now()}`;
  const email = `${username}@mail.com`;
  const password = "123456";

  test("register + login", async () => {
    const registerRes = await createApi().post("/auth/register", {
      username,
      email,
      password,
    });

    expect(registerRes.status).toBe(200);

    token = registerRes.data.token;
    userId = registerRes.data.user.id;

    api = createApi(token);
  });

  test("create contest", async () => {
    const res = await api.post("/contests", {
      name: "test contest",
      config: {
        type: "default",
      },
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();

    contestId = res.data.id;
  });

  test("get contest", async () => {
    const res = await api.get(`/contests/${contestId}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(contestId);
  });

  test("update contest", async () => {
    const res = await api.put(`/contests/${contestId}`, {
      name: "updated contest",
      config: {
        type: "updated",
      },
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe("updated contest");
  });

  test("delete contest", async () => {
    const res = await api.delete(`/contests/${contestId}`);

    expect(res.status).toBe(200);
  });

  test("verify contest deleted", async () => {
    try {
      await api.get(`/contests/${contestId}`);
      throw new Error("Should not exist");
    } catch (err) {
      expect(err.response.status).toBe(400);
    }
  });
});
