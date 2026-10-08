import zipfile
import io
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

DIR_PATTERN = re.compile(r'^(?P<name>.+?)\s*-\s*(?P<id>\d+)$')
FILE_PATTERN = re.compile(
    r'^(?P<problem>[^-]+)-(?P<submission>\d+)-(?P<language>[^-]+)-(?P<verdict>[^.]+)\..+$'
)

def extract_submissions_from_zip_bytes(content_bytes: bytes) -> list:
    try:
        zip_file = zipfile.ZipFile(io.BytesIO(content_bytes))
        logger.info(f"ZIP архив успешно открыт. Всего элементов: {len(zip_file.infolist())}")
    except zipfile.BadZipFile:
        logger.error("Некорректный ZIP архив")
        raise ValueError("Некорректный ZIP архив")

    submissions = []
    skipped = 0

    for zip_info in zip_file.infolist():
        if zip_info.is_dir():
            continue

        path = zip_info.filename.replace("\\", "/")
        parts = path.split("/")

        if len(parts) != 2:
            logger.warning(f"Некорректная структура пути: {zip_info.filename}")
            skipped += 1
            continue

        dir_name, file_name = parts

        dir_match = DIR_PATTERN.match(dir_name)
        if not dir_match:
            logger.warning(f"Директория не соответствует шаблону: {dir_name}")
            skipped += 1
            continue

        file_match = FILE_PATTERN.match(file_name)
        if not file_match:
            logger.warning(f"Файл не соответствует шаблону: {file_name}")
            skipped += 1
            continue

        author = dir_match.group("name").strip()
        author_id = int(dir_match.group("id"))

        problem = file_match.group("problem")
        submission_id = int(file_match.group("submission"))
        language = file_match.group("language")
        verdict = file_match.group("verdict")

        try:
            with zip_file.open(zip_info) as f:
                code = f.read().decode("utf-8")

            submission = {
                "author": author,
                "authorId": author_id,
                "problem": problem,
                "submissionId": submission_id,
                "language": language,
                "verdict": verdict,
                "code": code,
            }

            submissions.append(submission)

            logger.info(
                f"Извлечена посылка: {author} ({author_id}) "
                f"{problem}-{submission_id} {language} {verdict}"
            )

        except Exception as e:
            logger.error(f"Ошибка чтения файла {zip_info.filename}: {e}")
            skipped += 1

    logger.info(f"Извлечение завершено. Найдено: {len(submissions)}, пропущено: {skipped}")

    return submissions