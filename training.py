"""Import Machine Learning Modules."""
from ultralytics import YOLO

# Load model
model = ("models/yolov8n.pt")

result = model.train
(
    data = "analysis_data.yaml",
    imgsz=1280,
    epochs=10,
    batch=8,
    name="yolov8n_ver01"
)
