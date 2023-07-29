"""Import Machine Learning Modules."""
from ultralytics import YOLO

# Load model
MODEL = YOLO("models/yolov8n.pt")

# train the model
MODEL.train(data="coco128.yaml", epochs=100, imgsz=640)
