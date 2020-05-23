/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import History from './js/history';
import { search } from './search.js';
import Navbar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

import './css/bootstrap.min.css'
import './css/popup.css';

function Popup() {
  return (
    <div className="App">
      <Navbar variant="dark">
        <Navbar.Brand>Sign Search</Navbar.Brand>
        <input type='text' placeholder="Search" />
        <Button variant="primary" size="sm">Go</Button>
        <div id='container-history-btn' />
      </Navbar>
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
    <Button id='history-btn' onClick={history.click}><FontAwesomeIcon id='icon' icon={faHistory} /></Button>,
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
