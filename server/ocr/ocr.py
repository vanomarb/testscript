import easyocr
import time
import json
import sys
import os
import cv2
import numpy as np
from datetime import datetime

reader = None

def init_reader(languages="all"):
    global reader
    start_time = time.time()
    try:
        if languages.strip().lower() == "all":
            # Load all supported languages
            langs = easyocr.Reader.supported_languages()
        else:
            langs = [lang.strip() for lang in languages.split(",")] if languages else ["en"]

        reader = easyocr.Reader(langs, gpu=True, download_enabled=False)  # Set gpu=True if you have CUDA GPU
        end_time = time.time()
        print(f"[TIME] EasyOCR Initialization: {end_time - start_time:.3f}s", file=sys.stderr)
        return json.dumps({"status": "success", "message": "EasyOCR reader initialized"})
    except Exception as e:
        return json.dumps({"status": "error", "message": f"Failed to initialize EasyOCR: {str(e)}"})

def preprocess_image(image_path, debug=False):
    """
    Preprocess image(s) before OCR.
    Handles both single image path or a list of image paths.
    Saves each processed image to testscript/tmp/ and returns list of saved paths.
    """

    # Accept both single path or array
    if isinstance(image_path, list):
        processed_paths = []
        for path in image_path:
            result = preprocess_single_image(path, debug=debug)
            if result:
                processed_paths.append(result)
        return processed_paths
    else:
        return preprocess_single_image(image_path, debug=debug)
    
def preprocess_single_image(image_path, debug=False):
    """Preprocess one image and save to tmp/"""
    if not os.path.exists(image_path):
        print(f"[WARN] Image not found: {image_path}")
        return None

    img = cv2.imread(image_path)
    if img is None:
        print(f"[WARN] Failed to load image: {image_path}")
        return None

    # --- Step 1: Convert to grayscale ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # --- Step 2: Apply CLAHE for local contrast ---
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # --- Step 3: Light denoise (avoids removing thin strokes) ---
    gray = cv2.fastNlMeansDenoising(gray, None, 7, 7, 17)

    # --- Step 4: Adaptive threshold (keeps outlines crisp) ---
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 15
    )

    # --- Step 5: Gentle morphological open to remove tiny dots ---
    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    # --- Step 6: Optional contrast boost ---
    cleaned = cv2.convertScaleAbs(cleaned, alpha=1.5, beta=3)



    if debug:
        cv2.imshow("Original", img)
        cv2.imshow("Preprocessed", cleaned)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    return cleaned

def save_image(cleaned, image_path):
    # --- Step 7: Save to tmp folder ---
    tmp_dir = os.path.join(os.getcwd(), "temp")
    os.makedirs(tmp_dir, exist_ok=True)

    basename = os.path.basename(image_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = os.path.join(tmp_dir, f"preprocessed_{timestamp}_{basename}")

    cv2.imwrite(out_path, cleaned)

def read_text(image_path):
    if reader is None:
        return json.dumps({"status": "error", "message": "Reader not initialized"})
    if not os.path.exists(image_path):
        return json.dumps({"status": "error", "message": f"Image not found: {image_path}"})
    try:
        preprocessed = preprocess_image(image_path)
        # save_image(preprocessed, image_path)
        start_time = time.time()
        results = reader.readtext(
            preprocessed,
            detail=1,
            batch_size=20
        )
        end_time = time.time()
        print(f"[TIME] EasyOCR Processing: {end_time - start_time:.3f}s", file=sys.stderr)

        formatted_result = []
        for item in results:
            if len(item) == 3:
                bbox, text, confidence = item
            elif len(item) == 2:
                bbox, text = item
                confidence = 1.0  # default confidence when missing
            else:
                # Unexpected format, skip
                continue

            
            bbox_int = [[int(coord) for coord in point] for point in bbox]
            formatted_result.append({
                "bbox": bbox_int,
                "text": text.strip(),
                "confidence": float(confidence)
            })

        total_time = time.time() - start_time
        print(f"[TIME] Total read_text: {total_time:.3f}s", file=sys.stderr)
        print(f"[INFO] Processed {len(formatted_result)} text regions", file=sys.stderr)

        return json.dumps({"status": "success", "data": formatted_result})
    except Exception as e:
        return json.dumps({"status": "error", "message": f"Error reading text: {str(e)}"})
    
    
def process_command(command, args):
    if command == "init":
        return init_reader(args)
    elif command == "read_text":
        return read_text(args)
    elif command == "close":
        return json.dumps({"status": "success", "message": "Closing process"})
    else:
        return json.dumps({"status": "error", "message": "Invalid command"})

if __name__ == "__main__":
    import io
    import logging
    import sys

    # Configure stdout and stderr for UTF-8
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

    logging.getLogger("easyocr").setLevel(logging.ERROR)

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            parts = line.split(maxsplit=1)
            command = parts[0]
            args = parts[1] if len(parts) > 1 else ""
            result = process_command(command, args)
            sys.stdout.write(result + "\n")
            sys.stdout.flush()
            if command == "close":
                break
        except Exception as e:
            sys.stdout.write(json.dumps({"status": "error", "message": str(e)}) + "\n")
            sys.stdout.flush()