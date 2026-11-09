"""
MediaPipe FaceMesh landmark index constants.

Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
Using the 468-point model + 10 iris points (with refine_landmarks=True → 478 total).
"""

# ---------------------------------------------------------------------------
# Eye Aspect Ratio (EAR) landmark indices
# EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
# ---------------------------------------------------------------------------
LEFT_EYE_EAR = [33, 160, 158, 133, 153, 144]   # p1..p6
RIGHT_EYE_EAR = [362, 385, 387, 263, 373, 380]  # p1..p6

# ---------------------------------------------------------------------------
# Iris centers (only available when refine_landmarks=True)
# Indices 468-477 are the 10 iris landmarks (5 per eye)
# ---------------------------------------------------------------------------
LEFT_IRIS_CENTER = 468
RIGHT_IRIS_CENTER = 473

# ---------------------------------------------------------------------------
# Head Pose (PnP) anchor landmarks → 3D canonical model correspondences (mm)
# ---------------------------------------------------------------------------
HEAD_POSE_LANDMARKS = [1, 199, 33, 263, 61, 291]  # nose tip, chin, L/R eye outer, L/R mouth

# Corresponding 3D world points for cv2.solvePnP (in mm, face-centered)
HEAD_POSE_3D_POINTS = [
    [0.0,     0.0,    0.0],     # Nose tip
    [0.0,   -63.6,  -12.5],    # Chin
    [-43.3,  32.7,  -26.0],    # Left eye outer corner
    [ 43.3,  32.7,  -26.0],    # Right eye outer corner
    [-28.9, -28.9,  -24.1],    # Left mouth corner
    [ 28.9, -28.9,  -24.1],    # Right mouth corner
]

# ---------------------------------------------------------------------------
# Emotion / expression geometry landmarks
# ---------------------------------------------------------------------------

# Mouth
MOUTH_LEFT_CORNER = 61
MOUTH_RIGHT_CORNER = 291
UPPER_LIP_CENTER = 13       # Inner upper lip
LOWER_LIP_CENTER = 14       # Inner lower lip
UPPER_LIP_TOP = 0           # Outer upper lip top
LOWER_LIP_BOTTOM = 17       # Outer lower lip bottom

# Eyebrows
LEFT_BROW_INNER = 55        # Inner corner of left eyebrow
LEFT_BROW_OUTER = 52        # Outer tip of left eyebrow
RIGHT_BROW_INNER = 285      # Inner corner of right eyebrow
RIGHT_BROW_OUTER = 282      # Outer tip of right eyebrow
LEFT_BROW_PEAK = 53         # Arch peak of left eyebrow
RIGHT_BROW_PEAK = 283       # Arch peak of right eyebrow

# Eye upper/lower lid midpoints (for brow-eye distance)
LEFT_EYE_UPPER = 159
LEFT_EYE_LOWER = 145
RIGHT_EYE_UPPER = 386
RIGHT_EYE_LOWER = 374

# Nose base
NOSE_BASE = 2

# Face width anchors (for normalization)
FACE_LEFT = 234
FACE_RIGHT = 454

# ---------------------------------------------------------------------------
# Region assignment for frontend LandmarkPoint.region
# Maps landmark index ranges → region string used in MeshCanvas
# ---------------------------------------------------------------------------

# Face oval contour landmark indices (from FACEMESH_FACE_OVAL)
FACE_OVAL_INDICES = {
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361,
    288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149,
    150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54,
    103, 67, 109
}

LEFT_EYE_INDICES = {
    33, 7, 163, 144, 145, 153, 154, 155, 133,
    246, 161, 160, 159, 158, 157, 173
}

RIGHT_EYE_INDICES = {
    362, 382, 381, 380, 374, 373, 390, 249, 263,
    466, 388, 387, 386, 385, 384, 398
}

LEFT_IRIS_INDICES = {468, 469, 470, 471, 472}
RIGHT_IRIS_INDICES = {473, 474, 475, 476, 477}

LIPS_INDICES = {
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409,
    291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
    78, 191, 80, 81, 82, 13, 312, 311, 310, 415,
    308, 324, 318, 402, 317, 14, 87, 178, 88, 95
}

NOSE_INDICES = {
    1, 2, 5, 4, 19, 94, 141, 370,
    129, 358, 209, 429, 49, 279, 64, 294,
    48, 278, 219, 439, 195, 197, 6, 168, 8, 9
}

LEFT_EYEBROW_INDICES = {46, 53, 52, 65, 55, 70, 63, 105, 66, 107, 336, 296}
RIGHT_EYEBROW_INDICES = {285, 295, 282, 283, 276, 300, 293, 334, 296, 336, 46, 53}


def get_landmark_region(idx: int) -> str:
    """Map a landmark index to its region string for the frontend."""
    if idx in LEFT_IRIS_INDICES:
        return "leftIris"
    if idx in RIGHT_IRIS_INDICES:
        return "rightIris"
    if idx in LEFT_EYE_INDICES:
        return "leftEye"
    if idx in RIGHT_EYE_INDICES:
        return "rightEye"
    if idx in LIPS_INDICES:
        return "lips"
    if idx in NOSE_INDICES:
        return "nose"
    if idx in LEFT_EYEBROW_INDICES or idx in RIGHT_EYEBROW_INDICES:
        return "eyebrows"
    if idx in FACE_OVAL_INDICES:
        return "contour"
    return "mesh"
