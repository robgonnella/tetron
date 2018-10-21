import * as React from 'react';
import TetrisEngine, { TetrisState } from '../lib/tetris-engine';

interface WebtrisState {
  tetris: TetrisState;
  blockWidth: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface WebtrisProps {
  blockWidth?: number
}

export default class Webtris extends React.Component<
  WebtrisProps,
  WebtrisState
> {
  private boardCanvas?: HTMLCanvasElement;
  private nextCanvas?: HTMLCanvasElement;
  private statsCanvas?: HTMLCanvasElement;
  private boardCtx?: CanvasRenderingContext2D;
  private nextCtx?: CanvasRenderingContext2D;
  private statsCtx?: CanvasRenderingContext2D;
  private tetrisEngine: TetrisEngine = new TetrisEngine();

  constructor(props: {}) {
    super(props);

    this.tetrisEngine.setChangeHandler(this.handleTetrisStateChange);

    const blockWidth = this.props.blockWidth || 10;

    this.state = {
      tetris: this.tetrisEngine.getState(),
      blockWidth: blockWidth,
      canvasWidth: Math.max(
        this.tetrisEngine.board[0].length * blockWidth,
        100
      ),
      canvasHeight: Math.max(
        this.tetrisEngine.board.length * blockWidth,
        220
      )
    }
  }

  public componentDidMount() {
    this.boardCanvas = document.getElementById(
      'board-canvas'
    ) as HTMLCanvasElement;
    this.nextCanvas = (
      document.getElementById('next-canvas') as HTMLCanvasElement
    );
    this.statsCanvas = document.getElementById(
      'stats-canvas'
    ) as HTMLCanvasElement;

    this.boardCtx = this.boardCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    this.nextCtx = this.nextCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.statsCtx = this.statsCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;

    document.addEventListener('keydown', (evt) => {
      if (!this.boardCtx || !this.boardCanvas) { return; }

      if (evt.key === 'Meta') {
        this.tetrisEngine.rotateRight();
      }

      if (evt.key === 'Alt') {
        this.tetrisEngine.rotateLeft();
      }

      if (evt.key === 'ArrowLeft') {
        this.tetrisEngine.moveLeft();
      }

      if (evt.key === 'ArrowRight') {
        this.tetrisEngine.moveRight();
      }

      if (evt.key === 'ArrowDown') {
        this.tetrisEngine.moveDown();
      }

      if (evt.key === ' ') {
        this.tetrisEngine.togglePause();
      }

    });

    this.drawStatsPieces();
    this.tetrisEngine.run();
  }

  componentDidUpdate(prevProps: {}, prevState: WebtrisState) {
    this.drawBoard();
    this.drawNextPiece();
  }

  public render() {
    return (
      <div
        className='tetris-container'
        style={{
          backgroundImage: 'url(./images/tetris-background.png)',
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          color: 'white',
          verticalAlign: 'top',
          paddingTop: this.state.blockWidth * 4
        }}
      >
        <div
          className='side-car-left'
          style={{
            display: 'inline-block',
            borderRight: '3px solid black',
            width: this.state.canvasWidth,
            height: this.state.canvasHeight,
            border: '1px solid red',
            marginRight: '25px',
            verticalAlign: 'top',
            backgroundColor: 'midnightblue'
          }}
        >
          <canvas
            id='stats-canvas'
            width={this.state.canvasWidth/2}
            height={this.state.canvasHeight}
            style={{
              marginTop: this.state.blockWidth + (this.state.blockWidth / 2)
            }}
          />
          <div
            className='stats-numbers'
            style={{
              display: 'inline-block',
              fontSize: 20,
              color: 'grey',
              verticalAlign: 'top',
              width: this.state.canvasWidth / 4,
              height: this.state.canvasHeight,
              marginTop: this.state.blockWidth
            }}
          >
            <div style={{padding: 17.5}}>{this.state.tetris.stats.T.stats}</div>
            <div style={{padding: 17.5}}>{this.state.tetris.stats.L.stats}</div>
            <div style={{padding: 17.5}}>{this.state.tetris.stats.RL.stats}</div>
            <div style={{padding: 17.5}}>{this.state.tetris.stats.Zig.stats}</div>
            <div style={{padding: 17.5}}>{ this.state.tetris.stats.Zag.stats }</div>
            <div style={{padding: 17.5}}>{ this.state.tetris.stats.Line.stats }</div>
            <div style={{padding: 17.5}}>{ this.state.tetris.stats.Block.stats }</div>
          </div>
        </div>
        <canvas
          id='board-canvas'
          style={{
            display: 'inline-block',
            border: '1px solid red',
            marginRight: '25px',
            verticalAlign: 'top',
            backgroundColor: 'midnightblue'
          }}
          width={this.state.canvasWidth}
          height={this.state.canvasHeight}
        />
        <div
          className='side-car-right'
          style={{
            display: 'inline-block',
            width: this.state.canvasWidth,
            height: this.state.canvasHeight,
            border: '1px solid red',
            verticalAlign: 'top',
            backgroundColor: 'midnightblue'
          }}
        >
          <div
            style={{
              marginTop: this.state.canvasHeight / 4
            }}
          >
            Level: {this.state.tetris.level}<br/><br/>
            Score: {this.state.tetris.score}<br/><br/>
            {this.renderGameOver()}
          </div>
          <canvas
            id='next-canvas'
            width={this.state.tetris.nextPiece[0].length * 2 * this.state.blockWidth}
            height={this.state.tetris.nextPiece.length * 2 * this.state.blockWidth}
            style={{marginTop: 25, border: '1px solid red'}}
          />
        </div>
      </div>
    );
  }

  private handleTetrisStateChange = (tetris: TetrisState): void => {
    this.setState({tetris});
  }

  private readonly renderGameOver = (): JSX.Element | null => {
    if (!this.state.tetris.gameover) { return null; }
    return (
      <div>
        <h3>Game Over!!</h3>
        <button onClick={this.playAgain}>
          Play Again
        </button>
      </div>
    );
  }

  private readonly playAgain = (): void => {
    this.tetrisEngine = this.tetrisEngine.playAgain();
    this.tetrisEngine.run();
  }

  private readonly drawStatsPieces = (): void => {
    if (!this.statsCtx) { return; }
    if (!this.statsCanvas) { return; }
    this.statsCtx.font = "20px Georgia";
    const blockWidth = this.state.blockWidth;
    const textX = (this.statsCanvas.width / 2) + blockWidth;
    const w = blockWidth;
    const h = blockWidth;
    let topOffset = 0;
    let type: keyof TetrisState['stats'];
    for (type in this.state.tetris.stats) {
      const piece = this.state.tetris.stats[type];
      for (let i = 0; i < piece.shape.length; ++i) {
        for (let j = 0; j < piece.shape[0].length; ++j) {
          if (piece.shape[i][j] !== 0) {
            const y = (this.state.blockWidth * i) + topOffset;
            const x = (this.state.blockWidth * j) + this.state.blockWidth;
            this.statsCtx.fillStyle = 'grey';
            this.statsCtx.strokeStyle = 'black';
            this.statsCtx.lineWidth = 2;
            this.statsCtx.fillRect(x, y, w, h);
            this.statsCtx.strokeRect(x, y, w, h);
          }
        }
      }
      topOffset += (piece.shape.length * blockWidth) + blockWidth;
    }
  }

  private readonly drawNextPiece = (): void => {
    if (!this.nextCtx) { return; }
    if (!this.nextCanvas) { return; }
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    const piece = this.state.tetris.nextPiece;
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