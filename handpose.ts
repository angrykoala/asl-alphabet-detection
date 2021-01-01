import { Finger } from "./finger";
import { FingerIndex, Hand, HandVector } from "./hand";
import { Orientation } from "./types";


export type ContactType = "none" | "base" | "tip" | "any";
export type FingerContact = [[FingerIndex, ContactType], [FingerIndex, ContactType]]
// WIP: not working (yet)
export type HandposeOptions = {
    hand: {
        orientation?: Orientation
    },
    fingers: HandVector<{
        orientation?: Orientation,
        extended?: boolean
    } | null | undefined>
    contacts: Array<FingerContact>
}

export class Handpose {
    private options: HandposeOptions;

    constructor(options: HandposeOptions) {
        this.options = options;
    }

    public isPose(hand: Hand): boolean {
        if (!this.checkExpectation(hand.orientation, this.options.hand.orientation)) return false;

        // VALIDATE FINGERS
        for (let i = 0; i < this.options.fingers.length; i++) {
            const finger = hand.getFinger(i + 1 as FingerIndex);
            const expectation = this.options.fingers[i];
            if(!expectation) continue;

            if (
                !this.checkExpectation(finger.orientation, expectation.orientation) ||
                !this.checkExpectation(finger.isExtended, expectation.extended)
            ) {
                return false;
            }

        }

        for (const contact of this.options.contacts) {
            if (!this.validateContact(hand, contact)) return false;
        }
        return true;
    }

    private checkExpectation<T>(value: T, expectation?: T): boolean {
        if (expectation === undefined) return true;
        else return value === expectation;
    }

    private validateContact(hand: Hand, expectation: FingerContact): boolean {
        const contactA = expectation[0];
        const contactB = expectation[0];
        if (contactA[0] === contactB[0]) throw new Error("Invalid handpose contact (same finger)");
        if (contactA[1] === "base" && contactB[1] === "base") throw new Error("Invalid handpose contact (base to base)");


        const fingerA = hand.getFinger(contactA[0]);
        const fingerB = hand.getFinger(contactB[0]);

        const contactTypeA = contactA[1]
        const contactTypeB = contactB[1]

        if (contactTypeA === "none" || contactTypeB === "none") {
            return !fingerA.isInContactWith(fingerB)
        }

        if (contactTypeA === "tip") {
            return this.validateTipContact(fingerA, fingerB, contactTypeB);
        } else if (contactTypeB === "tip") {
            return this.validateTipContact(fingerB, fingerA, contactTypeA);
        }

        if (contactTypeA === "any" || contactTypeB === "any") {
            if (contactTypeA !== "any" || contactTypeB !== "any") throw new Error("Invalid contact with any");
            return fingerA.isInContactWith(fingerB);
        }

        throw new Error("Invalid Contact! (no contact found)");
    }

    private validateTipContact(tipFinger: Finger, otherFinger: Finger, contactType: ContactType): boolean {
        switch (contactType) {
            case "any":
                return tipFinger.isTouching(otherFinger);
            case "base":
                return tipFinger.isTouchingBase(otherFinger);
            case "tip":
                return tipFinger.isTouchingTip(otherFinger);
            default:
                throw new Error("Invalid tip contact")
        }
    }
}
