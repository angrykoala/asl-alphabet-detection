import { Finger } from "./finger";
import { getFingerMatrix } from "./finger_matrix";
import { Hand } from "./hand";
import { HandPrediction } from "./types";
import { areTouching, tableify } from "./utils";

const handposePromise = (window as any).handpose.load({
}) as Promise<any>;

handposePromise.then(() => {
    console.log("handpose ready");
});

async function getPrediction(element: HTMLElement): Promise<HandPrediction | undefined> {
    const model = await handposePromise;
    const predictions = await model.estimateHands(element, {
        flipHorizontal: true // For mirrored videos
    });
    return predictions[0] as Promise<HandPrediction>;
}

async function getHandposeMain(): Promise<void> {
    await getHandpose();
    setTimeout(() => {
        getHandposeMain();
    }, 500);
}
(window as any).getHandposeMain = getHandposeMain;

async function getHandpose(): Promise<void> {
    const movieElement = document.getElementById("movie");
    const infoElement = document.getElementById("info");
    if (!movieElement || !infoElement) throw new Error("Element not found");
    const prediction = await getPrediction(movieElement);
    if (!prediction) return console.log("No Hands Detected");

    const hand = new Hand(prediction);
    const handData = [["Size", "Orientation"], [hand.size, hand.orientation]];

    const titles = ["-", "Length", "Relative Length", "Extended", "Orientation"];
    const proximityMatrix = getFingerMatrix(prediction.annotations, 40);
    const fingersData = hand.fingers.map(getFingerData);

    const letterMethods = [isA, isB, isC, isD, isE, isF, isG, isH, isI, isJ, isK];

    const lettersTable = [["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"], letterMethods.map((method) => method(hand))];

    infoElement.innerHTML = tableify([titles, ...fingersData]) + tableify(handData) + tableify(proximityMatrix) + tableify(lettersTable);
}

function isA(hand: Hand): boolean {
    const areOtherFingersClosed = hand.map([1, 2, 3, 4], (f) => !f.isExtended);
    const thumb = hand.getFinger(5);

    const thumbNotTouchingOtherFingers = hand.map([1, 2, 3, 4], (finger) => !thumb.isTouchingTip(finger));
    const fingersNotTouchingThumb = hand.map([2, 3, 4], (finger) => !finger.isTouching(thumb));
    if (!areOtherFingersClosed || !thumb.isExtended || !thumbNotTouchingOtherFingers || !fingersNotTouchingThumb) return false;
    else return true;
}

function isB(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    const otherFingersExtended = hand.map([1, 2, 3, 4], (f) => f.isExtended);
    const thumbNotTouchingTips = hand.map([1, 2, 3, 4], (f) => !thumb.isTouchingTip(f));

    const thumbTouchingBase = thumb.isTouchingBase(hand.getFinger(3)) || thumb.isTouchingBase(hand.getFinger(4));
    const fingersNotTouchingThumb = hand.map([1, 2, 3, 4], (finger) => !finger.isTouching(thumb));

    return otherFingersExtended &&
        thumbNotTouchingTips &&
        thumbTouchingBase &&
        fingersNotTouchingThumb;
}

function isC(hand: Hand): boolean {
    // TODO: improve isC
    const thumb = hand.getFinger(5);
    const thumbNotTouchingOtherFingers = hand.map([1, 2, 3, 4], (finger) => !thumb.isTouching(finger));
    const noFingerTouchingItsBase = hand.map([1, 2, 3, 4], (finger) => !finger.isTouchingBase(finger));

    return thumbNotTouchingOtherFingers && noFingerTouchingItsBase;
}

function isD(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    const isIndexExtended = hand.getFinger(1).isExtended;
    const thumbTouchingMiddleFingers = hand.map([2, 3], (finger) => thumb.isTouching(finger));
    const fingersNotExtended = hand.map([2, 3, 4], (finger) => !finger.isExtended);

    return isIndexExtended
        && thumbTouchingMiddleFingers
        && fingersNotExtended;
}

function isE(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    // TODO: index not extended
    const fingersClosed = hand.map([1, 2, 3, 4], (finger) => !finger.isExtended);
    const fingersTouchThumb = hand.map([2, 3, 4], (finger) => finger.isTouching(thumb));

    const isThumbTouchingRequiredFingers = thumb.isTouchingTip(hand.getFinger(3)) || thumb.isTouchingTip(hand.getFinger(4));
    return fingersClosed && fingersTouchThumb && isThumbTouchingRequiredFingers;
}

function isF(hand: Hand): boolean {
    const thumbAndIndex = hand.getFinger(5).isTouchingTip(hand.getFinger(1));
    const fingersExtended = hand.map([2, 3, 4], (finger) => finger.isExtended);

    return thumbAndIndex && fingersExtended;
}

function isG(hand: Hand): boolean {
    const indexExtended = hand.getFinger(1).isExtended;
    const thumbExtended = hand.getFinger(5).isExtended;
    const otherClosed = hand.map([2, 3, 4], (f) => !f.isExtended);
    const horizontalFingers = hand.map([1, 5], (f) => f.orientation === 'x');

    return indexExtended && thumbExtended && otherClosed && horizontalFingers;
}

function isH(hand: Hand): boolean {
    const extendedFingers = hand.map([1, 2], (f) => f.isExtended);
    const notExtendedFingers = hand.map([3, 4], (f) => !f.isExtended);
    const horizontalFingers = hand.map([1, 2], (f) => f.orientation === 'x');

    return extendedFingers && notExtendedFingers && horizontalFingers;
}

function isI(hand: Hand): boolean {
    const pinky = hand.getFinger(4);
    const isPinkyInPosition = pinky.isExtended && pinky.orientation === 'y';
    const fingersClosed = hand.map([1, 2, 3], (f) => !f.isExtended);
    return isPinkyInPosition && fingersClosed;
}

function isJ(hand: Hand): boolean {
    // TODO: take movement into account
    const pinky = hand.getFinger(4);
    const isPinkyInHorizontalPosition = pinky.isExtended && pinky.orientation === 'x';
    const fingersClosed = hand.map([1, 2, 3], (f) => !f.isExtended);
    return isPinkyInHorizontalPosition && fingersClosed;
}

function isK(hand: Hand): boolean {
    // TODO
    const thumb = hand.getFinger(5);
    const thumbPoint = thumb.landmarks[2]; // previous from the tip
    const fingersExtended = hand.map([1, 2, 5], (f) => f.isExtended);
    const thumbTouching = hand.map([1, 2], f => areTouching(thumbPoint, f.fingerBase));
    return fingersExtended && thumbTouching;
}

// For testing purposes
function getFingerData(finger: Finger): Array<string | number | boolean> {
    return [finger.name, finger.length, finger.relativeLength, finger.isExtended, finger.orientation];
}
