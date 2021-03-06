import { Finger } from "./finger";
import { getFingerMatrix } from "./finger_matrix";
import { Hand } from "./hand";
import { HandPrediction } from "./types";
import { tableify } from "./utils";

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
    const handData = [["Size", "Orientation", "orientationSign"], [hand.size, hand.orientation, hand.orientationSign]];

    const titles = ["-", "Length", "Relative Length", "Extended", "Orientation"];
    const proximityMatrix = getFingerMatrix(prediction.annotations, 40);
    const fingersData = hand.fingers.map(getFingerData);

    const letterMethods = [isA, isB, isC, isD, isE, isF, isG, isH, isI, isJ, isK, isL, isM, isN, isO, isP, isQ, isR, isS, isT, isU];

    const lettersTable = [["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"], letterMethods.map((method) => method(hand))];

    infoElement.innerHTML = tableify([titles, ...fingersData]) + tableify(handData) + tableify(proximityMatrix) + tableify(lettersTable);
}

function isA(hand: Hand): boolean {
    const thumb = hand.getFinger(5);

    const isHandOriented = hand.orientation === 'x';
    const areOtherFingersClosed = hand.mapAnd([1, 2, 3, 4], (f) => !f.isExtended);
    const thumbNotTouchingOtherFingers = hand.mapAnd([1, 2, 3, 4], (finger) => !thumb.isTouchingTip(finger));
    const fingersNotTouchingThumb = hand.mapAnd([2, 3, 4], (finger) => !finger.isTouching(thumb));
    if (!areOtherFingersClosed || !thumb.isExtended || !thumbNotTouchingOtherFingers || !fingersNotTouchingThumb || !isHandOriented) return false;
    else return true;
}

function isB(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    const otherFingersExtended = hand.mapAnd([1, 2, 3, 4], (f) => f.isExtended);
    const thumbNotTouchingTips = hand.mapAnd([1, 2, 3, 4], (f) => !thumb.isTouchingTip(f));

    const thumbTouchingBase = thumb.isTouchingBase(hand.getFinger(3)) || thumb.isTouchingBase(hand.getFinger(4));
    const fingersNotTouchingThumb = hand.mapAnd([1, 2, 3, 4], (finger) => !finger.isTouching(thumb));

    return otherFingersExtended &&
        thumbNotTouchingTips &&
        thumbTouchingBase &&
        fingersNotTouchingThumb;
}

function isC(hand: Hand): boolean {
    // TODO: improve isC
    const thumb = hand.getFinger(5);
    const thumbNotTouchingOtherFingers = hand.mapAnd([1, 2, 3, 4], (finger) => !thumb.isTouching(finger));
    const noFingerTouchingItsBase = hand.mapAnd([1, 2, 3, 4], (finger) => !finger.isTouchingBase(finger));

    return thumbNotTouchingOtherFingers && noFingerTouchingItsBase;
}

function isD(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    const isIndexExtended = hand.getFinger(1).isExtended;
    const thumbTouchingMiddleFingers = hand.mapAnd([2, 3], (finger) => thumb.isTouching(finger));
    const fingersNotExtended = hand.mapAnd([2, 3, 4], (finger) => !finger.isExtended);

    return isIndexExtended
        && thumbTouchingMiddleFingers
        && fingersNotExtended;
}

function isE(hand: Hand): boolean {
    // TODO: improve
    const thumb = hand.getFinger(5);
    // TODO: index not extended
    const fingersClosed = hand.mapAnd([1, 2, 3, 4], (finger) => !finger.isExtended);
    const fingersTouchThumb = hand.mapAnd([2, 3, 4], (finger) => finger.isTouching(thumb));

    const isThumbTouchingRequiredFingers = thumb.isTouchingTip(hand.getFinger(3)) || thumb.isTouchingTip(hand.getFinger(4));
    return fingersClosed && fingersTouchThumb && isThumbTouchingRequiredFingers;
}

function isF(hand: Hand): boolean {
    const thumbAndIndex = hand.getFinger(5).isTouchingTip(hand.getFinger(1));
    const fingersExtended = hand.mapAnd([2, 3, 4], (finger) => finger.isExtended);

    return thumbAndIndex && fingersExtended;
}

function isG(hand: Hand): boolean {
    const indexExtended = hand.getFinger(1).isExtended;
    const thumbExtended = hand.getFinger(5).isExtended;
    const otherClosed = hand.mapAnd([2, 3, 4], (f) => !f.isExtended);
    const horizontalFingers = hand.mapAnd([1, 5], (f) => f.orientation === 'x');

    return indexExtended && thumbExtended && otherClosed && horizontalFingers;
}

function isH(hand: Hand): boolean {
    const extendedFingers = hand.mapAnd([1, 2], (f) => f.isExtended);
    const notExtendedFingers = hand.mapAnd([3, 4], (f) => !f.isExtended);
    const horizontalFingers = hand.mapAnd([1, 2], (f) => f.orientation === 'x');

    return extendedFingers && notExtendedFingers && horizontalFingers;
}

function isI(hand: Hand): boolean {
    const pinky = hand.getFinger(4);
    const isPinkyInPosition = pinky.isExtended && pinky.orientation === 'y';
    const fingersClosed = hand.mapAnd([1, 2, 3], (f) => !f.isExtended);
    return isPinkyInPosition && fingersClosed;
}

function isJ(hand: Hand): boolean {
    // TODO: take movement into account
    const pinky = hand.getFinger(4);
    const isPinkyInHorizontalPosition = pinky.isExtended && pinky.orientation === 'x';
    const fingersClosed = hand.mapAnd([1, 2, 3], (f) => !f.isExtended);
    return isPinkyInHorizontalPosition && fingersClosed;
}

function isK(hand: Hand): boolean {
    // TODO: improve this one
    const thumb = hand.getFinger(5);
    const fingersExtended = hand.mapAnd([1, 2, 5], (f) => f.isExtended);
    const fingersOrientation = hand.mapAnd([1, 5], (f) => f.orientation === 'y');
    const thumbTouching = hand.mapAnd([1, 2], f => thumb.isInContactWith(f));
    const indexTouching = hand.getFinger(1).isTouchingTip(hand.getFinger(2));
    return fingersExtended && fingersOrientation && thumbTouching && !indexTouching;
}

function isL(hand: Hand): boolean {
    const fingersExtended = hand.mapAnd([1, 5], (f) => f.isExtended);
    const fingersClosed = hand.mapAnd([2, 3, 4], (f) => !f.isExtended);
    const thumbOrientation = hand.getFinger(5).orientation === 'x';
    const indexOrientation = hand.getFinger(1).orientation === 'y';
    return fingersExtended && fingersClosed && thumbOrientation && indexOrientation;
}

function isM(hand: Hand): boolean {
    // TODO: check thumb is inside
    const thumb = hand.getFinger(5);
    const fingersClosed = hand.mapAnd([1, 2, 3, 4], f => !f.isExtended);
    const touchingThumb = hand.mapAnd([1, 2, 3], f => f.isInContactWith(thumb));
    const handOrientation = hand.orientation === 'x';
    return fingersClosed && touchingThumb && handOrientation;
}
function isN(hand: Hand): boolean {
    // TODO: check thumb is inside
    const thumb = hand.getFinger(5);
    const fingersClosed = hand.mapAnd([1, 2, 3, 4], f => !f.isExtended);
    const touchingThumb = hand.mapAnd([1, 2], f => f.isInContactWith(thumb));
    const notTouchingThumb = hand.mapAnd([3, 4], f => !f.isInContactWith(thumb));
    const handOrientation = hand.orientation === 'x';
    return fingersClosed && touchingThumb && notTouchingThumb && handOrientation;
}

function isO(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    const fingersClosed = hand.mapAnd([1, 2, 3, 4], f => !f.isExtended);
    const thumbContact = hand.mapAnd([1, 2], f => f.isTouching(thumb));
    const handOrientation = hand.orientation === 'z';
    return fingersClosed && thumbContact && handOrientation;
}

function isP(hand: Hand): boolean {
    // TODO: improve this one
    const thumb = hand.getFinger(5);
    const fingersExtended = hand.mapAnd([1, 2, 5], (f) => f.isExtended);
    const fingersOrientation = hand.mapAnd([2], (f) => f.orientation === 'y');
    // const thumbTouching = hand.mapAnd([1, 2], f => thumb.isInContactWith(f));
    return fingersExtended && fingersOrientation //&& thumbTouching;
}


function isQ(hand: Hand): boolean {
    const indexExtended = hand.getFinger(1).isExtended;
    const thumbExtended = hand.getFinger(5).isExtended;
    const otherClosed = hand.mapAnd([2, 3, 4], (f) => !f.isExtended);
    const verticalFingers = hand.mapAnd([1, 5], (f) => f.orientation === 'y');

    return indexExtended && thumbExtended && otherClosed && verticalFingers;
}
function isR(hand: Hand): boolean {
    const fingersExtended = hand.mapAnd([1, 2], (f) => f.isExtended);
    const touching = hand.getFinger(1).isTouchingTip(hand.getFinger(2));
    const otherClosed = hand.mapAnd([3, 4], (f) => !f.isExtended);
    const verticalFingers = hand.mapAnd([1, 2], (f) => f.orientation === 'y');

    return fingersExtended && touching && otherClosed && verticalFingers;
}
function isS(hand: Hand): boolean {
    // TODO: Check something different than N
    const thumb = hand.getFinger(5);
    const fingersClosed = hand.mapAnd([1, 2, 3, 4], f => !f.isExtended);
    const touchingThumb = hand.mapAnd([1, 2], f => f.isInContactWith(thumb));
    const handOrientation = hand.orientation === 'x';
    const thumbExtended = thumb.isExtended
    return fingersClosed && touchingThumb && handOrientation && !thumbExtended;
}

function isT(hand: Hand): boolean {
    const thumb = hand.getFinger(5);
    const fingersClosed = hand.mapAnd([1, 2, 3, 4], f => !f.isExtended);
    const touchingThumb = hand.mapAnd([1, 2], f => f.isInContactWith(thumb));
    const thumbOrientation = thumb.orientation === 'y';
    const thumbExtended = thumb.isExtended
    const handOrientation = hand.orientation === 'x';
    return fingersClosed && touchingThumb && thumbOrientation && handOrientation && thumbExtended;
}

function isU(hand: Hand): boolean {
    const notExtendedFingers = hand.mapAnd([3, 4, 5], f => !f.isExtended);
    const extendedFingers = hand.mapAnd([1, 2], f => f.isExtended);
    const fingerOrientation = hand.mapAnd([1, 2], f => f.orientation === 'y');

    return notExtendedFingers &&
        extendedFingers &&
        fingerOrientation
}

// For testing purposes
function getFingerData(finger: Finger): Array<string | number | boolean> {
    return [finger.name, finger.length, finger.relativeLength, finger.isExtended, finger.orientation];
}
