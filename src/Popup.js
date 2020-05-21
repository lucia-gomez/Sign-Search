/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import History from './js/history';
import { search } from './search.js';

import './css/bootstrap.min.css'
import './css/popup.css';

function Popup() {
  return (
    <div className="App">
      <div class='flex-right'>
        <h3>Sign Search</h3>
        <input type='text' placeholder="Ex: dog" />
        <Button variant="primary" size="sm">Go</Button>
      </div>
      <div id='container'></div>
      <div id='history' />
    </div>
  );
}

document.addEventListener('DOMContentLoaded', function () {
  const history = ReactDOM.render(
    <History />,
    document.getElementById('history')
  )
  document.querySelector('button').addEventListener('click', onclick, false)
  async function onclick() {
    await search(history)
  }
}, false)

chrome.tabs.executeScript({
  code: "window.getSelection().toString();"
}, function (selection) {
  const input = document.querySelector('input')
  if (selection && selection.length > 0)
    input.value = selection[0]
  else
    input.value = ''
});

export default Popup;
