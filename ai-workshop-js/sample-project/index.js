import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App.jsx';
import { userService } from './services/userService.js';

// Initialize app
userService.getUser('default').then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
