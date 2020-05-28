/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import History from './history';
import { search } from './search.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

import '../css/bootstrap.min.css'
import '../css/popup.css';

function Popup() {
  return (
    <div className="App">
      <Navbar variant="dark">
        <Navbar.Brand>Sign Search</Navbar.Brand>
        <InputGroup className="input-group-sm">
          <Form.Control
            placeholder="Search"
            aria-label="Search bar"
          />
          <InputGroup.Append>
            <Button id='go-btn' variant="outline-secondary" size="sm">Go</Button>
          </InputGroup.Append>
        </InputGroup>
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
  document.getElementById('go-btn').addEventListener('click', onclick, false)
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
