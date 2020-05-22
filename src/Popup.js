/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import History from './js/history';
import { search } from './search.js';
import Icon from './assets/history.png';

import './css/bootstrap.min.css'
import './css/popup.css';

function Popup() {
  return (
    <div className="App">
      <div class='flex-right'>
        <h3>Sign Search</h3>
        <input type='text' placeholder="Ex: dog" style={{ width: '150px' }} />
        <Button variant="primary" size="sm">Go</Button>
        <div id='container-history-btn' />
      </div>
      <div id='container-history' />
      <div id='container' />
    </div>
  );
}

document.addEventListener('DOMContentLoaded', function () {
  const history = ReactDOM.render(
    <History />,
    document.getElementById('container-history')
  )
  ReactDOM.render(
    <Button id='history-btn' onClick={history.click}><img src={Icon}></img></Button>,
    document.getElementById('container-history-btn')
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
