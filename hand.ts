import { Finger } from "./finger";
import { FingerLandmarks, HandPrediction, Orientation } from "./types";
import { getDistance, getOrientation } from "./utils";

export type HandFingers = HandVector<Finger>;
export type HandVector<T> = [T, T, T, T, T]; // Defines an array with values for each finger

export type FingerIndex = 1 | 2 | 3 | 4 | 5;

export class Hand {
    public readonly size: number;
    public readonly fingers: HandFingers;
    public readonly orientation: Orientation;

    constructor(prediction: HandPrediction) {
        this.size = getDistance(prediction.boundingBox.bottomRight, prediction.boundingBox.topLeft);
        this.fingers = this.createFingers(prediction);
        this.orientation = this.calculateOrientation();
    }

    // Returns finger from 1 to 5 (1 being the index and 5 the thumb)
    public getFinger(index: FingerIndex): Finger {
        return this.fingers[index - 1];
    }

    // Validates a condition against all fingers in the mask, returns true if all fingers fullfill the condition
    public map(mask: Array<FingerIndex>, condition: (f: Finger) => boolean): boolean {
        for (let i = 1; i < 5; i++) {
            if (mask.includes(i as FingerIndex)) {
                if (!condition(this.getFinger(i as FingerIndex))) return false;
            }
        }
        return true;
    }

    private createFingers(prediction: HandPrediction): HandFingers {
        const annotations = prediction.annotations;
        const fingersDate: HandVector<[string, number, FingerLandmarks, boolean?]> = [
            ["Index", 0.14, annotations.indexFinger],
            ["Middle", 0.15, annotations.middleFinger],
            ["Ring", 0.15, annotations.ringFinger],
            ["Pinky", 0.13, annotations.pinky],
            ["Thumb", 0.1, annotations.thumb, true]
        ];

        return fingersDate.map(([name, relativeSize, landmarks, isThumb = false]) => {
            return new Finger(name, landmarks, {
                handSize: this.size,
                handRelation: relativeSize,
                isThumb
            });
        }) as HandFingers;
    }

    private calculateOrientation(): Orientation {
        const index = this.getFinger(1);
        const pinky = this.getFinger(4);
        return getOrientation(index.fingerBase, pinky.fingerBase);
    }
}
