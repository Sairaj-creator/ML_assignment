# Edge-AI Privacy Masking

Real-time PII (Personally Identifiable Information) Masking in Video Streams using YOLOv8.

## Project Structure

- `backend/`: FastAPI backend for processing images/videos and managing user stats.
- `frontend/`: React + Vite frontend for the web-based demo (To be implemented).
- `models/`: Trained YOLOv8 ONNX models (to be added).

## Getting Started (Backend)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## ML Models

Place your ONNX models in `backend/models/`:
- `fp32_640.onnx`
- `int8_dynamic_640.onnx`
- `int8_static_640.onnx`
