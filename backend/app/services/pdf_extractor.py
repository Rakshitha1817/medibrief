import fitz  # PyMuPDF
import io
import logging

logger = logging.getLogger(__name__)


class PDFExtractor:
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """
        Extracts raw text from a PDF file provided as bytes.
        Falls back to OCR (page-by-page image → pytesseract) when
        PyMuPDF's native text extraction returns nothing useful.
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text("text"))
            doc.close()
            combined = "\n".join(text_parts).strip()

            # If native extraction returned meaningful text, use it
            if len(combined) > 30:
                return combined

            # Fallback: render each page as an image and run OCR
            logger.info("Native PDF text empty – falling back to OCR")
            return PDFExtractor._ocr_pdf_bytes(pdf_bytes)

        except Exception as e:
            logger.error(f"PDF extraction failed: {str(e)}")
            raise ValueError(f"PDF Extraction Error: {str(e)}")

    @staticmethod
    def _ocr_pdf_bytes(pdf_bytes: bytes) -> str:
        """Render each PDF page as an image, then OCR with pytesseract."""
        try:
            import pytesseract
            from PIL import Image

            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            ocr_parts = []
            for page_num, page in enumerate(doc):
                pix = page.get_pixmap(dpi=300)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text = pytesseract.image_to_string(img)
                if text.strip():
                    ocr_parts.append(text)
            doc.close()
            return "\n".join(ocr_parts)
        except ImportError:
            logger.warning("pytesseract/Pillow not installed – OCR unavailable")
            return ""
        except Exception as e:
            logger.error(f"OCR fallback failed: {str(e)}")
            return ""

    @staticmethod
    def extract_text_from_image_bytes(image_bytes: bytes) -> str:
        """
        Attempts OCR on a standalone image using pytesseract.
        Falls back gracefully if pytesseract is not installed.
        """
        try:
            import pytesseract
            from PIL import Image
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            return text
        except ImportError:
            logger.warning("pytesseract not installed. Returning empty text for image.")
            return ""
        except Exception as e:
            logger.error(f"Image OCR failed: {str(e)}")
            return ""
