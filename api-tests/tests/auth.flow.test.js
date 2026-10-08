import { createApi } from "../config/axios.js";

describe("Auth flow (clean axios)", () => {
  let token;
  let userId;
  let api;

  const username = `test_user_${Date.now()}`;
  const email = `${username}@mail.com`;
  const password = "123456";

  test("register user", async () => {
    const res = await createApi().post("/auth/register", {
      username,
      email,
      password,
    });

    expect(res.status).toBe(200);

    token = res.data.token;
    userId = res.data.user.id;

    api = createApi(token); // создаём новый клиент с токеном
  });

  test("login user", async () => {
    const res = await createApi().post("/auth/login", {
      username,
      password,
    });

    expect(res.status).toBe(200);

    token = res.data.token;
    api = createApi(token);
  });

  test("whoami", async () => {
    const res = await api.get("/auth/whoami");

    expect(res.status).toBe(200);
    expect(res.data.user.id).toBe(userId);
    expect(res.data.user.username).toBe(username);
    expect(res.data.user.email).toBe(email);
  });
});
