import { Orientation, Vector2, Vector3 } from "./types";
import * as math from "mathjs";

// Should 2 points be considered "close enough"
// TODO: make this relative to hand size
const CLOSE_DISTANCE = 40;

export function areTouching(v1: Vector3, v2: Vector3, errorRange: number = CLOSE_DISTANCE): boolean {
    return math.distance(v1, v2) < errorRange;
}

export function closeEnoughNumber(n1: number, n2: number, errorRange: number = CLOSE_DISTANCE): boolean {
    return Math.abs(n1 - n2) < errorRange;
}

export function getDistance(a: Vector3, b: Vector3): number;
export function getDistance(a: Vector2, b: Vector2): number;
export function getDistance(a: Vector2 | Vector3, b: Vector2 | Vector3): number {
    return math.distance(a, b) as number;
}

export function areAligned([a, b, c]: [Vector3, Vector3, Vector3]): boolean {
    const dab = math.distance(a, b) as number;
    const dac = math.distance(a, c) as number;
    const dbc = math.distance(b, c) as number;
    const sortedDistances = [dab, dac, dbc].sort((n1, n2) => n1 - n2);
    if (closeEnoughNumber(sortedDistances[2], sortedDistances[0] + sortedDistances[1], 1)) return true;
    else return false;
}

// v2-v1
export function vectorDiff(a: Vector3, b: Vector3): Vector3 {
    return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
}

// Returns the index of the highest value of a vector
// TODO: try and make this function less bad
export function getMaxIndex(v: Array<number>): number {
    let max = v[0];
    let index = 0;

    for (let i = 1; i < v.length; i++) {
        if (v[i] > max) {
            max = v[i];
            index = i;
        }
    }

    return index;
}

export type TableData = Array<(string | number | boolean)[]>;

// Given a Matrix, generates an html table
// Could this be used to build a full webpage?
export function tableify(elements: TableData): string {
    const rows = elements.map(row => {
        const content = row.map(elem => `<td>${elem}</td>`).join("");
        return `<tr>${content}</tr>`;
    }).join("");
    return `<table>${rows}</table>`;
}

// Returns the orientation (x,y,z) between 2 vectors
export function getOrientation(v1: Vector3, v2: Vector3): Orientation {
    const baseOrientations: Array<Orientation> = ["x", "y", "z"];
    const fingerDiff = vectorDiff(v1, v2);
    const maxIndex = getMaxIndex(fingerDiff.map(Math.abs));

    return baseOrientations[maxIndex];

}
