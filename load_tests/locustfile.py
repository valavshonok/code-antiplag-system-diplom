from locust import HttpUser, task, between


class AppUser(HttpUser):
    wait_time = between(1, 2)

    contest_id = 7

    def on_start(self):
        username = "test"
        password = "12345"

        r = self.client.post("/api/auth/login", json={
            "username": username,
            "password": password
        })

        token = r.json()["token"]
        self.headers = {"Authorization": f"Bearer {token}"}

    # -------------------------
    # READ-ONLY LOAD
    # -------------------------

    @task(2)
    def get_contests(self):
        self.client.get("/api/contests", headers=self.headers)

    @task(2)
    def get_submissions(self):
        self.client.get(
            f"/api/contests/{self.contest_id}/submissions",
            headers=self.headers
        )

    @task(2)
    def get_contestants(self):
        self.client.get(
            f"/api/contests/{self.contest_id}/contestants",
            headers=self.headers
        )

    @task(2)
    def get_processes(self):
        self.client.get(
            f"/api/contests/{self.contest_id}/processes",
            headers=self.headers
        )

    @task(3)
    def get_comparisons(self):
        """
        Основной bottleneck endpoint
        """
        self.client.get(
            f"/api/contests/{self.contest_id}/comparisons",
            headers=self.headers
        )

    @task(1)
    def get_comparisons_full(self):
        self.client.get(
            f"/api/contests/{self.contest_id}/comparisons/full",
            headers=self.headers
        )