
def normalize_language(lang: str) -> str:
    language_map = {
        "gcc14_cpp23": "cpp",
    }
    lang_lower = lang.lower().strip()
    return language_map.get(lang_lower, "unknown")
