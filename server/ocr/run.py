import uvicorn

if __name__ == "__main__":
    uvicorn.run("ocr:app", host="0.0.0.0", port=3001, reload=True)
