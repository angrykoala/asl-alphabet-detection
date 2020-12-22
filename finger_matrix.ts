import { FingerLandmarks, HandPrediction, Vector3 } from "./types";
import { TableData } from "./utils";
import * as math from "mathjs";

// This method generates a generic matrix with finger contact data. For testing purposes only!
export function getFingerMatrix(prediction: HandPrediction["annotations"], threshold: number): TableData {
    const names = ["Index", "Middle", "Ring", "Pinky", "Thumb"];
    const fingers = [prediction.indexFinger, prediction.middleFinger, prediction.ringFinger, prediction.pinky, prediction.thumb];
    return [["-", ...names], ...fingers.map((f, i) => {
        return [names[i], ...fingers.map((f2, j) => {
            if (i === j) return "-";
            return areTouching(last(f), last(f2), threshold);
        })];
    }), [
        "ThumbWithFingerBase",
        ...fingers.map((f, i) => {
            if (i === 4) return "-";
            return isTouchingFingerBase(last(prediction.thumb), f);
        })
    ], [
        "FingerTipWithThumb",
        ...fingers.map((f, i) => {
            if (i === 4) return "-";
            return isTouchAnyFingerPoint(last(f), prediction.thumb);
        })
    ], [
        "FingerOwnBase",
        ...fingers.map((f) => {
            return isTouchingFingerBase(last(f), f);
        })
    ]];
}

function last<T>(arr: Array<T>): T {
    return arr[arr.length - 1];
}

function isTouchingFingerBase(v1: Vector3, finger: FingerLandmarks): boolean {
    return areTouching(v1, finger[0]); // TODO: [1] if thumb
}

function isTouchAnyFingerPoint(v1: Vector3, finger: FingerLandmarks): boolean {
    for (const v of finger) {
        if (areTouching(v1, v)) return true;
    }
    return false;
}

function areTouching(v1: Vector3, v2: Vector3, errorRange: number = 40): boolean {
    return math.distance(v1, v2) < errorRange;
}
