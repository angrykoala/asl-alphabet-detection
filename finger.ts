import { FingerLandmarks, Orientation, Vector3 } from "./types";
import { areAligned, areTouching, getDistance, getOrientation } from "./utils";

export class Finger {
    public readonly name;
    public readonly landmarks: FingerLandmarks;
    public readonly length: number;
    public readonly relativeLength: number;
    public readonly isExtended: boolean;
    public readonly orientation: Orientation;

    private isThumb: boolean;

    constructor(name: string, landmarks: FingerLandmarks, options: { handSize: number, handRelation: number, isThumb?: boolean }) {
        this.name = name;
        this.landmarks = landmarks;
        this.isThumb = options.isThumb || false;

        this.length = this.fingerLength();
        this.relativeLength = this.length / options.handSize;
        this.isExtended = this.calculateIfExtended(options.handRelation);
        this.orientation = this.calculateOrientation();
    }

    public get fingerTip(): Vector3 {
        return this.landmarks[3];
    }

    public get fingerBase(): Vector3 {
        return this.isThumb ? this.landmarks[1] : this.landmarks[0];
    }

    public isTouching(otherFinger: Finger): boolean {
        const tip = this.fingerTip;
        for (const v of otherFinger.landmarks) {
            if (areTouching(tip, v)) return true;
        }
        return false;
    }

    public isTouchingTip(otherFinger: Finger): boolean {
        return areTouching(this.fingerTip, otherFinger.fingerTip);
    }

    public isTouchingBase(otherFinger: Finger): boolean {
        return areTouching(this.fingerTip, otherFinger.fingerBase);
    }

    private fingerLength(): number {
        return getDistance(this.fingerBase, this.fingerTip);
    }

    private calculateIfExtended(handRelation: number): boolean {
        const extended = this.relativeLength > handRelation;
        const aligned = areAligned([this.landmarks[1], this.landmarks[2], this.landmarks[3]]);
        return extended && aligned;
    }

    private calculateOrientation(): Orientation {
        return getOrientation(this.fingerTip, this.fingerBase);
    }
}
