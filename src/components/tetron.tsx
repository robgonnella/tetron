import * as React from 'react';
import { L, ReverseL, Zig, Zag, Line, Block } from '../lib/shapes';
import { Shape } from '../lib/types';

export default class TetronComponent extends React.Component<{}, {}> {
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private Zig: Shape;
  private Zag: Shape;
  private L: Shape;
  private ReverseL: Shape;
  private Line: Shape;
  private Block: Shape;


  constructor(props: {}) {
    super(props);
    this.Zig = new Zig(20, 160, 20);
    this.Zag = new Zag(20, 180, 100);
    this.L = new L(20, 160, 160);
    this.ReverseL = new ReverseL(20, 180, 250);
    this.Line = new Line(20, 180, 340);
    this.Block = new Block(20, 160, 460);
  }

  public componentDidMount() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    document.addEventListener('keydown', (evt) => {
      if (!this.ctx || !this.canvas) { return; }
      if (evt.key === 'Meta') {
        this.Zig.rotateRight();
        this.Zag.rotateRight();
        this.L.rotateRight();
        this.ReverseL.rotateRight();
        this.Line.rotateRight();
        this.Block.rotateRight();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShapes();
      }

      if (evt.key === 'Alt') {
        this.Zig.rotateLeft();
        this.Zag.rotateLeft();
        this.L.rotateLeft();
        this.ReverseL.rotateLeft();
        this.Line.rotateLeft();
        this.Block.rotateLeft();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShapes();
      }

      if (evt.key === 'ArrowLeft') {
        this.Zig.moveLeft();
        this.Zag.moveLeft();
        this.L.moveLeft();
        this.ReverseL.moveLeft();
        this.Line.moveLeft();
        this.Block.moveLeft();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShapes();
      }

      if (evt.key === 'ArrowRight') {
        this.Zig.moveRight();
        this.Zag.moveRight();
        this.L.moveRight();
        this.ReverseL.moveRight();
        this.Line.moveRight();
        this.Block.moveRight();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShapes();
      }

      if (evt.key === 'ArrowUp') {
        this.Zig.moveUp();
        this.Zag.moveUp();
        this.L.moveUp();
        this.ReverseL.moveUp();
        this.Line.moveUp();
        this.Block.moveUp();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShapes();
      }

      if (evt.key === 'ArrowDown') {
        this.Zig.moveDown();
        this.Zag.moveDown();
        this.L.moveDown();
        this.ReverseL.moveDown();
        this.Line.moveDown();
        this.Block.moveDown();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawShapes();
      }
    });

    this.drawShapes();
  }

  public render() {
    return (
      <canvas id='canvas'
        width='400'
        height='800'
        style={{
          backgroundColor: 'midnightblue'
        }}
      />
    );
  }

  private drawShapes = () => {
    if (!this.ctx) { return; }
    // Z
    this.Zig.draw(this.ctx);

    // S
    this.Zag.draw(this.ctx);

    // L
    this.L.draw(this.ctx);

    // Reverse L
    this.ReverseL.draw(this.ctx);

    // Line
    this.Line.draw(this.ctx);

    // Block
    this.Block.draw(this.ctx);
  }

}