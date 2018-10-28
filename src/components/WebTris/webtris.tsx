import * as React from 'react';
import TetrisEngine, { TetrisState, StatsPiece } from '../../lib/tetris-engine';

interface StatsProps {
  piece: StatsPiece;
  blockWidth: number;
}
const PieceWithStats: React.StatelessComponent<StatsProps> = (
  props: StatsProps
): React.ReactElement<StatsProps> => {
  return (
    <div key={props.piece.type}>
      <canvas
        id={`stats-canvas-${props.piece.type}`}
        width={props.blockWidth * 4}
        height={props.piece.shape.length * props.blockWidth}
        style={{
          marginTop: props.blockWidth,
          marginRight: props.blockWidth,
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          fontSize: 20,
          color: 'grey',
          bottom: props.piece.shape.length * (props.blockWidth / 4)
        }}
      >
        {props.piece.stats}
      </div>
    </div>
  );
}

interface SideCarLeftProps {
  width: number;
  height: number;
  blockWidth: number;
  stats: TetrisState['stats'];
}
const SideCarLeft: React.StatelessComponent<SideCarLeftProps> = (
  props: SideCarLeftProps
): React.ReactElement<SideCarLeftProps> => {
  let pieces: React.ReactElement<StatsProps>[] = [];
  let p: keyof SideCarLeftProps['stats'];
  for (p in props.stats) {
    pieces.push(
      <PieceWithStats
        piece={props.stats[p]}
        blockWidth={props.blockWidth}
      />
    );
  }
  return (
    <div
      className='side-car-left'
      style={{
        display: 'inline-block',
        width: props.width,
        height: props.height,
        border: '5px solid grey',
        marginRight: '25px',
        verticalAlign: 'top',
        backgroundColor: 'midnightblue'
      }}
    >
      {pieces}
    </div>
  );
}

interface GameOverProps {
  gameover: boolean;
  playAgain(): void;
}
const GameOver: React.StatelessComponent<GameOverProps> = (
  props: GameOverProps
  ): React.ReactElement<GameOverProps> | null => {
  if (!props.gameover) { return null; }
  return (
    <div>
      <h3>Game Over!!</h3>
      <button onClick={props.playAgain}>
        Play Again
        </button>
    </div>
  );
}

interface SideCarRightProps {
  width: number;
  height: number;
  blockWidth: number;
  nextShape: Array<number[]>;
  level: number;
  score: number;
  gameover: boolean;
  playAgain(): void;
}
const SideCarRight: React.StatelessComponent<SideCarRightProps> = (
  props: SideCarRightProps
): React.ReactElement<SideCarRightProps> => {
  return (
    <div
      style={{
        display: 'inline-block',
        width: props.width,
        height: props.height,
        border: '5px solid grey',
        verticalAlign: 'top',
        backgroundColor: 'midnightblue'
      }}
    >
      <div
        style={{
          marginTop: props.width / 6
        }}
      >
        Level: {props.level}<br /><br />
        Score: {props.score}<br /><br />
        <GameOver gameover={props.gameover} playAgain={props.playAgain} />
      </div>
      <canvas
        id='next-canvas'
        width={props.nextShape[0].length * 2 * props.blockWidth}
        height={props.nextShape.length * 2 * props.blockWidth}
        style={{ marginTop: 25, border: '5px solid grey' }}
      />
    </div>
  );
}

interface BoardProps {
  canvasWidth: number;
  canvasHeight: number;
  clearedLines: number;
}
const Board: React.StatelessComponent<BoardProps> = (
  props: BoardProps
): React.ReactElement<BoardProps> => {
  return (
    <div
      className='board-container'
      style={{
        display: 'inline-block',
        marginRight: '25px',
        verticalAlign: 'top',
      }}
    >
      <div
        style={{
          padding: '5px 0',
          borderTop: '5px solid grey',
          borderLeft: '5px solid grey',
          borderRight: '5px solid grey',
          boxSizing: 'border-box',
          fontSize: 16,
          fontFamily: 'Georgia',
          backgroundColor: 'midnightblue'
        }}
      >
        Lines Cleared: {props.clearedLines}
      </div>
      <canvas
        id='board-canvas'
        style={{ border: '5px solid grey', backgroundColor: 'midnightblue' }}
        width={props.canvasWidth}
        height={props.canvasHeight}
      />
    </div>
  );
}

interface WebtrisProps {
  blockWidth: number;
  canvasWidth: number;
  canvasHeight: number;
  stats: TetrisEngine['stats'];
  level: number;
  score: number;
  clearedLines: number;
  nextShape: Array<number[]>;
  gameover: boolean;
  playAgain(): void;
}

export const Webtris: React.StatelessComponent<WebtrisProps> = (
  props: WebtrisProps
): React.ReactElement<WebtrisProps> => {
  return (
    <div style={{
        backgroundImage: 'url(./images/tetris-background.png)',
        width: '100vw',
        height: '100vh',
        textAlign: 'center',
        color: 'white',
        verticalAlign: 'top',
        paddingTop: 25,
        fontFamily: 'Georgia',
        letterSpacing: 2
      }}
    >
      <SideCarLeft
        width={props.canvasWidth}
        height={props.canvasHeight}
        blockWidth={props.blockWidth}
        stats={props.stats}
      />
      <Board
        canvasWidth={props.canvasWidth}
        canvasHeight={props.canvasHeight}
        clearedLines={props.clearedLines}
      />
      <SideCarRight
        width={props.canvasWidth}
        height={props.canvasHeight}
        blockWidth={props.blockWidth}
        nextShape={props.nextShape}
        level={props.level}
        score={props.score}
        gameover={props.gameover}
        playAgain={props.playAgain}
      />
    </div>
  );
}