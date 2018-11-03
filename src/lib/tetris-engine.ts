import { Color, GamePiece, Rotation, Stats } from './types';
import { L, RL, Zig, Zag, Line, Block, T } from './game-pieces';
export { StatsPiece } from './types';

type Board = Array<Array<0|Color>>;
export interface TetrisState {
  board: Board;
  level: number;
  score: number;
  clearedLines: number;
  gameover: boolean;
  gameInProgress: boolean;
  nextShape: Array<number[]>;
  nextColor: Color;
  stats: Stats;
}

type ChangeCallback = (b: TetrisState) => void;

function generateCleanBoard(): Board {
  let board = [];
  for (let i = 0; i < 22; ++i) {
    board.push(Array(10).fill(0));
  }
  return board;
}

const cleanBoard = generateCleanBoard();
const rotations: Rotation[] = [0, 90, 180, 270];
const colors: Color[] = [
  'red',
  'blue',
  'green',
  'cyan',
  'magenta',
  'yellow',
  'purple'
];
const MULTIPLIERS = {
  0: 0,
  1: 40,
  2: 100,
  3: 300,
  4: 1200
}

function isColor(a: any): a is Color {
  return typeof a === 'string' && colors.includes(a as Color);
}

const gameMusic = new Audio();
gameMusic.autoplay = false;
gameMusic.addEventListener('ended', function () {
  this.currentTime = 0;
  this.play();
}, false);
gameMusic.src = 'audio/tetris-theme.m4a';

const rotateSound = new Audio();
rotateSound.autoplay = false;
rotateSound.src = 'audio/block-rotate.mp3';

const lineRemovalSound = new Audio();
lineRemovalSound.autoplay = false;
lineRemovalSound.src = 'audio/line-remove.mp3';

const lineRemoval4Sound = new Audio();
lineRemoval4Sound.autoplay = false;
lineRemoval4Sound.src = 'audio/line-removal4.mp3';

const hitSound = new Audio();
hitSound.autoplay = false;
hitSound.src = 'audio/slow-hit.mp3';

export default class TetrisEngine {

  public readonly board: Board = generateCleanBoard();
  public level: number = 0;
  public score: number = 0;
  public clearedLines: number = 0;
  public paused: boolean = false;
  public gameover: boolean = false;
  public gameInProgress: boolean = false;
  public stats: Stats = {
    T: {
      type: 'T',
      shape: T.shape['0'],
      stats: 0,
      color: T.color
    },
    L: {
      type: 'L',
      shape: L.shape['90'],
      stats: 0,
      color: L.color
    },
    RL: {
      type: 'RL',
      shape: RL.shape['90'],
      stats: 0,
      color: RL.color
    },
    Zig: {
      type: 'Zig',
      shape: Zig.shape['0'],
      stats: 0,
      color: Zig.color
    },
    Zag: {
      type: 'Zag',
      shape: Zag.shape['0'],
      stats: 0,
      color: Zag.color
    },
    Line: {
      type: 'Line',
      shape: Line.shape['90'],
      stats: 0,
      color: Line.color
    },
    Block: {
      type: 'Block',
      shape: Block.shape['0'],
      stats: 0,
      color: Block.color
    }
  };

  private readonly gamePieces: GamePiece[] = [L, RL, Zig, Zag, Line, Block, T];
  private levelUpIn: number = 10;
  private currentPiece: GamePiece;
  private nextPiece: GamePiece;
  private onChange?: ChangeCallback;
  private loopSpeed: number = 1000;
  private loopTimeout?: number;
  private playingAudio: boolean = false;

  static PlayAgain(stateChangeHandler: ChangeCallback, level?: number) {
    const engine = new TetrisEngine(level);
    engine.setChangeHandler(stateChangeHandler);
    engine.play();
    return engine;
  }

  constructor(level?: number) {
    this.currentPiece = this.getRandomPiece();
    this.stats[this.currentPiece.type].stats++
    this.nextPiece = this.getRandomPiece();
    this.setLevel(level || 0);
  }

  public play = (): void => {
    this.run();
    this.gameInProgress = true;
  }

  public readonly togglePause = (): void => {
    if (!this.gameInProgress) { return; }
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = undefined
      this.paused = true;
      gameMusic.pause();
      this.playingAudio = false;
      // send out clean board on pause so users
      // can't pause and plan
      const data = this.getState();
      data.board = cleanBoard;
      if (this.onChange) { this.onChange(data); }
    } else {
      this.paused = false;
      gameMusic.play();
      this.playingAudio = true;
      this.run();
    }
  }

  public readonly setChangeHandler = (cb: ChangeCallback): void => {
    this.onChange = cb;
  }

  public readonly setLevel = (level: number) => {
    if (level === this.level) { return; }
    this.level = level;
    if (level === 0) {
      this.loopSpeed = 1000;
    } else {
      this.loopSpeed *= Math.pow(.75, level) || 1000;
    }
    this.levelUpIn = Math.min(100, (10 * this.level + 10));
  }

  public readonly getState = (): TetrisState => {
    return {
      board: this.board,
      level: this.level,
      score: this.score,
      clearedLines: this.clearedLines,
      gameover: this.gameover,
      gameInProgress: this.gameInProgress,
      nextShape: this.nextPiece.shape[this.nextPiece.rotation],
      nextColor: this.nextPiece.color,
      stats: this.stats
    };
  }

  public readonly moveDown = (accelerated = true): void => {
    if (this.paused) { return; }
    if (this.gameover) { return; }
    if (!this.gameInProgress) { return; }

    if (this.isHit()) {
      hitSound.play();
      return this.renderNextPiece();
    }
    this.clearCurrentPiece();
    ++this.currentPiece.rowPos;
    this.renderCurrentPiece();
    if (accelerated) {
      const shape = this.currentPiece.shape[this.currentPiece.rotation];
      const height = shape.length;
      // points for accerated drop (height of peice plus drop increment)
      this.score += height + 1;
    }
  }

  public readonly moveLeft = () => {
    if (this.paused) { return; }
    if (this.gameover) { return; }
    if (!this.gameInProgress) { return; }

    if (!this.canMoveLeft()) { return; }
    if (this.isAgainstWallOnLeft()) { return; }
    this.clearCurrentPiece();
    --this.currentPiece.colPos;
    this.renderCurrentPiece();
  }

  public readonly moveRight = () => {
    if (this.paused) { return; }
    if (this.gameover) { return; }
    if (!this.gameInProgress) { return; }

    if (!this.canMoveRight()) { return; }
    if (this.isAgainstWallOnRight()) { return; }
    this.clearCurrentPiece();
    ++this.currentPiece.colPos
    this.renderCurrentPiece();
  }

  public readonly rotateLeft = (): void => {
    if (this.paused) { return; }
    if (this.gameover) { return; }
    if (!this.gameInProgress) { return; }

    let wall: string = '';
    if (this.isAgainstWallOnLeft()) { wall = 'left'; }
    if (this.isAgainstWallOnRight()) { wall = 'right'; }
    const nextRotation = this.getNextRotation('left');
    if (!this.canRotate(nextRotation)) { return; }
    this.clearCurrentPiece();
    this.currentPiece.rotation = nextRotation;
    this.updateColPosForWallPostions(wall);
    rotateSound.play();
    this.renderCurrentPiece();
  }

  public readonly rotateRight = () => {
    if (this.paused) { return; }
    if (this.gameover) { return; }
    if (!this.gameInProgress) { return; }

    let wall: string = ''
    if (this.isAgainstWallOnLeft()) { wall = 'left'; }
    if (this.isAgainstWallOnRight()) { wall = 'right'; }
    const nextRotation = this.getNextRotation('right');
    if (!this.canRotate(nextRotation)) { return; }
    this.clearCurrentPiece();
    this.currentPiece.rotation = nextRotation;
    this.updateColPosForWallPostions(wall);
    rotateSound.play();
    this.renderCurrentPiece();
  }

  private readonly run = (): void => {
    if (!this.playingAudio) {
      gameMusic.play();
      this.playingAudio = true;
    }
    this.renderCurrentPiece();
    this.loopTimeout = window.setTimeout(() => {
      if (this.isGameOver()) {
        this.stopGame();
      } else {
        this.moveDown(false);
        this.run();
      }
    }, this.loopSpeed);
  }

  private readonly getRandomPiece = (): GamePiece => {
    let piece = {...this.gamePieces[
      Math.floor(Math.random() * this.gamePieces.length)
    ]};
    const rotation = (
      rotations[Math.floor(Math.random() * 4)]
    ) as Rotation;
    const color = colors[Math.floor(Math.random() * colors.length)];
    piece.color = color;
    piece.rotation = rotation;
    return piece;
  }

  private clearCurrentPiece = () => {
    const board = this.board;
    const piece = this.currentPiece;
    const rowPos = piece.rowPos;
    const colPos = piece.colPos;
    const shape = this.currentPiece.shape[this.currentPiece.rotation];
    for (let row = 0; row < shape.length; ++row) {
      for (let col = 0; col < shape[0].length; ++col) {
        if (shape[row][col] !== 0) {
          board[row + rowPos][col + colPos] = 0;
        }
      }
    }
  }

  private readonly renderCurrentPiece = (): void => {
    const board = this.board;
    const piece = this.currentPiece;
    const rowPos = piece.rowPos;
    const colPos = piece.colPos;
    const rotation = this.currentPiece.rotation
    const shape = this.currentPiece.shape[rotation];

    for (let row = 0; row < shape.length; ++row) {
      for (let col = 0; col < shape[0].length; ++col) {
        const value = shape[row][col] ?
          piece.color :
          board[row + rowPos][col + colPos];
        board[row + rowPos][col + colPos] = value
      }
    }
    if (this.onChange && typeof this.onChange === 'function') {
      this.onChange(this.getState());
    }
  }

  private readonly renderNextPiece = (): void => {
    this.currentPiece = this.nextPiece;
    this.stats[this.currentPiece.type].stats++
    this.nextPiece = this.getRandomPiece();
    this.renderCurrentPiece();
  }

  private readonly canRotate = (nextRotation: Rotation): boolean => {
    let willRotate = true;
    const board = this.board;
    const currRowPos = this.currentPiece.rowPos;
    const nextShape = this.currentPiece.shape[nextRotation];
    const nextColPos = this.getColPosForRotation(nextRotation);

    // clear the board of the current piece so it's own colors don't trigger
    // false positive
    this.clearCurrentPiece();
    loop1:
    for (let i = 0; i < nextShape.length; ++i) {
      for (let j = 0; j < nextShape[0].length; ++j) {
        if (isColor(board[currRowPos + i][nextColPos + j])) {
          willRotate = false;
          break loop1;
        }
      }
    }
    this.renderCurrentPiece();
    return willRotate;
  }

  private readonly getNextRotation = (
    direction: 'right' | 'left'
  ): Rotation => {
    let rotation: Rotation = this.currentPiece.rotation;
    switch(direction) {
      case 'left':
        rotation += 90;
        if (rotation === 360) { rotation = 0; }
        break;
      case 'right':
        rotation -= 90;
        if (rotation < 0) { rotation = 270; }
        break;
    }

    return rotation as Rotation;
  }

  private readonly getColPosForRotation = (r: Rotation): number => {
    const shape = this.currentPiece.shape[r];
    const xLen = shape[0].length;
    if (this.isAgainstWallOnRight()) {
      return this.board[0].length - xLen
    }
    if (this.isAgainstWallOnLeft()) {
      return 0;
    }
    return this.currentPiece.colPos;
  }

  private canMoveRight = (): boolean => {
    const shape = this.currentPiece.shape[this.currentPiece.rotation];
    const height = shape.length;
    const xLen = shape[0].length;
    const rightSide = this.currentPiece.colPos + xLen;
    const rowPos = this.currentPiece.rowPos;
    if (this.isAgainstWallOnRight()) { return false; }
    // check if it's blocked by another piece on the right
    for (let i = 0; i < height; ++i) {
      if (isColor(this.board[rowPos + i][rightSide])) {
        return false;
      }
    }
    return true;
  }

  private canMoveLeft = (): boolean => {
    const shape = this.currentPiece.shape[this.currentPiece.rotation];
    const height = shape.length;
    const rowPos = this.currentPiece.rowPos;
    const colPos = this.currentPiece.colPos;
    if (this.isAgainstWallOnLeft()) { return false; }
    // check if it's blocked by another piece on the left
    for (let i = 0; i < height; ++i) {
      if (isColor(this.board[rowPos + i][colPos - 1])) {
        return false;
      }
    }
    return true;
  }

  private readonly isAgainstWallOnRight = (): boolean => {
    const xLen = (
      this.currentPiece.shape[this.currentPiece.rotation][0].length
    );
    const rightSide = this.currentPiece.colPos + xLen;
    return rightSide >= this.board[0].length;
  }

  private readonly isAgainstWallOnLeft = (): boolean => {
    return this.currentPiece.colPos <= 0;
  }

  private updateColPosForWallPostions = (wall: string): void => {
    const shape = this.currentPiece.shape[this.currentPiece.rotation];
    const xLen = shape[0].length;

    switch (wall) {
      case 'right':
        this.currentPiece.colPos = this.board[0].length - xLen;
        break;
      case 'left':
        this.currentPiece.colPos = 0;
        break;
    }
  }

  private readonly isGameOver = (): boolean => {
    if (this.isHit() && this.currentPiece.rowPos <= 0) {
      this.gameover = true;
      return true;
    } else {
      return false;
    }
  }

  private stopGame = () => {
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = undefined;
    }
    if (this.playingAudio) {
      gameMusic.pause();
      gameMusic.currentTime = 0;
      this.playingAudio = false;
    }
    this.gameover = true;
    this.gameInProgress = false;
    if (this.onChange) { this.onChange(this.getState()); }
  }

  private readonly isHit = (): boolean => {
    let hit = false;
    const piece = this.currentPiece;
    const rotation = piece.rotation;
    const shape = piece.shape[rotation];
    const rowPos = piece.rowPos;
    const colPos = piece.colPos;
    const bottomPos = piece.rowPos + shape.length - 1;

    if (bottomPos === this.board.length - 1) {
      this.clearLines();
      return true;
    }

    for (let i = 0; i < shape.length; ++i) {
      for (let j = 0; j < shape[0].length; ++j) {
        const shapeValue = shape[i][j];
        const nextRow = i + 1;
        const bockIsPartOfShape = shape[nextRow] && shape[nextRow][j];
        const boardRow = rowPos + i + 1;
        const boardCol = colPos + j;
        const boardValue = (
          this.board[boardRow] && this.board[boardRow][boardCol]
        );
        if (shapeValue && !bockIsPartOfShape && boardValue) {
          this.clearLines();
          return true;
        }
      }
    }

    return false;
  }

  private computeScore = (newlyClearedLines: 0 | 1 | 2| 3 | 4) => {
    this.clearedLines += newlyClearedLines;
    if (newlyClearedLines >= this.levelUpIn) {
      this.level++;
      this.levelUpIn = 10 - (this.levelUpIn - newlyClearedLines);
      this.loopSpeed *= .75;
    } else {
      this.levelUpIn -= newlyClearedLines;
    }
    const mult: number = MULTIPLIERS[newlyClearedLines];
    this.score += mult * (this.level + 1)
  }

  private readonly clearLines = (): void => {
    let numClearedLines = 0;
    for (let i = 0; i < this.board.length; ++i) {
      const row = this.board[i];
      if (row.every((e) => e !== 0)) {
        ++numClearedLines;
        // @todo: show flash on row when clearing lines
        // this.board[i] = fullRowFlash;
        this.board.splice(i, 1);
        this.board.unshift(Array(10).fill(0));
      }
    }
    if (numClearedLines === 4) {
      lineRemoval4Sound.play();
    } else if (numClearedLines > 0) {
      lineRemovalSound.play();
    }

    this.computeScore(numClearedLines as 0 | 1 | 2 | 3 | 4);
    if (this.onChange) { this.onChange(this.getState()); }
  }

}
