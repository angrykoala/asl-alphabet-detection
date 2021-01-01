# asl-alphabet-detection
_by @angrykoala_

This is a prototype of detection of [asl alphabet](https://en.wikipedia.org/wiki/American_manual_alphabet) using tensorflow [handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose) pre-trained model.

The project also has several utilities for general purpose handpose detection.


## How to use it

The whole system runs in a frontend webpage. It requires nodejs and npm to run


1. `npm install` to install dependencies.
2. `npm start` to compile and run a test server in `localhost:1234`


## Implementation details

The whole system is built around the classes `Hand` and `Finger` that provides a set of utilities for handpose detection.

The file `index.ts` uses these classes to infer asl alphabet and update a webpage real-time from a camera capture.

Fingers in the hand are numbered from 1 (index finger) to 5 (thumb)


### Handpose

A handpose may be defined following the following variables:

* Hand
    * Orientation
* Finger (5)
    * Orientation
    * Extended (Half-curl?)


Types of contact from fingers A to B:
* Any (any part of A touches with any part of B)
* Tip to any (the tip of A touches any part of B)
* Tip to Base
* Tip to Tip (Tip of A with Tip of B)
* No contact


Kinds of contact: Tip, Base, Any
Contact Matrix:

- |   1   |   2   |   3   |   4   |   5
1 |   -   |  base |   3   |  any  |  None
2 |  tip  |   -   |   3   |   4   |   5
3 |   1   |   2   |   -   |   4   |   5
4 |  any  |   2   |   3   |   -   |   5
5 | None  |   2   |   3   |   4   |   -

* Finger 2 touches finger 1 base with its tip
* Finger 1 is in contact with Finger 4
* Finger 1 and 5 do not touch
* All the other fingers are irrelevant to the pose


Example: index tip with second finger base AND second finger tip with any part of 3
contacts: [
    [[1,"tip"],[2,"base"]],
    [[2,"tip"],[3,"any"]]
    ]

Orientation Details
* +X -> Right
* -X -> Left
* +Y -> Up
* -Y -> Down
* +Z -> Forward
* -Z -> Backward



## Troubleshooting

* Enable hardware accelerator required
