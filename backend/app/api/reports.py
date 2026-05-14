from fastapi import APIRouter, UploadFile, File, HTTPException, status

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Map content-type to MIME type string used in base64 data URLs
MIME_MAP = {
    "image/jpeg": "image/jpeg",
    "image/jpg":  "image/jpeg",
    "image/png":  "image/png",
    "image/webp": "image/webp",
}


def validate_upload(file: UploadFile, content: bytes):
    """Validates file type and size."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a PDF or image (JPG, PNG, WEBP)."
        )
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit."
        )


@router.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    """
    Handles lab report uploads (PDF or image).

    Pipeline:
      - Text-based PDF  → native text extraction → text AI model
      - Scanned PDF     → render pages to images → vision AI model
      - Image (any fmt) → base64 encode          → vision AI model
    """
    content = await file.read()
    validate_upload(file, content)

    try:
        from app.services.pdf_extractor import PDFExtractor
        from app.services.medical_parser import MedicalParser
        from app.services.ai_service import AIService

        ai_service = AIService()

        if file.content_type == "application/pdf":
            # Try native text extraction first (fast, cheap)
            raw_text = PDFExtractor.extract_text_from_bytes(content)

            if len(raw_text.strip()) > 30:
                # Text-based PDF — use standard text pipeline
                biomarkers = MedicalParser.parse_text(raw_text)
                ai_summary = ai_service.generate_health_summary(
                    biomarkers=biomarkers,
                    raw_text=raw_text
                )
            else:
                # Scanned/image PDF — render pages and use vision model
                page_images = PDFExtractor.get_pdf_page_images_base64(content)
                if not page_images:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="Could not render PDF pages. The file may be corrupt."
                    )
                ai_summary = ai_service.analyze_with_vision(
                    images_base64=page_images,
                    mime_type="image/jpeg",
                    is_prescription=False
                )
                biomarkers = {}  # vision model extracts inline

        else:
            # Uploaded image — send directly to vision model
            mime_type = MIME_MAP.get(file.content_type, "image/jpeg")
            img_b64 = PDFExtractor.image_bytes_to_base64(content)
            ai_summary = ai_service.analyze_with_vision(
                images_base64=[img_b64],
                mime_type=mime_type,
                is_prescription=False
            )
            biomarkers = {}

        return {
            "filename": file.filename,
            "file_type": "lab_report",
            "status": "success",
            "biomarkers_found": len(biomarkers),
            "biomarkers": biomarkers,
            "ai_summary": ai_summary,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )


@router.post("/upload-prescription")
async def upload_prescription(file: UploadFile = File(...)):
    """
    Handles prescription uploads (PDF or image).

    Pipeline:
      - Text-based PDF  → native text extraction → text AI model
      - Scanned PDF     → render pages to images → vision AI model
      - Image (any fmt) → base64 encode          → vision AI model
    """
    content = await file.read()
    validate_upload(file, content)

    try:
        from app.services.pdf_extractor import PDFExtractor
        from app.services.ai_service import AIService

        ai_service = AIService()

        if file.content_type == "application/pdf":
            raw_text = PDFExtractor.extract_text_from_bytes(content)

            if len(raw_text.strip()) > 30:
                # Text-based PDF
                prescription_analysis = ai_service.analyze_prescription(raw_text)
            else:
                # Scanned PDF — use vision
                page_images = PDFExtractor.get_pdf_page_images_base64(content)
                if not page_images:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="Could not render PDF pages. The file may be corrupt."
                    )
                prescription_analysis = ai_service.analyze_with_vision(
                    images_base64=page_images,
                    mime_type="image/jpeg",
                    is_prescription=True
                )
        else:
            # Uploaded image
            mime_type = MIME_MAP.get(file.content_type, "image/jpeg")
            img_b64 = PDFExtractor.image_bytes_to_base64(content)
            prescription_analysis = ai_service.analyze_with_vision(
                images_base64=[img_b64],
                mime_type=mime_type,
                is_prescription=True
            )

        return {
            "filename": file.filename,
            "file_type": "prescription",
            "status": "success",
            "prescription_analysis": prescription_analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process prescription: {str(e)}"
        )
