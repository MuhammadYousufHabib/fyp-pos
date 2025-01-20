# from flask import Flask, request, jsonify
# from ultralytics import YOLO
# import os

# app = Flask(__name__)

# # Load your trained YOLOv8 model
# model = YOLO('best.pt')  # Replace with your model's path

# @app.route('/')
# def home():
#     return "YOLOv8 Object Detection API is running!"

# @app.route('/predict', methods=['POST'])
# def predict():
#     file = request.files['image']
#     image_path = os.path.join('uploads', file.filename)
#     file.save(image_path)
#     results = model(image_path)
#     detected_objects = []

#     # Extract detection results
#     for result in results:
#         for box in result.boxes:
#             x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
#             confidence = box.conf[0].item()
#             class_id = int(box.cls[0].item())
#             class_name = model.names[class_id]

#             detected_objects.append({
#                 'id': class_id,
#                 'name': class_name,
#                 'bounding_box': {
#                     'x1': x1,
#                     'y1': y1,
#                     'x2': x2,
#                     'y2': y2
#                 },
#                 'confidence': confidence
#             })
#     print("Detected objects:", detected_objects, flush=True)
#     # Return all detected objects
#     return jsonify(detected_objects)

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)


from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import os
import base64
import cv2
import numpy as np

app = Flask(__name__)
# Correctly configure CORS with support for credentials
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# Load your trained YOLOv8 model
model = YOLO('best.pt')  # Replace with your model's path

@app.route('/')
def home():
    return "YOLOv8 Object Detection API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    image_data = request.json.get('image')
    if not image_data:
        return jsonify({"error": "No image data provided"}), 400
    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"error": "Invalid image data"}), 400

    results = model(image)
    detected_objects = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            confidence = box.conf[0].item()
            class_id = int(box.cls[0].item())
            class_name = model.names[class_id]
            detected_objects.append({
                'id': class_id,
                'name': class_name,
                'bounding_box': {
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2
                },
                'confidence': confidence
            })

    if not detected_objects:
        return jsonify({"message": "No objects detected"}), 200

    return jsonify(detected_objects)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
