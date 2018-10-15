import * as React from 'react';
import TetrisEngine, { ITetrisData } from '../lib/tetris-engine';

interface WebtrisState {
  tetris: ITetrisData;
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
  private canvas?: HTMLCanvasElement;
  private canvas2?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private ctx2?: CanvasRenderingContext2D;
  private tetrisEngine: TetrisEngine = new TetrisEngine();

  constructor(props: {}) {
    super(props);

    this.tetrisEngine.setChangeHandler(this.handleTetrisStateChange);

    const blockWidth = this.props.blockWidth || 10;

    this.state = {
      tetris: this.tetrisEngine.getData(),
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
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.canvas2 = (
      document.getElementById('side-car-canvas') as HTMLCanvasElement
    );
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.ctx2 = this.canvas2.getContext('2d') as CanvasRenderingContext2D;

    document.addEventListener('keydown', (evt) => {
      if (!this.ctx || !this.canvas) { return; }

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
          position: 'relative',
          backgroundColor: 'midnightblue'
        }}
      >
        <canvas
          id='canvas'
          style={{display: 'inline-block', borderRight: '3px solid black'}}
          width={this.state.canvasWidth}
          height={this.state.canvasHeight}
        />
        <div
          className='side-car'
          style={{
            position: 'absolute',
            marginTop: this.state.canvasHeight / 10,
            width: this.state.canvasWidth,
            height: this.state.canvasHeight,
            display: 'inline-block',
            color: 'white',
            textAlign: 'center',
          }}
        >
          Level: {this.state.tetris.level}<br/><br/>
          Score: {this.state.tetris.score}<br/><br/>
          {this.renderGameOver()}
          <canvas
            id='side-car-canvas'
            width={this.state.tetris.nextPiece[0].length * 2 * this.state.blockWidth}
            height={this.state.tetris.nextPiece.length * 2 * this.state.blockWidth}
            style={{marginTop: 25, border: '1px solid red'}}
          />
        </div>
      </div>
    );
  }

  private handleTetrisStateChange = (tetris: ITetrisData): void => {
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

  private readonly drawNextPiece = () => {
    if (!this.ctx2) { return; }
    if (!this.canvas2) { return; }
    this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

    const piece = this.state.tetris.nextPiece;
    const color = this.state.tetris.nextColor;
    const centerY = piece.length / 2;
    const centerX = piece[0].length / 2

    for (let i = 0; i < piece.length; ++i) {
      for (let j = 0; j < piece[0].length; ++j) {
        const x = (centerX + j) * this.state.blockWidth
        const y = (centerY + i) * this.state.blockWidth;
        const w = this.state.blockWidth;
        const h = this.state.blockWidth;
        if (piece[i][j] !== 0) {
          this.ctx2.fillStyle = color;
          this.ctx2.strokeStyle = 'black';
          this.ctx2.lineWidth = 2;
          this.ctx2.fillRect(x, y, w, h);
          this.ctx2.strokeRect(x, y, w, h);
        }
      }
    }
  }

  private readonly drawBoard = () => {
    if (!this.ctx) { return; }
    if (!this.canvas) { return; }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const board = this.state.tetris.board;
    for (let i = 0; i < board.length; ++i) {
      for (let j = 0; j < board[0].length; ++j) {
        const x = j * this.state.blockWidth
        const y = i * this.state.blockWidth;
        const w = this.state.blockWidth;
        const h = this.state.blockWidth;
        if (board[i][j] !== 0) {
          this.ctx.fillStyle = board[i][j] as string;
          this.ctx.strokeStyle = 'black';
          this.ctx.lineWidth = 2;
          this.ctx.fillRect(x, y, w, h);
          this.ctx.strokeRect(x, y, w, h);
        }
      }
    }
  }

}