
export interface Shape {
  type: 'L' | 'ReverseL' | 'Line' | 'Block' | 'Zig' | 'Zag';
  width: number;
  draw(ctx: CanvasRenderingContext2D): void;
  setCenterPoints(): void;
  moveRight(): void;
  moveLeft(): void
  rotateRight(): void;
  rotateLeft(): void;
  accelerate(): void;
  applyRotation(ctx: CanvasRenderingContext2D, cX: number, cY: number): void;
  moveUp(): void;
  moveDown(): void;
}
