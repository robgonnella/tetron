import * as React from 'react';
import TetrisEngine from '../../lib/tetris-engine';

interface WebtrisProps {
  blockWidth: number;
  canvasWidth: number;
  canvasHeight: number;
  stats: TetrisEngine['stats'];
  level: number;
  score: number;
  clearedLines: number;
  nextPiece: Array<number[]>;
  gameover: boolean;
  playAgain(): void;
}

export const Webtris: React.StatelessComponent<WebtrisProps> = (
  props: WebtrisProps
): React.ReactElement<WebtrisProps> => {
  const statsStyle = {
    fontFamily: 'Georgia',
    padding: `18px 10px`,

  };
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
          paddingTop: props.blockWidth * 4
        }}
      >
        <div
          className='side-car-left'
          style={{
            display: 'inline-block',
            borderRight: '3px solid black',
            width: props.canvasWidth,
            height: props.canvasHeight,
            border: '5px solid grey',
            marginRight: '25px',
            verticalAlign: 'top',
            backgroundColor: 'midnightblue'
          }}
        >
          <canvas
            id='stats-canvas'
            width={props.canvasWidth/2}
            height={props.canvasHeight}
            style={{
              marginTop: props.blockWidth + (props.blockWidth / 2)
            }}
          />
          <div
            className='stats-numbers'
            style={{
              display: 'inline-block',
              fontSize: 20,
              color: 'grey',
              verticalAlign: 'top',
              marginTop: props.blockWidth
            }}
          >
            <div style={statsStyle}>{props.stats.T.stats}</div>
            <div style={statsStyle}>{props.stats.L.stats}</div>
            <div style={statsStyle}>{props.stats.RL.stats}</div>
            <div style={statsStyle}>{props.stats.Zig.stats}</div>
            <div style={statsStyle}>{props.stats.Zag.stats}</div>
            <div style={statsStyle}>{props.stats.Line.stats}</div>
            <div style={statsStyle}>{props.stats.Block.stats}</div>
          </div>
        </div>
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
            style={{border: '5px solid grey', backgroundColor: 'midnightblue'}}
            width={props.canvasWidth}
            height={props.canvasHeight}
          />
        </div>
        <div
          className='side-car-right'
          style={{
            display: 'inline-block',
            width: props.canvasWidth,
            height: props.canvasHeight,
            border: '5px solid grey',
            verticalAlign: 'top',
            backgroundColor: 'midnightblue'
          }}
        >
          <div
            style={{
              marginTop: props.canvasHeight / 6
            }}
          >
            Level: {props.level}<br/><br/>
            Score: {props.score}<br/><br/>
            <GameOver gameover={props.gameover} playAgain={props.playAgain} />
          </div>
          <canvas
            id='next-canvas'
            width={props.nextPiece[0].length * 2 * props.blockWidth}
            height={props.nextPiece.length * 2 * props.blockWidth}
            style={{marginTop: 25, border: '5px solid grey'}}
          />
        </div>
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