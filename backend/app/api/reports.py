from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.config import settings

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


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
    Extracts text, parses biomarkers, and generates an AI summary.
    """
    content = await file.read()
    validate_upload(file, content)

    try:
        from app.services.pdf_extractor import PDFExtractor
        from app.services.medical_parser import MedicalParser
        from app.services.ai_service import AIService

        # Step 1: Extract text
        if file.content_type == "application/pdf":
            raw_text = PDFExtractor.extract_text_from_bytes(content)
        else:
            # Image path — Phase 3.5 (basic fallback for now)
            raw_text = PDFExtractor.extract_text_from_image_bytes(content)

        # Step 2: Parse biomarkers
        biomarkers = MedicalParser.parse_text(raw_text)

        # Step 3: Generate AI summary (passes raw_text as fallback)
        ai_service = AIService()
        ai_summary = ai_service.generate_health_summary(
            biomarkers=biomarkers,
            raw_text=raw_text
        )

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
    Extracts text and generates an AI medicine breakdown.
    """
    content = await file.read()
    validate_upload(file, content)

    try:
        from app.services.pdf_extractor import PDFExtractor
        from app.services.ai_service import AIService

        # Step 1: Extract text
        if file.content_type == "application/pdf":
            raw_text = PDFExtractor.extract_text_from_bytes(content)
        else:
            raw_text = PDFExtractor.extract_text_from_image_bytes(content)

        if not raw_text.strip():
            raise ValueError("Could not extract any text from the uploaded file.")

        # Step 2: AI prescription analysis
        ai_service = AIService()
        prescription_analysis = ai_service.analyze_prescription(raw_text)

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
