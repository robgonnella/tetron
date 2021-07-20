import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebTris, WebTrisProps } from 'webtris';


const props: WebTrisProps = {
  rotateLeftKey: 'Control',
  rotateRightKey: 'Meta',
  moveLeftKey: 'ArrowLeft',
  moveRightKey: 'ArrowRight',
  moveDownKey: 'ArrowDown',
  pauseKey: 'Escape',
  tetrisThemeSrc: 'audio/tetris-theme.m4a',
  rotateAudioSrc: 'audio/block-rotate.mp3',
  lineRemovalAudioSrc: 'audio/line-remove.mp3',
  lineRemoval4AudioSrc: 'audio/line-removal4.mp3',
  hitAudioSrc: 'audio/slow-hit.mp3',
  backgroundImage: 'images/tetris-background.png',
  blockWidth: 20
};

ReactDOM.render(
  <WebTris { ...props }/>,
  document.getElementById('mount-point')
);