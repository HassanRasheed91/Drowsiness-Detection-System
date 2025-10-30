from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import cv2
import dlib
import numpy as np
from scipy.spatial import distance as dist
from imutils import face_utils
import threading
import time
import json
import os

app = Flask(__name__)
CORS(app)

# Global variables for detection
detector = None
predictor = None
cap = None
is_detecting = False
detection_thread = None
current_metrics = {
    'ear': 0.0,
    'yawn_distance': 0.0,
    'eye_status': 'Normal',
    'yawn_status': 'Normal',
    'face_detected': False
}
current_frame = None
frame_lock = threading.Lock()

# Constants
EYE_AR_THRESH = 0.3
EYE_AR_CONSEC_FRAMES = 30
YAWN_THRESH = 20

def eye_aspect_ratio(eye):
    """Calculate the eye aspect ratio"""
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def final_ear(shape):
    """Calculate EAR for both eyes"""
    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
    
    leftEye = shape[lStart:lEnd]
    rightEye = shape[rStart:rEnd]
    
    leftEAR = eye_aspect_ratio(leftEye)
    rightEAR = eye_aspect_ratio(rightEye)
    
    ear = (leftEAR + rightEAR) / 2.0
    return (ear, leftEye, rightEye)

def lip_distance(shape):
    """Calculate lip distance for yawn detection"""
    top_lip = shape[50:53]
    top_lip = np.concatenate((top_lip, shape[61:64]))
    
    low_lip = shape[56:59]
    low_lip = np.concatenate((low_lip, shape[65:68]))
    
    top_mean = np.mean(top_lip, axis=0)
    low_mean = np.mean(low_lip, axis=0)
    
    distance = abs(top_mean[1] - low_mean[1])
    return distance

def initialize_detection():
    """Initialize the face detection models"""
    global detector, predictor
    
    print("-> Loading the predictor and detector...")
    detector = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")
    predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
    print("-> Models loaded successfully!")

def detection_loop():
    """Main detection loop"""
    global cap, is_detecting, current_metrics, current_frame
    
    print("-> Starting Video Stream")
    
    # First, try to release any existing camera
    try:
        temp_cap = cv2.VideoCapture(0)
        if temp_cap.isOpened():
            temp_cap.release()
            time.sleep(1)  # Wait a bit for camera to be released
    except:
        pass
    
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("-> Error: Could not open camera")
            return
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        print("-> Video stream started successfully")
    except Exception as e:
        print(f"-> Error starting video stream: {e}")
        return
    
    COUNTER = 0
    alarm_status = False
    frame_count = 0
    
    while is_detecting:
        try:
            ret, frame = cap.read()
            if not ret or frame is None:
                print("-> No frame received from camera")
                time.sleep(0.1)
                continue
                
            frame_count += 1
            if frame_count % 30 == 0:  # Log every 30 frames
                print(f"-> Processing frame {frame_count}")
            
            # Store the original frame for video stream
            with frame_lock:
                current_frame = frame.copy()
            
            frame = cv2.resize(frame, (450, 450))
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            rects = detector.detectMultiScale(gray, scaleFactor=1.1,
                                            minNeighbors=5, minSize=(30, 30),
                                            flags=cv2.CASCADE_SCALE_IMAGE)
            
            current_metrics['face_detected'] = len(rects) > 0
            
            for (x, y, w, h) in rects:
                rect = dlib.rectangle(int(x), int(y), int(x + w), int(y + h))
                
                shape = predictor(gray, rect)
                shape = face_utils.shape_to_np(shape)
                
                # Calculate EAR
                eye = final_ear(shape)
                ear = eye[0]
                leftEye = eye[1]
                rightEye = eye[2]
                
                # Calculate yawn distance
                distance = lip_distance(shape)
                
                # Update metrics
                current_metrics['ear'] = float(ear)
                current_metrics['yawn_distance'] = float(distance)
                
                # Eye status detection
                if ear < EYE_AR_THRESH:
                    COUNTER += 1
                    if COUNTER >= EYE_AR_CONSEC_FRAMES:
                        current_metrics['eye_status'] = 'Drowsy'
                        if not alarm_status:
                            alarm_status = True
                            print("-> DROWSINESS ALERT!")
                    else:
                        current_metrics['eye_status'] = 'Warning'
                else:
                    COUNTER = 0
                    alarm_status = False
                    current_metrics['eye_status'] = 'Normal'
                
                # Yawn status detection
                if distance > YAWN_THRESH:
                    current_metrics['yawn_status'] = 'Yawning'
                    print("-> YAWN DETECTED!")
                else:
                    current_metrics['yawn_status'] = 'Normal'
                
                # Draw contours on frame
                leftEyeHull = cv2.convexHull(leftEye)
                rightEyeHull = cv2.convexHull(rightEye)
                cv2.drawContours(frame, [leftEyeHull], -1, (0, 255, 0), 1)
                cv2.drawContours(frame, [rightEyeHull], -1, (0, 255, 0), 1)
                
                lip = shape[48:60]
                cv2.drawContours(frame, [lip], -1, (0, 255, 0), 1)
            
            if not current_metrics['face_detected']:
                current_metrics['eye_status'] = 'No Face'
                current_metrics['yawn_status'] = 'No Face'
                
        except Exception as e:
            print(f"-> Error in detection loop: {e}")
            time.sleep(0.1)
    
    if cap:
        cap.release()
        print("-> Video stream stopped")

def generate_frames():
    """Generate video frames for streaming"""
    while True:
        with frame_lock:
            if current_frame is not None:
                # Encode frame to JPEG
                ret, buffer = cv2.imencode('.jpg', current_frame)
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033)  # ~30 FPS

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/start_detection', methods=['POST'])
def start_detection():
    """Start the drowsiness detection"""
    global is_detecting, detection_thread
    
    if is_detecting:
        return jsonify({'status': 'error', 'message': 'Detection already running'})
    
    try:
        is_detecting = True
        detection_thread = threading.Thread(target=detection_loop)
        detection_thread.start()
        return jsonify({'status': 'success', 'message': 'Detection started'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/stop_detection', methods=['POST'])
def stop_detection():
    """Stop the drowsiness detection"""
    global is_detecting, cap
    
    is_detecting = False
    
    # Release camera immediately
    if cap:
        cap.release()
        cap = None
    
    return jsonify({'status': 'success', 'message': 'Detection stopped'})

@app.route('/api/metrics')
def get_metrics():
    """Get current detection metrics"""
    return jsonify(current_metrics)

@app.route('/api/settings', methods=['GET', 'POST'])
def settings():
    """Handle settings"""
    if request.method == 'POST':
        data = request.json
        # Update settings logic here
        return jsonify({'status': 'success'})
    else:
        return jsonify({
            'ear_threshold': EYE_AR_THRESH,
            'yawn_threshold': YAWN_THRESH
        })

if __name__ == '__main__':
    # Initialize detection models
    initialize_detection()
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000) 