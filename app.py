from flask import Flask, request, render_template, send_file
import cv2
import numpy as np
import os
import io

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    file = request.files.get('image')
    if not file:
        return 'No file uploaded', 400

    # Read image into OpenCV
    img_array = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Encode result as JPEG
    success, buffer = cv2.imencode('.jpg', gray)
    if not success:
        return 'Failed to convert image', 500

    # Return result as file stream
    return send_file(
        io.BytesIO(buffer.tobytes()),
        mimetype='image/jpeg',
        download_name='grayscale.jpg'
    )

if __name__ == '__main__':
    app.run(debug=True)
