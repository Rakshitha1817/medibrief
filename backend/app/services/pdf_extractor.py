import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)


class PDFExtractor:
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """Extracts raw text from a PDF file provided as bytes."""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text("text"))
            doc.close()
            return "\n".join(text_parts)
        except Exception as e:
            logger.error(f"PDF extraction failed: {str(e)}")
            raise ValueError(f"PDF Extraction Error: {str(e)}")

    @staticmethod
    def extract_text_from_image_bytes(image_bytes: bytes) -> str:
        """
        Phase 3.5: Attempts basic OCR on an image using pytesseract.
        Falls back gracefully if pytesseract is not installed.
        """
        try:
            import pytesseract
            from PIL import Image
            import io
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            return text
        except ImportError:
            logger.warning("pytesseract not installed. Returning empty text for image.")
            return ""
        except Exception as e:
            logger.error(f"Image OCR failed: {str(e)}")
            return ""
