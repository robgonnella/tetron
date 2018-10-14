import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Webtris from '../components/webtris';

const props = { blockWidth: 20 };
ReactDOM.render(
  <Webtris { ...props }/>,
  document.getElementById('mount-point')
);