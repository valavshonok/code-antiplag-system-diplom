import random
import time
import hashlib
import requests
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

class CodeforcesAPI:
    BASE_URL = "https://codeforces.com/api/"

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret


    def _generate_api_sig(self, method: str, params: dict) -> str:
        rand = str(random.randint(100000, 999999))
        sorted_items = sorted(params.items())
        query = "&".join(f"{k}={v}" for k, v in sorted_items)
        raw = f"{rand}/{method}?{query}#{self.api_secret}"
        hash_hex = hashlib.sha512(raw.encode()).hexdigest()
        return rand + hash_hex

    def call(self, method: str, **params):
        params["apiKey"] = self.api_key
        params["time"] = int(time.time())

        params["apiSig"] = self._generate_api_sig(method, params)

        response = requests.get(self.BASE_URL + method, params=params, timeout=30)
        text = response.content.decode("utf-8-sig")

        data = json.loads(text)

        if data["status"] != "OK":
            raise Exception(data.get("comment", "Unknown error"))

        time.sleep(2)
        return data["result"]
    
    def get_contest_status(self, contestId: int,  from_: int = 1, count: int = 5000):
        time.sleep(2.5)
        status = self.call(
            "contest.status",
            **{"contestId": contestId, "as_manager": True, "from": from_, "count": count}
        )
        logger.info(f"Всего посылок полчуно: {len(status)}")
        return status

    
    def get_contest_standings(self, contestId: int, from_: int = 1, count: int = 5000):
        time.sleep(2.5)
        standings = self.call(
            "contest.standings",
            **{"contestId": contestId, "as_manager": True, "from": from_, "count": count}
        )
        return standings
