// VECTOR3: x,y,z
export type Vector3 = [number, number, number];

export type Vector2 = [number, number];

export type FingerLandmarks = [Vector3, Vector3, Vector3, Vector3]; // From base to tip

export type HandPrediction = {
    annotations: {
        thumb: FingerLandmarks,
        indexFinger: FingerLandmarks,
        middleFinger: FingerLandmarks,
        ringFinger: FingerLandmarks,
        pinky: FingerLandmarks,
        palmBase: [Vector3]
    },
    boundingBox: {
        topLeft: Vector2,
        bottomRight: Vector2
    },
    handInViewConfidence: number,
    landmarks: Array<Vector3>, // 21 landmarks (https://handsondeeplearning.com/wp-content/uploads/2020/05/Hand-Image_with-annotated-points-1.png)
};
