# Real-Time Drowsiness Detection System

A computer vision-based safety system that monitors driver alertness in real-time and triggers audio alerts when signs of drowsiness are detected. Built using Python, OpenCV, and dlib facial landmark detection.

## Overview

Driver drowsiness is a major cause of road accidents worldwide. According to the National Highway Traffic Safety Administration, approximately 100,000 police-reported crashes involve drowsy driving annually, resulting in over 1,550 fatalities and 71,000 injuries. This project aims to prevent such accidents by continuously monitoring the driver's facial features and alerting them when drowsiness is detected.

## Key Features

- **Real-Time Detection**: Monitors driver alertness through live webcam feed
- **Facial Landmark Analysis**: Uses 68-point facial landmark detection for accurate eye and mouth tracking
- **Eye Aspect Ratio (EAR) Algorithm**: Calculates eye closure duration to detect drowsiness
- **Audio Alert System**: Triggers alarm when prolonged eye closure is detected
- **Multi-Condition Testing**: Tested under various lighting conditions and driver positions
- **Spectacles Compatible**: Works effectively even when driver wears glasses

## Technologies Used

- **OpenCV**: Computer vision library for real-time image processing
- **dlib**: Machine learning library for facial landmark detection
- **imutils**: Helper functions for OpenCV operations
- **NumPy**: Numerical computing for array operations
- **scikit-learn**: Machine learning utilities
- **Python 3.x**: Core programming language

## How It Works

### Detection Pipeline

1. **Face Detection**: Captures video stream and detects driver's face using Haar Cascade classifier
2. **Eye Region Extraction**: Identifies and crops eye regions from the detected face
3. **Facial Landmark Detection**: Uses dlib's 68-point facial landmark predictor to locate eyes precisely
4. **EAR Calculation**: Computes Eye Aspect Ratio to determine if eyes are open or closed
5. **Drowsiness Detection**: Monitors consecutive frames with closed eyes (threshold: 5 frames)
6. **Alert Trigger**: Sounds alarm when drowsiness is detected

### Eye Aspect Ratio (EAR) Formula

The system uses the following algorithm to detect eye closure:

```
EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
```

Where p1-p6 are the 6 facial landmark points around each eye. When EAR falls below a threshold for consecutive frames, drowsiness is detected.

## Installation

### Prerequisites

- Python 3.7 or higher
- CMake (for dlib installation)
- Webcam

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/HassanRasheed91/Drowsiness-Detection-System.git
cd Drowsiness-Detection-System
```

2. **Create virtual environment (Optional but recommended)**
```bash
# Windows
python -m venv drowsiness_env
drowsiness_env\Scripts\activate

# Linux/Mac
python3 -m venv drowsiness_env
source drowsiness_env/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Install dlib**

**For Windows:**
```bash
pip install cmake
pip install dlib
```

**For Linux/Mac:**
Follow the [dlib installation guide](https://gist.github.com/ageitgey/629d75c1baac34dfa5ca2a1928a7aeaf)

## Usage

Run the drowsiness detection system:

```bash
python Real-Time-Drowsiness-Detection-System.py --shape-predictor shape_predictor_68_face_landmarks.dat --alarm Alert.wav
```

### Command Line Arguments

- `--shape-predictor`: Path to dlib's facial landmark predictor model
- `--alarm`: Path to alarm sound file (WAV format)

### During Execution

- The system will activate your webcam
- Position yourself so your face is clearly visible
- The system will monitor your eyes continuously
- If drowsiness is detected, an alarm will sound
- Press 'q' to quit the application

## Testing Results

The system has been extensively tested under various conditions:

### Test Scenarios

1. **Different Lighting Conditions**
   - Ambient lighting: Face and eyes successfully detected
   - Low light: Detection accuracy maintained
   - Bright light: Positive results unless direct light on camera

2. **Driver Position Variations**
   - Center position: Full detection successful
   - Right position: Face, eyes, and drowsiness detected
   - Left position: All features detected accurately

3. **Spectacles/Glasses**
   - Successfully detects drowsiness even with eyewear

4. **Head Tilt Limitations**
   - Works within ±30 degrees from vertical plane
   - Detection may fail beyond 30-degree tilt

### Performance Metrics

- **Detection Accuracy**: High accuracy in standard conditions
- **False Positive Rate**: Low with proper threshold tuning
- **Processing Speed**: Real-time processing at 30+ FPS
- **Robustness**: Effective across different face positions and lighting

## Project Structure

```
Drowsiness-Detection-System/
├── Real-Time-Drowsiness-Detection-System.py    # Main application
├── shape_predictor_68_face_landmarks.dat       # Facial landmark model
├── Alert.wav                                    # Alarm sound file
├── requirements.txt                             # Python dependencies
├── README.md                                    # Project documentation
└── haarcascades/                               # Cascade classifiers
    ├── haarcascade_frontalface_default.xml
    └── haarcascade_eye.xml
```

## Algorithm Details

### Face Detection
- Uses Haar Cascade classifier for initial face detection
- Crops region of interest (ROI) containing only the face

### Eye Detection
- Applies Haar Cascade eye detector on face ROI
- Extracts individual left and right eye regions

### Drowsiness Detection Logic
- Calculates Eye Aspect Ratio (EAR) for each frame
- Tracks consecutive frames with EAR below threshold
- Triggers alarm after 5 consecutive low-EAR frames
- Resets counter when eyes reopen

## Future Enhancements

- **Mobile Application**: Deploy as Android/iOS app for smartphone use
- **Dashboard Camera Integration**: Mount on car visor for real-world deployment
- **Multiple Alert Modes**: Vibration, visual warnings, voice alerts
- **Cloud Connectivity**: Send alerts to emergency contacts
- **Yawn Detection**: Additional drowsiness indicator
- **Head Pose Estimation**: Detect distraction and head nodding
- **Driver Identification**: Personalized drowsiness profiles

## Limitations

- Requires adequate lighting conditions
- May fail with extreme head tilts (>30 degrees)
- Direct light on camera can affect detection
- Requires clear view of driver's face
- Performance depends on webcam quality

## Research References

### IEEE Papers

1. Manu B.N. (2016). "Facial Features Monitoring for Real Time Drowsiness Detection." 12th International Conference on Innovations in Information Technology (IIT), pp. 78-81. [Link](https://ieeexplore.ieee.org/document/7880030)

2. Amna Rahman (2015). "Real Time Drowsiness Detection using Eye Blink Monitoring." National Software Engineering Conference (NSEC 2015). [Link](https://ieeexplore.ieee.org/document/7396336)

### Technical Resources

- [OpenCV Face Detection Tutorial](https://docs.opencv.org/3.4/d7/d8b/tutorial_py_face_detection.html)
- [Facial Landmarks with dlib](https://www.pyimagesearch.com/2017/04/03/facial-landmarks-dlib-opencv)
- [Eye Detection with OpenCV](https://www.pyimagesearch.com/2017/04/10/detect-eyes-nose-lips-jaw-dlib-opencv)
- [Training Better Haar Cascade](https://www.learnopencv.com/training-better-haar-lbp-cascade-eye-detector-opencv/)

## Requirements

```
opencv-python>=4.5.0
dlib>=19.22.0
imutils>=0.5.4
numpy>=1.21.0
scikit-learn>=0.24.0
scipy>=1.7.0
```

## Safety Note

This system is designed as a supplementary safety tool and should NOT be relied upon as the sole method for preventing drowsy driving. Drivers should:

- Get adequate sleep before driving
- Take regular breaks on long journeys
- Pull over if feeling drowsy
- Never solely depend on technology for alertness

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the MIT License.

## Contact

**Hassan Rasheed**
- Email: 221980038@gift.edu.pk
- LinkedIn: [hassan-rasheed-datascience](https://linkedin.com/in/hassan-rasheed-datascience)
- GitHub: [HassanRasheed91](https://github.com/HassanRasheed91)

## Acknowledgments

- Original implementation inspiration from various computer vision research papers
- dlib library for facial landmark detection
- OpenCV community for comprehensive documentation
- NHTSA for drowsy driving statistics

---

**Note**: This project is for educational and research purposes. Always prioritize proper rest and safe driving practices.
