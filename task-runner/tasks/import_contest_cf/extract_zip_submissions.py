import zipfile
import io
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# Шаблон: цифры + точка + что угодно
FILE_PATTERN = re.compile(r'^(\d+)\..+$')

def extract_code_from_zip_bytes(content_bytes: bytes) -> dict:
    try:
        zip_file = zipfile.ZipFile(io.BytesIO(content_bytes))
        logger.info(f"ZIP архив успешно открыт. Всего файлов: {len(zip_file.infolist())}")
    except zipfile.BadZipFile:
        logger.error("Некорректный ZIP архив")
        raise ValueError("Некорректный ZIP архив")

    result_dict = {}
    skipped_files = 0

    for zip_info in zip_file.infolist():
        if zip_info.is_dir():
            logger.debug(f"Пропущена директория: {zip_info.filename}")
            skipped_files += 1
            continue
        if '/' in zip_info.filename or '\\' in zip_info.filename:
            logger.warning(f"Пропущен файл в подпапке: {zip_info.filename}")
            skipped_files += 1
            continue

        match = FILE_PATTERN.match(zip_info.filename)
        if not match:
            logger.warning(f"Файл не соответствует шаблону и пропущен: {zip_info.filename}")
            skipped_files += 1
            continue

        key = int(match.group(1))
        try:
            with zip_file.open(zip_info) as f:
                content = f.read().decode("utf-8")
                result_dict[key] = content
                logger.info(f"Файл извлечён: {zip_info.filename} -> key={key}, размер={len(content)} символов")
        except Exception as e:
            logger.error(f"Ошибка при чтении файла {zip_info.filename}: {e}")
            skipped_files += 1

    logger.info(f"Извлечение завершено. Успешно: {len(result_dict)}, пропущено: {skipped_files}")
    return result_dict

