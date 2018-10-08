import { Shape } from './types';

const TO_RADIANS = Math.PI / 180;

interface IDimensionsByAngle {
  0: { w: number, h: number };
  90: { w: number, h: number };
  180: { w: number, h: number };
  270: { w: number, h: number };
}

class ShapeActions {
  public type: Shape['type'] = 'Zig';
  public x: number;
  public y: number;
  public angle: 0 | 90 | 180 | 270 = 0;
  public readonly width: number;
  public centerX: number = 0;
  public centerY: number = 0;

  constructor(w: number, x: number = 0, y: number = 0) {
    this.width = w;
    this.x = x;
    this.y = y;
  }

  public moveRight = () => {
    this.x += this.width;
    this.setCenterPoints();
  }

  public moveLeft = () => {
    this.x -= this.width;
    this.setCenterPoints();
  }

  public rotateLeft = () => {
    if (this.angle === 0) {
      this.angle = 270;
    } else {
      this.angle -= 90;
    }
  }

  public rotateRight = () => {
    this.angle += 90;
    if (this.angle === 360) {
      this.angle = 0;
    }
  }

  public accelerate = () => {
    this.y += 20;
  }

  public applyRotation = (ctx: CanvasRenderingContext2D, cX: number, cY: number) => {
    ctx.translate(cX, cY);
    ctx.rotate(this.angle * TO_RADIANS);
    ctx.translate(-cX, -cY);
  }

  public setCenterPoints = () => {
    let centerX = 0;
    let centerY = 0;
    switch(this.type) {
      case 'Zig':
        centerX = this.x + (this.width * 3) / 2;
        centerY = this.y + (this.width * 2) / 2;
        break;
      case 'Zag':
        centerX = this.x + this.width / 2;
        centerY = this.y + this.width;
        break;
      case 'L':
        centerX = this.x + this.width;
        centerY = this.y + (this.width * 3) / 2;
        break
      case 'ReverseL':
        centerX = this.x;
        centerY = this.y + (this.width * 3) / 2;
        break;
      case 'Line':
        centerX = this.x + this.width / 2;
        centerY = this.y + this.width * 2;
        break;
      case 'Block':
        centerX = this.x + this.width;
        centerY = this.y + this.width;
        break
      default:
        break;
    }
    this.centerX = centerX;
    this.centerY = centerY
  }

  // testing
  public moveDown = () => {
    this.y += 20;
    this.setCenterPoints();
  }

  public moveUp = () => {
    this.y -= 20;
    this.setCenterPoints();
  }

}

export class L extends ShapeActions implements Shape {
  public type: Shape['type'] = 'L';
  public readonly width: number;

  constructor(width: number, x: number = 0, y: number = 0) {
    super(width, x, y);
    this.width = width
    this.setCenterPoints();
  }

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.applyRotation(ctx, this.centerX, this.centerY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    // move one right
    ctx.lineTo(this.x + this.width, this.y);
    // move 2 down
    ctx.lineTo(this.x + this.width, this.y + (this.width * 2));
    // move one right
    ctx.lineTo(this.x + (this.width * 2), this.y + (this.width * 2));
    // move one down
    ctx.lineTo(this.x + (this.width * 2), this.y + (this.width * 3));
    // move two left
    ctx.lineTo(this.x, this.y + (this.width * 3));
    // move three up to complete loop
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.restore();
  }

}

export class ReverseL extends ShapeActions implements Shape {
  public type: Shape['type'] = 'ReverseL';
  public readonly width: number;


  constructor(width: number, x: number = 0, y: number = 0) {
    super(width, x, y);
    this.width = width
    this.setCenterPoints();
  }

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.applyRotation(ctx, this.centerX, this.centerY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    // move one right
    ctx.lineTo(this.x + this.width, this.y);
    // move three down
    ctx.lineTo(this.x + this.width, this.y + (this.width * 3));
    // move two left
    ctx.lineTo(this.x - this.width, this.y + (this.width * 3));
    // move one up
    ctx.lineTo(this.x - this.width, this.y + (this.width * 2));
    // move one right
    ctx.lineTo(this.x, this.y + (this.width * 2));
    // move two up to close loop
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.restore();
  }

}

export class Zig extends ShapeActions implements Shape {
  public type: Shape['type'] = 'Zig';
  public readonly width: number;

  constructor(width: number, x: number = 0, y: number = 0) {
    super(width, x, y);
    this.width = width
    this.setCenterPoints();
  }

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.applyRotation(ctx, this.centerX, this.centerY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    // move two right
    ctx.lineTo(this.x + (this.width * 2), this.y);
    // move one down
    ctx.lineTo(this.x + (this.width * 2), this.y + this.width);
    // move one right
    ctx.lineTo(this.x + (this.width * 3), this.y + this.width);
    // move one down
    ctx.lineTo(this.x + (this.width * 3), this.y + (this.width * 2));
    // move two left
    ctx.lineTo(this.x + this.width, this.y + (this.width * 2));
    // move one up
    ctx.lineTo(this.x + this.width, this.y + this.width);
    // move one left
    ctx.lineTo(this.x, this.y + this.width);
    // move one up to close loop
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.restore();
  }

}

export class Zag extends ShapeActions implements Shape {
  public type: Shape['type'] = 'Zag';
  public readonly width: number;

  constructor(width: number, x: number = 0, y: number = 0) {
    super(width, x, y);
    this.width = width
    this.setCenterPoints()
  }

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.applyRotation(ctx, this.centerX, this.centerY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    // move two right
    ctx.lineTo(this.x + (this.width * 2), this.y);
    // move one down
    ctx.lineTo(this.x + (this.width * 2), this.y + this.width);
    // move one left
    ctx.lineTo(this.x + this.width, this.y + this.width);
    // move one down
    ctx.lineTo(this.x + this.width, this.y + (this.width * 2));
    // move two left
    ctx.lineTo(this.x - this.width, this.y + (this.width * 2));
    // move one up
    ctx.lineTo(this.x - this.width, this.y + this.width);
    // move one right
    ctx.lineTo(this.x, this.y + this.width);
    // move one up to close loop
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.restore();
  }

}

export class Line extends ShapeActions implements Shape {
  public type: Shape['type'] = 'Line';
  public readonly width: number;

  constructor(width: number, x: number = 0, y: number = 0) {
    super(width, x, y);
    this.width = width
    this.setCenterPoints();
  }

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.applyRotation(ctx, this.centerX, this.centerY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    // move one right
    ctx.lineTo(this.x + this.width, this.y);
    // move four down
    ctx.lineTo(this.x + this.width, this.y + (this.width * 4));
    // move one left
    ctx.lineTo(this.x, this.y + (this.width * 4));
    // move four up to close loop
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.restore();
  }

}

export class Block extends ShapeActions implements Shape {
  public type: Shape['type'] = 'Block';
  public readonly width: number;

  constructor(width: number, x: number = 0, y: number = 0) {
    super(width, x, y);
    this.width = width;
    this.setCenterPoints();
  }

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    this.applyRotation(ctx, this.centerX, this.centerY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    // move two right
    ctx.lineTo(this.x + (this.width * 2), this.y);
    // move two down
    ctx.lineTo(this.x + (this.width * 2), this.y + (this.width * 2));
    // move two left
    ctx.lineTo(this.x, this.y + (this.width * 2));
    // move two up to close loop
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.fillStyle = 'skyblue';
    ctx.fill();
    ctx.restore();
  }

}