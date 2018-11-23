import * as React from 'react';
import { Webtris } from './webtris';
import {
  initialState as initialTetrisState,
  TetrisState,
  TetrisEngineAction } from '../../lib/tetris-engine';

interface WebtrisState {
  tetris: TetrisState;
  firstLaunch: boolean;
  blockWidth: number;
  canvasWidth: number;
  canvasHeight: number;
  selectedLevel: number;
}

interface WebtrisProps {
  blockWidth?: number
};

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

export default class WebtrisContainer extends React.Component<
  WebtrisProps,
  WebtrisState
> {
  private boardCanvas?: HTMLCanvasElement;
  private nextCanvas?: HTMLCanvasElement;
  private boardCtx?: CanvasRenderingContext2D;
  private nextCtx?: CanvasRenderingContext2D;
  private tetrisWorker: Worker = new Worker('tetrisWorker.js');

  constructor(props: {}) {
    super(props);
    const blockWidth = this.props.blockWidth || 10;
    this.tetrisWorker.onmessage = this.handleTetrisStateChange;
    this.state = {
      tetris: initialTetrisState,
      firstLaunch: true,
      blockWidth: blockWidth,
      canvasWidth: Math.max(
        initialTetrisState.board[0].length * blockWidth,
        100
      ),
      canvasHeight: Math.max(
        initialTetrisState.board.length * blockWidth,
        220
      ),
      selectedLevel: 0
    }
  }

  public componentDidMount() {
    this.boardCanvas = document.getElementById(
      'board-canvas'
    ) as HTMLCanvasElement;
    this.nextCanvas = (
      document.getElementById('next-canvas') as HTMLCanvasElement
    );
    this.boardCtx = this.boardCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    this.nextCtx = this.nextCanvas.getContext('2d') as CanvasRenderingContext2D;

    document.addEventListener('keydown', (evt) => {
      if (!this.state.tetris.gameInProgress) { return; }
      if (!this.boardCtx || !this.boardCanvas) { return; }

      if (evt.key === 'a' || evt.key === 'A') {
        this.tetrisWorker.postMessage(TetrisEngineAction.RotateLeft)
        rotateSound.play();
      }

      if (evt.key === 's' || evt.key === 'S') {
        this.tetrisWorker.postMessage(TetrisEngineAction.RotateRight)
        rotateSound.play();
      }

      if (evt.key === 'ArrowLeft') {
        this.tetrisWorker.postMessage(TetrisEngineAction.MoveLeft)
      }

      if (evt.key === 'ArrowRight') {
        this.tetrisWorker.postMessage(TetrisEngineAction.MoveRight)
      }

      if (evt.key === 'ArrowDown') {
        this.tetrisWorker.postMessage(TetrisEngineAction.MoveDown)
      }

      if (evt.key === ' ') {
        this.tetrisWorker.postMessage(TetrisEngineAction.TogglePause)
      }

    });

    this.drawStatsPieces();
  }

  componentDidUpdate(prevProps: {}, prevState: WebtrisState) {
    this.drawBoard();
    this.drawNextPiece();
  }

  componentWillUnmount() {
    this.tetrisWorker.terminate();
  }

  public render() {
    const props = {
      blockWidth: this.state.blockWidth,
      canvasWidth: this.state.canvasWidth,
      canvasHeight: this.state.canvasHeight,
      firstLaunch: this.state.firstLaunch,
      gameover: this.state.tetris.gameover,
      gameInProgress: this.state.tetris.gameInProgress,
      stats: this.state.tetris.stats,
      level: this.state.tetris.level,
      score: this.state.tetris.score,
      clearedLines: this.state.tetris.clearedLines,
      nextShape: this.state.tetris.nextShape,
      startGame: this.startGame,
      playAgain: this.playAgain,
      selectLevel: this.selectLevel,
      selectedLevel: this.state.selectedLevel
    }
    return <Webtris {...props} />;
  }

  private handleTetrisStateChange = (e: MessageEvent): void => {
    const statsDrawn = this.state.tetris.gameInProgress;
    if (e.data.clearedLines > this.state.tetris.clearedLines) {
      const diff = e.data.clearedLines - this.state.tetris.clearedLines;
      if (diff >= 4) {
        lineRemoval4Sound.play();
      } else {
        lineRemovalSound.play();
      }
    }
    if (e.data.gameover) {
      gameMusic.pause();
      gameMusic.currentTime = 0;
    }
    const newStats = e.data.stats;
    const currStats = this.state.tetris.stats;
    if (
      JSON.stringify(newStats) !== JSON.stringify(currStats) &&
      JSON.stringify(currStats) !== JSON.stringify(initialTetrisState.stats)
    ) {
      hitSound.play();
    }
    this.setState({tetris: e.data});
    if (!statsDrawn) {
      this.drawStatsPieces();
    }
  }

  private startGame = (): void => {
    this.tetrisWorker.postMessage(TetrisEngineAction.Play)
    this.drawStatsPieces();
    gameMusic.play();
    this.setState({firstLaunch: false});
  }

  private playAgain = (): void => {
    this.tetrisWorker.postMessage(
      [TetrisEngineAction.PlayAgain, this.state.selectedLevel]
    )
    gameMusic.play();
  }

  private selectLevel = (level: number) => {
    this.tetrisWorker.postMessage([TetrisEngineAction.SetLevel, level])
    this.setState({selectedLevel: level});
  }

  // expensive but only drawn once at start of game
  private readonly drawStatsPieces = (): void => {
    if (!this.state.tetris.gameInProgress) { return; }
    const blockWidth = this.state.blockWidth;
    const w = blockWidth;
    const h = blockWidth;
    let type: keyof TetrisState['stats'];
    for (type in this.state.tetris.stats) {
      const canvas = (
        document.getElementById(`stats-canvas-${type}`) as HTMLCanvasElement
      );
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const piece = this.state.tetris.stats[type];
      for (let i = 0; i < piece.shape.length; ++i) {
        for (let j = 0; j < piece.shape[0].length; ++j) {
          if (piece.shape[i][j] !== 0) {
            const y = (i * h);
            const x = (j * w);
            ctx.fillStyle = piece.color;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);
          }
        }
      }
    }
  }

  private readonly drawNextPiece = (): void => {
    if (!this.nextCtx) { return; }
    if (!this.nextCanvas) { return; }
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    if (!this.state.tetris.gameInProgress) { return; }
    if (this.state.tetris.gameover) { return; }

    const piece = this.state.tetris.nextShape;
    const color = this.state.tetris.nextColor;
    const centerY = piece.length / 2;
    const centerX = piece[0].length / 2
    const w = this.state.blockWidth;
    const h = this.state.blockWidth;

    for (let i = 0; i < piece.length; ++i) {
      for (let j = 0; j < piece[0].length; ++j) {
        const x = (centerX + j) * this.state.blockWidth
        const y = (centerY + i) * this.state.blockWidth;
        if (piece[i][j] !== 0) {
          this.nextCtx.fillStyle = color;
          this.nextCtx.strokeStyle = 'black';
          this.nextCtx.lineWidth = 2;
          this.nextCtx.fillRect(x, y, w, h);
          this.nextCtx.strokeRect(x, y, w, h);
        }
      }
    }
  }

  private readonly drawBoard = (): void => {
    if (!this.boardCtx) { return; }
    if (!this.boardCanvas) { return; }
    this.boardCtx.clearRect(
      0, 0, this.boardCanvas.width, this.boardCanvas.height
    );

    const board = this.state.tetris.board;
    for (let i = 0; i < board.length; ++i) {
      for (let j = 0; j < board[0].length; ++j) {
        const x = j * this.state.blockWidth
        const y = i * this.state.blockWidth;
        const w = this.state.blockWidth;
        const h = this.state.blockWidth;
        if (board[i][j] !== 0) {
          this.boardCtx.fillStyle = board[i][j] as string;
          this.boardCtx.strokeStyle = 'black';
          this.boardCtx.lineWidth = 2;
          this.boardCtx.fillRect(x, y, w, h);
          this.boardCtx.strokeRect(x, y, w, h);
        }
      }
    }
  }
}