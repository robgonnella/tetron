import { Color, GamePiece, Rotation } from './types';
import { L, ReverseL, Zig, Zag, Line, Block, T } from './game-pieces';

type Board = Array<Array<0|Color>>;
export interface ITetrisData {
  board: Board;
  level: number;
  score: number;
  nextPiece: Array<number[]>;
  nextColor: Color;
}

type ChangeCallback = (b: ITetrisData) => void;

function generateCleanBoard(): Board {
  let board = [];
  for (let i = 0; i < 22; ++i) {
    board.push(Array(10).fill(0));
  }
  return board;
}

const fullRowFlash = Array(10).fill('grey');
const cleanBoard = generateCleanBoard();
const colors = ['red', 'blue', 'green', 'cyan', 'magenta', 'yellow'];
const MULTIPLIERS = {
  0: 0,
  1: 40,
  2: 100,
  3: 300,
  4: 1200
}

function isColor(a: any): a is Color {
  return typeof a === 'string' && colors.includes(a);
}

export default class TetrisEngine {
  public readonly board: Board = generateCleanBoard();
  public level: number = 0;
  public score: number = 0;
  public clearedLines: number = 0;
  public paused: boolean = false;
  private levelUpIn: number = 10;
  private onChange?: ChangeCallback;
  private gamePieces: GamePiece[] = [ L, ReverseL, Zig, Zag, Line, Block, T ];
  private colors: Color[] = colors as Color[];
  private rotation: Rotation[] = [0, 90, 180, 270];
  private currentPiece: GamePiece;
  private nextPiece: GamePiece;
  private loopSpeed: number = 1000;
  private loopInterval?: NodeJS.Timer;

  constructor() {
    this.currentPiece = this.getRandomPiece();
    this.nextPiece = this.getRandomPiece();
  }

  public readonly run = (): void => {
    this.renderCurrentPiece();
    this.loopInterval = setTimeout(() => {
      if (this.isGameOver()) {
        this.stopGame();
      } else {
        this.moveDown();
      }
      this.run();
    }, this.loopSpeed);
  }

  public readonly playAgain = (): TetrisEngine => {
    const engine = new TetrisEngine();
    engine.run();
    return engine;
  }

  public readonly togglePause = (): void => {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = undefined
      this.paused = true;
      const data = this.getData();
      data.board = cleanBoard;
      if (this.onChange) { this.onChange(data); }
    } else {
      this.paused = false;
      this.run();
    }
  }

  public readonly setChangeHandler = (cb: ChangeCallback): void => {
    this.onChange = cb;
  }

  public readonly getData = (): ITetrisData => {
    return {
      board: this.board,
      level: this.level,
      score: this.score,
      nextPiece: this.nextPiece.shape[this.nextPiece.rotation],
      nextColor: this.nextPiece.color
    };
  }

  public readonly moveDown = (): void => {
    if (this.paused) { return; }
    if (this.isHit()) { return this.renderNextPiece(); }
    this.clearCurrentPiece();
    ++this.currentPiece.rowPos;
    const yLen = (
      this.currentPiece.shape[this.currentPiece.rotation].length
    );
    const bottom = this.currentPiece.rowPos + yLen;
    if (bottom > this.board.length) {
      this.currentPiece.rowPos = this.board.length - yLen;
    }
    this.renderCurrentPiece();
  }

  public readonly moveLeft = () => {
    if (this.paused) { return; }
    if (!this.canMoveLeft()) { return; }
    if (this.isAgainstWallOnLeft()) { return; }
    this.clearCurrentPiece();
    --this.currentPiece.colPos;
    this.renderCurrentPiece();
  }

  public readonly moveRight = () => {
    if (this.paused) { return; }
    if (!this.canMoveRight()) { return; }
    if (this.isAgainstWallOnRight()) { return; }
    this.clearCurrentPiece();
    ++this.currentPiece.colPos
    this.renderCurrentPiece();
  }

  public readonly rotateLeft = (): void => {
    if (this.paused) { return; }
    let wall: string = '';
    if (this.isAgainstWallOnLeft()) { wall = 'left'; }
    if (this.isAgainstWallOnRight()) { wall = 'right'; }
    const nextRotation = this.getNextRotation('left');
    if (!this.canRotate(nextRotation)) { return; }
    this.clearCurrentPiece();
    this.currentPiece.rotation = nextRotation;
    this.updateColPosForWallPostions(wall);
    this.renderCurrentPiece();
  }

  public readonly rotateRight = () => {
    if (this.paused) { return; }
    let wall: string = ''
    if (this.isAgainstWallOnLeft()) { wall = 'left'; }
    if (this.isAgainstWallOnRight()) { wall = 'right'; }
    const nextRotation = this.getNextRotation('right');
    if (!this.canRotate(nextRotation)) { return; }
    this.clearCurrentPiece();
    this.currentPiece.rotation = nextRotation;
    this.updateColPosForWallPostions(wall);
    this.renderCurrentPiece();
  }

  private readonly getRandomPiece = (): GamePiece => {
    let piece = {...this.gamePieces[
      Math.floor(Math.random() * this.gamePieces.length)
    ]};
    const rotation = (
      this.rotation[Math.floor(Math.random() * this.rotation.length)]
    );
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
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
    if (this.isGameOver()) {
      return this.stopGame();
    }
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
      this.onChange(this.getData());
    }
  }

  private readonly renderNextPiece = (): void => {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.getRandomPiece();
    this.renderCurrentPiece();
  }

  private readonly canRotate = (nextRotation: Rotation): boolean => {
    let willRotate = true;
    const board = this.board;
    const currRowPos = this.currentPiece.rowPos;
    const nextShape = this.currentPiece.shape[nextRotation];
    const nextColPos = this.getColPosForRotation(nextRotation);

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
      return true;
    } else {
      return false;
    }
  }

  private stopGame = () => {
    if (this.loopInterval) {
      clearTimeout(this.loopInterval);
      this.loopInterval = undefined;
    }
    console.log('Game Over Man!!!');
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

  private computeStats = (newlyClearedLines: 0 | 1 | 2| 3 | 4) => {
    this.clearedLines += newlyClearedLines;
    if (newlyClearedLines >= this.levelUpIn) {
      this.level++;
      this.levelUpIn = 10 - Math.floor(newlyClearedLines / this.levelUpIn);
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
    this.computeStats(numClearedLines as 0 | 1 | 2 | 3 | 4);
    if (this.onChange) { this.onChange(this.getData()); }
  }

}
