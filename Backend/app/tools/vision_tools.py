import re
import os
from typing import Type, List
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from thefuzz import fuzz
import spacy

# --- OCR Library Imports ---
import pytesseract
from PIL import Image

# --- Face Recognition Imports ---
import face_recognition

# --- Tesseract Configuration (For Windows Users) ---
# If Tesseract is not in your system's PATH, you'll need to point to the .exe file.
# Uncomment the line below and set the correct path if you get a "Tesseract not found" error.
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# --- Document Verification Tool (Remains the same) ---

class DocumentVerifierInput(BaseModel):
    """Input model for the DocumentVerifierTool."""
    full_name_from_user: str = Field(description="The full name provided by the user in the form.")
    govt_id_from_user: str = Field(description="The government ID number provided by the user in the form.")
    file_paths: List[str] = Field(description="A list of local file paths to the document images to be verified.")

class DocumentVerifierTool(BaseTool):
    """
    A tool that takes user-provided data (name, ID number) and corresponding
    document images. It performs OCR on the images and verifies if the user's
    data is present in the text of both documents.
    """
    name: str = "document_verifier_tool"
    description: str = (
        "Verifies if a user's name and government ID number exist within the text of uploaded documents (deed and ID card) using OCR."
    )
    args_schema: Type[BaseModel] = DocumentVerifierInput

    def _find_best_name_match(self, text_list: List[str], name_to_match: str) -> int:
        """Finds the best fuzzy match score for a name in a list of text snippets."""
        scores = [fuzz.partial_ratio(name_to_match.lower(), line.lower()) for line in text_list]
        return max(scores) if scores else 0

    def _run(self, full_name_from_user: str, govt_id_from_user: str, file_paths: List[str]) -> dict:
        """Use the tool."""
        results = {
            "deed_verification": {"name_found": False, "id_found": False, "name_match_score": 0},
            "id_verification": {"name_found": False, "id_found": False, "name_match_score": 0},
            "is_overall_verified": False,
            "reason": "Verification not fully completed."
        }
        
        deed_file_path = next((p for p in file_paths if "_deed" in os.path.basename(p).lower()), None)
        id_file_path = next((p for p in file_paths if "_id" in os.path.basename(p).lower()), None)
        
        if not deed_file_path or not id_file_path:
            return {"error": "Could not find files with '_deed' and '_id' suffixes. Please check file names."}

        try:
            deed_text = pytesseract.image_to_string(Image.open(deed_file_path), lang='eng')
            deed_text_lines = deed_text.splitlines()
            results["deed_verification"]["name_match_score"] = self._find_best_name_match(deed_text_lines, full_name_from_user)
            if results["deed_verification"]["name_match_score"] > 85:
                results["deed_verification"]["name_found"] = True
            if govt_id_from_user in deed_text:
                results["deed_verification"]["id_found"] = True

            id_text = pytesseract.image_to_string(Image.open(id_file_path), lang='eng')
            id_text_lines = id_text.splitlines()
            results["id_verification"]["name_match_score"] = self._find_best_name_match(id_text_lines, full_name_from_user)
            if results["id_verification"]["name_match_score"] > 85:
                results["id_verification"]["name_found"] = True
            if govt_id_from_user in id_text:
                results["id_verification"]["id_found"] = True

        except pytesseract.TesseractNotFoundError:
            return {"error": "Tesseract is not installed or not in your PATH."}
        except Exception as e:
            return {"error": f"An error occurred during OCR processing: {str(e)}"}

        deed_verified = results["deed_verification"]["name_found"] and results["deed_verification"]["id_found"]
        id_verified = results["id_verification"]["name_found"] and results["id_verification"]["id_found"]

        if deed_verified and id_verified:
            results["is_overall_verified"] = True
            results["reason"] = "SUCCESS: User's name and government ID were found in both the deed and ID documents."
        else:
            reasons = []
            if not deed_verified:
                reasons.append("Deed verification failed.")
            if not id_verified:
                reasons.append("ID document verification failed.")
            results["reason"] = "FAILURE: " + " ".join(reasons)
            
        return results

    async def _arun(self, full_name_from_user: str, govt_id_from_user: str, file_paths: List[str]) -> dict:
        return self._run(full_name_from_user, govt_id_from_user, file_paths)

# --- NEW: Face Verification Tool ---

class FaceVerificationInput(BaseModel):
    """Input model for the FaceVerificationTool."""
    id_card_path: str = Field(description="The file path to the user's uploaded ID card image.")
    live_photo_path: str = Field(description="The file path to the live photo captured from the user's camera.")

class FaceVerificationTool(BaseTool):
    """
    A tool that compares the face from an ID card with a live photo to verify a user's identity.
    """
    name: str = "face_verification_tool"
    description: str = "Compares two images to verify if the faces belong to the same person."
    args_schema: Type[BaseModel] = FaceVerificationInput

    def _run(self, id_card_path: str, live_photo_path: str) -> dict:
        """Use the tool."""
        try:
            # Load images
            id_image = face_recognition.load_image_file(id_card_path)
            live_image = face_recognition.load_image_file(live_photo_path)

            # Find face encodings. We assume one face per image for this use case.
            id_face_encodings = face_recognition.face_encodings(id_image)
            live_face_encodings = face_recognition.face_encodings(live_image)

            if not id_face_encodings:
                return {"error": "Could not find a face in the ID card image."}
            if not live_face_encodings:
                return {"error": "Could not find a face in the live photo."}

            # Compare the first face found in each image
            # compare_faces returns a list of True/False for each face to compare.
            # We only have one, so we take the first result.
            matches = face_recognition.compare_faces([id_face_encodings[0]], live_face_encodings[0])
            
            # face_distance gives a measure of how similar the faces are. Lower is better.
            distance = face_recognition.face_distance([id_face_encodings[0]], live_face_encodings[0])[0]

            return {
                "face_match_found": bool(matches[0]),
                "face_distance": round(distance, 2), # A typical threshold for matching is <= 0.6
                "reason": "Face match successful." if matches[0] else "Face match failed."
            }

        except Exception as e:
            return {"error": f"An error occurred during face recognition: {str(e)}"}

    async def _arun(self, id_card_path: str, live_photo_path: str) -> dict:
        return self._run(id_card_path, live_photo_path)