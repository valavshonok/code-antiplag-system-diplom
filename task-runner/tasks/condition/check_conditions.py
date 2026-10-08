from typing import List
from pydantic import BaseModel


class Condition(BaseModel):
    title: str
    description: str


class ConditionResult(BaseModel):
    title: str
    satisfied: bool
    comment: str


def check_conditions(
    code: str,
    conditions: List[Condition]
) -> List[ConditionResult]:

    if len(conditions) == 0:
        return []

    return [
        ConditionResult(
            title=condition.title,
            satisfied=False,
            comment=""
        )
        for condition in conditions
    ]








# import logging
# from typing import Dict, Any, List
# from pydantic import BaseModel, Field
# from mistralai import Mistral
# from instructor import from_mistral, Mode
# import time

# # ====== MODEL ======

# logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
# logger = logging.getLogger(__name__)

# class Condition(BaseModel):
#     title: str = Field(..., description="Заголовок условия")
#     description: str = Field(..., description="Описание условия для проверки кода")

# class ConditionResult(BaseModel):
#     title: str
#     satisfied: bool
#     comment: str

# class CodeCheckResponse(BaseModel):
#     results: List[ConditionResult]


# def check_conditions(code: str, conditions: List[Condition]) -> List[ConditionResult]:
#     if len(conditions) == 0:
#         return []
#     try:
#         # ====== CLIENT ======
#         client = Mistral(api_key="fEioyeazGHRJzMiDMDXXvwmboI6pDqDp")

#         instructor_client = from_mistral(
#             client=client,
#             mode=Mode.MISTRAL_TOOLS
#         )
        
#         # -----------------------------
#         # ФОРМИРОВАНИЕ ПРОМПТА
#         # -----------------------------

#         conditions_text = "Условия:\n===========\n"
#         for i, c in enumerate(conditions, 1):
#             conditions_text += f"""{i}
#         Название: {c.title}
#         Описание:
#         {c.description}
#         ==========
#         """

#         user_prompt = f"""
#         Проанализируй следующий код согласно указанным условиям.

#         Верни строго структурированный ответ.

#         Для каждого условия:
#         - Определи, выполнено оно или нет.
#         - Дай краткое техническое объяснение на русском языке.

#         Код:

#         {code}

#         {conditions_text}

#         Ответ должен быть только в структурированном формате.
#         Все комментарии должны быть на русском языке.
#         """


#         # -----------------------------
#         # ВЫЗОВ МОДЕЛИ
#         # -----------------------------

#         time.sleep(2)
#         try:
#             response = instructor_client.chat.completions.create(
#                 response_model=CodeCheckResponse,
#                 model="mistral-small-latest",
#                 messages=[{"role": "user", "content": user_prompt}],
#                 temperature=0,
#             )

#             return response.results

#         except Exception as e:
#             error_text = str(e).lower()

#             if (
#                 "429" in error_text
#                 or "too many requests" in error_text
#                 or "rate limit" in error_text
#             ):
#                 logger.info("Too many requests, waiting for the limit to be updated")
#                 time.sleep(61)

#                 try:
#                     response = instructor_client.chat.completions.create(
#                         response_model=CodeCheckResponse,
#                         model="mistral-small-latest",
#                         messages=[{"role": "user", "content": user_prompt}],
#                         temperature=0,
#                     )

#                     return response.results

#                 except Exception:
#                     return []

#             return []
#     except:
#         return []
