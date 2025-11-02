# Real-Time Drowsiness Detection System

A computer vision-based driver safety system that monitors alertness in real-time and triggers audio alerts when signs of drowsiness are detected. Built using Python, OpenCV, and dlib facial landmark detection.

## Overview

Driver drowsiness is a major cause of road accidents worldwide. According to the National Highway Traffic Safety Administration, approximately 100,000 police-reported crashes involve drowsy driving annually, resulting in over 1,550 fatalities and 71,000 injuries. This system aims to prevent such accidents by continuously monitoring the driver's facial features and alerting them when drowsiness is detected.

## Key Features

- **Real-Time Monitoring**: Continuous driver alertness detection through webcam feed
- **Facial Landmark Analysis**: 68-point facial landmark detection for precise eye tracking
- **Eye Aspect Ratio (EAR) Algorithm**: Calculates eye closure duration to identify drowsiness
- **Intelligent Alert System**: Audio alarm triggers when prolonged eye closure is detected
- **Robust Detection**: Works under various lighting conditions and driver positions
- **Eyewear Compatible**: Effective detection even when driver wears glasses
- **Frame-Based Analysis**: Analyzes consecutive frames to reduce false positives

## Technologies & Libraries

- **OpenCV**: Real-time computer vision and image processing
- **dlib**: State-of-the-art facial landmark detection and machine learning
- **imutils**: Convenience functions for OpenCV operations
- **NumPy**: Numerical computing and array operations
- **Python 3.x**: Core programming language

## System Architecture

### Detection Pipeline

1. **Video Capture**: Captures live video stream from webcam
2. **Face Detection**: Detects driver's face using Haar Cascade classifier
3. **Eye Region Localization**: Identifies and extracts eye regions from face
4. **Facial Landmark Detection**: Applies dlib's 68-point predictor to locate eye landmarks
5. **EAR Computation**: Calculates Eye Aspect Ratio for each frame
6. **Drowsiness Classification**: Monitors consecutive frames with closed eyes
7. **Alert Activation**: Triggers audio alarm when drowsiness threshold is exceeded

### Eye Aspect Ratio (EAR) Algorithm

The system calculates Eye Aspect Ratio using facial landmark coordinates:

```
EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
```

Where:
- p1-p6 represent the 6 facial landmarks around each eye
- Vertical eye landmarks (p2, p3, p5, p6) detect eye opening
- Horizontal eye landmarks (p1, p4) normalize the measurement

**Detection Logic:**
- EAR decreases significantly when eyes are closed
- System tracks consecutive frames with low EAR values
- Alert triggers after 5+ consecutive frames below threshold
- Counter resets when eyes reopen

## Installation

### Prerequisites

- Python 3.7 or higher
- Webcam (built-in or external)
- CMake (for dlib installation)

### Setup Instructions

**1. Clone the repository**
```bash
git clone https://github.com/HassanRasheed91/Drowsiness-Detection-System.git
cd Drowsiness-Detection-System
```

**2. Create virtual environment (Recommended)**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Install dlib**

**Windows:**
```bash
pip install cmake
pip install dlib
```

**Linux/Mac:**
```bash
# Install system dependencies first
sudo apt-get install build-essential cmake
sudo apt-get install libopenblas-dev liblapack-dev
sudo apt-get install libx11-dev libgtk-3-dev

# Install dlib
pip install dlib
```

For detailed dlib installation, refer to [official guide](https://gist.github.com/ageitgey/629d75c1baac34dfa5ca2a1928a7aeaf)

## Usage

### Running the System

```bash
python drowsiness_detection.py --shape-predictor shape_predictor_68_face_landmarks.dat --alarm alert.wav
```

### Command Line Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `--shape-predictor` | Path to dlib's facial landmark model | Yes |
| `--alarm` | Path to alarm audio file (WAV format) | Yes |

### Operation Guide

1. **Start the application** using the command above
2. **Position yourself** so your face is clearly visible to the webcam
3. **Ensure proper lighting** for optimal detection
4. **System monitors continuously** - green indicators show active detection
5. **Alarm triggers** when drowsiness is detected
6. **Press 'q'** to quit the application

## Testing & Validation

The system has been rigorously tested across multiple scenarios:

### Test Scenarios

#### 1. Lighting Conditions
- ✅ **Ambient Light**: Full detection accuracy with standard room lighting
- ✅ **Low Light**: Maintained detection with reduced but sufficient lighting
- ✅ **Bright Light**: Successful detection unless direct light on camera lens

#### 2. Driver Position Variations
- ✅ **Center Position**: Optimal detection - face, eyes, and drowsiness detected
- ✅ **Right Position**: Maintained accuracy with right-positioned face
- ✅ **Left Position**: Successful detection with left-positioned face
- ⚠️ **Extreme Angles**: Limited detection beyond ±30° from vertical

#### 3. Eyewear Testing
- ✅ **With Glasses**: Full functionality maintained with prescription glasses
- ✅ **Sunglasses**: Detection possible depending on lens opacity

#### 4. Head Orientation
- ✅ **Normal Posture**: Full detection capability
- ✅ **Slight Tilt**: Effective within ±30° from vertical plane
- ❌ **Extreme Tilt**: Detection may fail beyond 30° head tilt

### Performance Metrics

- **Detection Rate**: High accuracy in standard conditions
- **Frame Rate**: Real-time processing at 25-30 FPS
- **Response Time**: Immediate alert upon drowsiness detection
- **False Positive Rate**: Minimized through consecutive frame analysis

## Project Structure

```
Drowsiness-Detection-System/
│
├── drowsiness_detection.py                 # Main application script
├── shape_predictor_68_face_landmarks.dat   # dlib facial landmark model
├── alert.wav                                # Alarm audio file
├── requirements.txt                         # Python dependencies
├── README.md                                # Project documentation
│
├── haarcascades/                           # Haar Cascade classifiers
│   ├── haarcascade_frontalface_default.xml
│   └── haarcascade_eye.xml
│
└── utils/                                  # Helper utilities (optional)
    └── helpers.py
```

## Technical Implementation

### Face Detection Module
- Employs Haar Cascade classifier for rapid face detection
- Processes each frame to identify facial region
- Extracts Region of Interest (ROI) for further analysis

### Eye Detection Module
- Applies Haar Cascade eye detector on facial ROI
- Isolates individual left and right eye regions
- Provides coordinates for landmark detection

### Drowsiness Detection Logic
```python
# Simplified detection logic
for each frame:
    1. Detect face
    2. Locate eyes using facial landmarks
    3. Calculate EAR for both eyes
    4. Average the EAR values
    5. If EAR < THRESHOLD:
        - Increment counter
        - If counter >= 5 consecutive frames:
            - Trigger alarm
            - Display drowsiness warning
    6. Else:
        - Reset counter
```

## Configuration Parameters

Key parameters that can be tuned for optimal performance:

```python
EYE_AR_THRESH = 0.25        # Eye Aspect Ratio threshold
EYE_AR_CONSEC_FRAMES = 5    # Consecutive frames for drowsiness
ALARM_DURATION = 2.0        # Alarm sound duration (seconds)
```

## Requirements

```txt
opencv-python>=4.5.0
dlib>=19.22.0
imutils>=0.5.4
numpy>=1.21.0
scipy>=1.7.0
```

## Future Enhancements

### Planned Features
- **Mobile Application**: Deploy as smartphone app for broader accessibility
- **Dashboard Integration**: Mount on vehicle dashboard for real-world deployment
- **Multi-Modal Alerts**: Vibration, visual warnings, and voice notifications
- **Yawn Detection**: Additional drowsiness indicator through mouth analysis
- **Head Pose Estimation**: Detect distraction and head nodding
- **Cloud Connectivity**: Send alerts to emergency contacts or fleet managers
- **Driver Profile System**: Personalized drowsiness thresholds per driver
- **Analytics Dashboard**: Track drowsiness patterns and driving habits

### Potential Improvements
- Deep learning-based eye detection for improved accuracy
- Multi-face detection for passenger monitoring
- Night vision camera support
- Integration with vehicle systems (CAN bus)
- GPS-based alerting to nearby rest areas

## Limitations & Considerations

### Current Limitations
- Requires adequate ambient lighting for optimal performance
- Performance degrades with extreme head tilts (>30°)
- Direct light source on camera lens affects detection
- Requires unobstructed view of driver's face
- Dependent on webcam quality and frame rate

### Safety Considerations
This system is designed as a **supplementary safety tool** and should NOT replace:
- Adequate sleep before driving
- Regular breaks during long journeys
- Proper rest when feeling tired
- Responsible driving practices

**Never rely solely on technology for driver alertness!**

## Research & References

### Academic Papers

1. Manu B.N. (2016). "Facial Features Monitoring for Real Time Drowsiness Detection." 12th International Conference on Innovations in Information Technology (IIT), pp. 78-81.

2. Amna Rahman (2015). "Real Time Drowsiness Detection using Eye Blink Monitoring." National Software Engineering Conference (NSEC 2015).

### Technical Resources

- [OpenCV Documentation - Face Detection](https://docs.opencv.org/3.4/d7/d8b/tutorial_py_face_detection.html)
- [dlib Facial Landmarks Guide](http://dlib.net/face_landmark_detection.py.html)
- [Eye Aspect Ratio for Drowsiness Detection](https://www.pyimagesearch.com/2017/05/08/drowsiness-detection-opencv/)

## Troubleshooting

### Common Issues

**Issue: Camera not detected**
```bash
# Check camera availability
ls /dev/video*  # Linux
# Or use Device Manager on Windows
```

**Issue: dlib installation fails**
```bash
# Install build tools first
pip install cmake
# Then retry dlib installation
```

**Issue: False alarms**
```python
# Adjust EYE_AR_THRESH in code
# Increase CONSEC_FRAMES threshold
```

**Issue: Missed detections**
```python
# Decrease EYE_AR_THRESH
# Improve lighting conditions
```

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Author

**Hassan Rasheed**

Machine Learning Engineer | Computer Vision Specialist

- 📧 Email: 221980038@gift.edu.pk
- 💼 LinkedIn: [hassan-rasheed-datascience](https://linkedin.com/in/hassan-rasheed-datascience)
- 🐙 GitHub: [HassanRasheed91](https://github.com/HassanRasheed91)
- 📊 Portfolio: [View Portfolio](https://portfolio-hassanrasheed91.vercel.app)

### About the Developer

Data Science student at Gift University with expertise in machine learning, deep learning, and computer vision. Passionate about developing AI-powered solutions for real-world safety and healthcare applications.

## Acknowledgments

- OpenCV community for comprehensive computer vision tools
- dlib library for robust facial landmark detection
- National Highway Traffic Safety Administration for drowsy driving statistics
- Computer vision research community for algorithmic insights

---

**⚠️ Disclaimer**: This project is developed for educational and research purposes. It serves as a supplementary safety tool and should not be considered a replacement for proper rest and safe driving practices. Always prioritize adequate sleep and take breaks during long drives.

**© 2024 Hassan Rasheed. All Rights Reserved.**
