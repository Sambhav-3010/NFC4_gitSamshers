import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import shutil
from typing import List
from fastapi.middleware.cors import CORSMiddleware


# Import the tools
from app.tools.vision_tools import DocumentVerifierTool, FaceVerificationTool

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Real Estate AI Verification Service",
    description="An API that uses AI to verify documents and match faces.",
    version="3.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- Instantiate Tools ---
doc_verifier = DocumentVerifierTool()
face_verifier = FaceVerificationTool()

# --- API Endpoints ---

@app.get("/", tags=["Status"])
async def read_root():
    """A simple endpoint to check if the API is running."""
    return {"status": "Real Estate AI Service is running!"}

@app.post("/verify_identity", tags=["Property Registration"])
async def verify_identity(
    files: List[UploadFile] = File(...),
    full_name: str = Form(...),
    govt_id_number: str = Form(...)
):
    """
    This endpoint performs a full identity verification:
    1. Verifies user's name and ID number against uploaded documents.
    2. Verifies the user's live photo against their ID card photo.
    
    It expects THREE files named according to the convention:
    - `..._deed.jpg`
    - `..._id.jpg`
    - `..._live.jpg`
    """
    
    temp_dir = "temp_uploads"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    file_paths = []
    for file in files:
        safe_filename = os.path.basename(file.filename)
        path = os.path.join(temp_dir, safe_filename)
        file_paths.append(path)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    # --- Identify file paths for tools ---
    deed_file_path = next((p for p in file_paths if "_deed" in os.path.basename(p).lower()), None)
    id_file_path = next((p for p in file_paths if "_id" in os.path.basename(p).lower()), None)
    live_photo_path = next((p for p in file_paths if "_live" in os.path.basename(p).lower()), None)
    
    if not all([deed_file_path, id_file_path, live_photo_path]):
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=400, detail="Missing one or more required files. Please upload files with '_deed', '_id', and '_live' suffixes.")

    # --- Agentic Workflow ---
    try:
        # Step 1: Verify Documents
        print("Step 1: Running Document Verifier Tool...")
        doc_tool_input = {
            "full_name_from_user": full_name,
            "govt_id_from_user": govt_id_number,
            "file_paths": [deed_file_path, id_file_path]
        }
        doc_verification_result = doc_verifier.run(doc_tool_input)
        print(f"Document verification complete: {doc_verification_result}")

        if not doc_verification_result.get("is_overall_verified"):
            raise HTTPException(status_code=422, detail={"document_verification": doc_verification_result})

        # Step 2: Verify Faces
        print("Step 2: Running Face Verification Tool...")
        face_tool_input = {
            "id_card_path": id_file_path,
            "live_photo_path": live_photo_path
        }
        face_verification_result = face_verifier.run(face_tool_input)
        print(f"Face verification complete: {face_verification_result}")

        if not face_verification_result.get("face_match_found"):
            raise HTTPException(status_code=422, detail={"face_verification": face_verification_result})

    except HTTPException as e:
        # Re-raise HTTP exceptions to be handled by FastAPI
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary files
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

    # --- FINAL RESPONSE ---
    final_response = {
        "agent_workflow_status": "Completed",
        "verification_details": {
            "document_verification": doc_verification_result,
            "face_verification": face_verification_result
        },
        "final_verdict": "Owner Identity Verified. Ready for blockchain registration."
    }

    return JSONResponse(status_code=200, content=final_response)