# Real-Time Drowsiness Detection System with Web Frontend

## 🚀 Features

### ✅ **Backend (Python/Flask)**
- **Real-time Camera Processing**: OpenCV-based video capture
- **Face Detection**: Haar Cascade classifier for robust face detection
- **Eye Tracking**: dlib's 68-point facial landmarks for precise eye monitoring
- **Drowsiness Detection**: Eye Aspect Ratio (EAR) calculation and monitoring
- **Yawn Detection**: Lip distance measurement for yawn detection
- **Video Streaming**: Live video feed to frontend via HTTP stream
- **API Endpoints**: RESTful API for frontend communication

### ✅ **Frontend (HTML/CSS/JavaScript)**
- **Modern UI**: Clean, responsive design with gradient background
- **Live Video Stream**: Real-time camera feed from backend
- **Interactive Controls**: Start/Stop detection with visual feedback
- **Real-time Metrics**: Live display of EAR values, yawn distance, and status
- **Alert System**: Visual and audio alerts for drowsiness/yawn detection
- **Session Timer**: Tracks monitoring duration
- **Settings Panel**: Configurable thresholds via web interface

## 🛠️ Installation

### Prerequisites
- Python 3.7+
- Webcam
- Modern web browser

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real-Time-Drowsiness-Detection-System
   ```

2. **Create conda environment**
   ```bash
   conda create -n drowsiness_old python=3.7 -y
   conda activate drowsiness_old
   ```

3. **Install dependencies**
   ```bash
   pip install dlib imutils numpy opencv-python playsound scipy flask flask-cors requests
   ```

4. **Download required files**
   - Ensure `haarcascade_frontalface_default.xml` is present
   - Ensure `shape_predictor_68_face_landmarks.dat` is present
   - Ensure `Alert.wav` is present

## 🚀 Usage

### Starting the System
1. **Activate environment**
   ```bash
   conda activate drowsiness_old
   ```

2. **Run the Flask app**
   ```bash
   python app.py
   ```

3. **Open browser**
   - Navigate to: `http://127.0.0.1:5000` or `http://10.200.3.241:5000`
   - The web interface will load automatically

### Using the System
1. **Click "Start Detection"**
   - System will request camera access
   - Backend will start processing video
   - Frontend will display live video stream

2. **Monitor in Real-time**
   - **Eye Status**: Shows current eye state (Normal/Warning/Drowsy)
   - **Yawn Status**: Shows yawn detection status
   - **EAR Value**: Eye Aspect Ratio (lower = more closed eyes)
   - **Session Time**: Duration of monitoring session

3. **Alerts**
   - **Visual Alerts**: Red text and pulsing indicators
   - **Audio Alerts**: Sound alerts for drowsiness detection
   - **Status Updates**: Real-time status changes

4. **Settings**
   - Click "Settings" to adjust thresholds
   - **EAR Threshold**: Eye closure sensitivity (default: 0.3)
   - **Yawn Threshold**: Yawn detection sensitivity (default: 20)
   - **Alert Sound**: Choose different alert sounds

## 📊 System Architecture

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │◄────────────────────►│   Backend       │
│   (Browser)     │                      │   (Flask)       │
│                 │                      │                 │
│ • Video Display │                      │ • Camera Access │
│ • UI Controls   │                      │ • Face Detection│
│ • Metrics Show  │                      │ • Eye Tracking  │
│ • Alerts        │                      │ • Yawn Detection│
└─────────────────┘                      └─────────────────┘
```

## 🔧 API Endpoints

- `GET /` - Main web interface
- `GET /video_feed` - Live video stream
- `POST /api/start_detection` - Start drowsiness detection
- `POST /api/stop_detection` - Stop drowsiness detection
- `GET /api/metrics` - Get current detection metrics
- `GET/POST /api/settings` - Manage system settings

## 📈 Metrics Explained

### Eye Aspect Ratio (EAR)
- **Normal**: 0.3 - 0.4 (eyes open)
- **Warning**: 0.2 - 0.3 (eyes partially closed)
- **Drowsy**: < 0.2 (eyes closed for extended period)

### Yawn Distance
- **Normal**: < 20 pixels
- **Yawning**: > 20 pixels (configurable)

## 🎯 Detection Algorithm

1. **Face Detection**: Haar Cascade finds faces in video frame
2. **Landmark Detection**: dlib extracts 68 facial landmarks
3. **Eye Analysis**: Calculate EAR for both eyes
4. **Lip Analysis**: Measure distance between upper and lower lip
5. **Threshold Comparison**: Compare against configurable thresholds
6. **Alert Generation**: Trigger alerts when thresholds exceeded

## 🔧 Troubleshooting

### Camera Issues
- **No video display**: Check camera permissions in browser
- **Backend camera errors**: Ensure no other app is using camera
- **Test camera**: Run `python test_camera.py` to verify camera access

### Performance Issues
- **Slow detection**: Reduce video resolution in settings
- **High CPU usage**: Close other applications
- **Memory issues**: Restart the application

### Browser Issues
- **Video not loading**: Try refreshing the page
- **JavaScript errors**: Check browser console for errors
- **HTTPS issues**: Use HTTP for local development

## 🚀 Future Enhancements

- **Mobile App**: Native mobile application
- **Cloud Integration**: Remote monitoring capabilities
- **Machine Learning**: Improved detection accuracy
- **Multi-user Support**: Multiple simultaneous users
- **Data Analytics**: Historical drowsiness patterns
- **Integration**: Connect with vehicle systems

## 📝 License

This project is for educational and research purposes.

## 👥 Contributing

Feel free to submit issues and enhancement requests!

---

**⚠️ Safety Notice**: This system is designed for educational purposes. Always prioritize safe driving practices and never rely solely on automated systems while driving. 