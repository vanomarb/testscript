import easyocr
import json
import sys
import numpy as np
import os

# Get the current project directory dynamically
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))  # Get script directory
MODEL_DIR = os.path.join(PROJECT_DIR, "models")  # Set model storage inside the project

# Ensure the models directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

def convert_to_serializable(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    else:
        return obj

# ...existing code...

def main(image_paths):
    reader = easyocr.Reader(['ch_sim'], model_storage_directory=MODEL_DIR, download_enabled=False, gpu=False, detector='dbnet18')
    results = []
    for image_path in image_paths:
        result = reader.readtext(image_path, batch_size=15)
        serializable_result = convert_to_serializable(result)
        results.append({
            "image": image_path,
            "result": serializable_result
        })
    print(json.dumps(results))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Accept multiple image paths as arguments
        main(sys.argv[1:])
    else:
        print(json.dumps({"error": "No image path(s) provided"}))
# ...existing code...