import fitz  # PyMuPDF
import io
import base64
import logging

logger = logging.getLogger(__name__)


class PDFExtractor:
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """
        Extracts raw text from a text-based PDF file provided as bytes.
        Returns empty string if the PDF is scanned/image-based.
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text("text"))
            doc.close()
            combined = "\n".join(text_parts).strip()
            return combined
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}")
            return ""

    @staticmethod
    def get_pdf_page_images_base64(pdf_bytes: bytes, max_pages: int = 3) -> list:
        """
        Renders each PDF page as a JPEG image and returns a list of
        base64-encoded strings. Used for vision-based analysis of scanned PDFs.
        Limits to max_pages to control token usage.
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            images = []
            for i, page in enumerate(doc):
                if i >= max_pages:
                    break
                # 150 DPI is enough for vision models and keeps image size small
                pix = page.get_pixmap(dpi=150)
                img_bytes = pix.tobytes("jpeg")
                images.append(base64.b64encode(img_bytes).decode("utf-8"))
            doc.close()
            return images
        except Exception as e:
            logger.error(f"PDF page rendering failed: {str(e)}")
            return []

    @staticmethod
    def image_bytes_to_base64(image_bytes: bytes) -> str:
        """Converts raw image bytes to a base64-encoded string."""
        return base64.b64encode(image_bytes).decode("utf-8")
