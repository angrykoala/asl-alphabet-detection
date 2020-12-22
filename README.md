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
