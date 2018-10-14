import { GamePiece } from './types';

export const L: GamePiece = {
  shape: {
    0: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    90: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    180: [
      [1, 1],
      [0, 1],
      [0, 1]
    ],
    270: [
      [1, 1, 1],
      [1, 0, 0]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 4,
  color: 'magenta'
}

export const ReverseL: GamePiece = {
  shape: {
    0: [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    90: [
      [1, 1, 1],
      [0, 0, 1]
    ],
    180: [
      [1, 1],
      [1, 0],
      [1, 0]
    ],
    270: [
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 3,
  color: 'red'
}

export const Zig: GamePiece = {
  shape: {
    0: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    90: [
      [0, 1],
      [1, 1],
      [1, 0]
    ],
    180: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    270: [
      [0, 1],
      [1, 1],
      [1, 0]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 3,
  color: 'cyan'
}

export const Zag: GamePiece = {
  shape: {
    0: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    90: [
      [1, 0],
      [1, 1],
      [0, 1]
    ],
    180: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    270: [
      [1, 0],
      [1, 1],
      [0, 1]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 3,
  color: 'blue'
}

export const Line: GamePiece = {
  shape: {
    0: [
      [1],
      [1],
      [1],
      [1]
    ],
    90: [
      [1, 1, 1, 1]
    ],
    180: [
      [1],
      [1],
      [1],
      [1]
    ],
    270: [
      [1, 1, 1, 1]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 4,
  color: 'green'
}

export const Block: GamePiece = {
  shape: {
    0: [
      [1, 1],
      [1, 1]
    ],
    90: [
      [1, 1],
      [1, 1]
    ],
    180: [
      [1, 1],
      [1, 1]
    ],
    270: [
      [1, 1],
      [1, 1]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 3,
  color: 'yellow'
}

export const T: GamePiece = {
  shape: {
    0: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    90: [
      [0, 1],
      [1, 1],
      [0, 1]
    ],
    180: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    270: [
      [1, 0],
      [1, 1],
      [1, 0]
    ]
  },
  rotation: 0,
  rowPos: 0,
  colPos: 4,
  color: 'red'
}