import re


def calculate_reading_time(content: str) -> int:
    if not content:
        return 1
    chinese_chars = len(re.findall(r'[一-鿿]', content))
    english_words = len(re.findall(r'[a-zA-Z]+', content))
    total = chinese_chars + english_words
    return max(1, round(total / 400))
