from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://redis:6379/0", 
)

celery_app.conf.update(
    task_ignore_result=True,
)

import tasks.comparison.comparison as comparison
import tasks.import_contest_cf.import_contest_cf as import_contest_cf
import tasks.import_yandex_contest.import_yandex_contest as import_yandex_contest
import tasks.condition.condition as condition