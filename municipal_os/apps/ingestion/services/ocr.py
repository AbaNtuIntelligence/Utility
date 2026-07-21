# apps/ingestion/services/ocr.py

import pytesseract
from PIL import Image

def extract_text(file_path):
    image = Image.open(file_path)
    return pytesseract.image_to_string(image)