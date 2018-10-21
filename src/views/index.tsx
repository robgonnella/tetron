import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WebtrisContainer from '../components/Webtris/webtris-container';

const props = { blockWidth: 20 };
ReactDOM.render(
  <WebtrisContainer { ...props }/>,
  document.getElementById('mount-point')
);