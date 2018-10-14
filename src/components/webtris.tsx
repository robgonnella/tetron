import * as React from 'react';
import TetrisEngine, { Board } from '../lib/tetris-engine';

interface WebtrisState {
  board: Board;
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
  private ctx?: CanvasRenderingContext2D;
  private tetrisEngine: TetrisEngine = new TetrisEngine();

  constructor(props: {}) {
    super(props);

    this.tetrisEngine.setChangeHandler(this.handleBoardChange);

    const blockWidth = this.props.blockWidth || 10;

    this.state = {
      board: this.tetrisEngine.board,
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
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

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
  }

  public render() {
    return (
      <canvas id='canvas'
        width={this.state.canvasWidth}
        height={this.state.canvasHeight}
        style={{backgroundColor: 'midnightblue'}}
      />
    );
  }

  private handleBoardChange = (board: Board): void => {
    this.setState({board});
  }

  private drawBoard = () => {
    if (!this.ctx) { return; }
    for (let i = 0; i < this.state.board.length; ++i) {
      for (let j = 0; j < this.state.board[0].length; ++j) {
        const x = j * this.state.blockWidth
        const y = i * this.state.blockWidth;
        const w = this.state.blockWidth;
        const h = this.state.blockWidth;
        if (this.state.board[i][j] !== 0) {
          this.ctx.fillStyle = this.state.board[i][j] as string;
          this.ctx.strokeStyle = 'black';
          this.ctx.lineWidth = 2;
          this.ctx.fillRect(x, y, w, h);
          this.ctx.strokeRect(x, y, w, h);
        } else {
          this.ctx.clearRect(x, y, w, h);
        }
      }
    }
  }

}