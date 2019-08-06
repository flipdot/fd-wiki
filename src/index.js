import React from 'react';
import { render } from 'react-dom';

import App from './App';

import { handleOAuth } from './api';

if (window.location.hash === '#oauth') {
  handleOAuth().then(() => {
    window.location.assign('/');
  });
} else {
  render(<App />, document.getElementById('app'));
}
