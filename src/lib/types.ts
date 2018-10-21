export type NumberVector = Array<number[]>;
export type Color =
  'red' | 'cyan' | 'magenta' | 'blue' | 'yellow' | 'green' | 'purple';

export interface GamePiece {
  shape: {
    0: NumberVector;
    90: NumberVector;
    180: NumberVector;
    270: NumberVector;
  };
  rotation: Rotation;
  rowPos: number;
  colPos: number;
  color: Color;
  type: 'T' | 'L' | 'RL' | 'Zig' | 'Zag' | 'Line' | 'Block';
}

export type Rotation = keyof GamePiece['shape']