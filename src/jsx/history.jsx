/* eslint-disable import/first */
/* eslint default-case: "off", no-fallthrough: "off" */
/* global chrome */
import React from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'
import { search } from '../js/search.js';
import NothingGIF from '../assets/nothing.gif'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

class History extends React.Component {
  constructor(props) {
    super(props)
    this.key = 'search_history'
    this.maxLength = 100
    this.numDisplay = 5
    this.state = { open: false, searches: [] }
    this.clear = this.clear.bind(this)
    this.click = this.click.bind(this)
    this.growDiv = this.growDiv.bind(this)
    this.remove = this.remove.bind(this)
    this.search = search
    this.init()
  }

  async init() {
    await chrome.storage.local.get(this.key, function (hist) {
      if (!hist.search_history)
        chrome.storage.local.set({ search_history: [] })
    })
    const hist = await this.get()
    this.setState({ searches: hist })
  }

  async clear() {
    chrome.storage.local.set({ search_history: [] })
    this.setState({ searches: [] })
  }

  async get() {
    return new Promise(function (resolve, _) {
      chrome.storage.local.get('search_history', function (hist) {
        resolve(hist.search_history)
      })
    })
  }

  async add(query) {
    if (query.length === 0)
      return
    const hist = await this.get()
    if (hist.length === this.maxLength)
      hist.shift()
    hist.unshift(query)
    this.setState({ searches: hist })
    chrome.storage.local.set({ [this.key]: hist })
  }

  async remove(index) {
    const hist = this.state.searches
    hist.splice(index, 1)
    this.setState({ searches: hist })
    chrome.storage.local.set({ [this.key]: hist })
  }

  async click() {
    this.setState(prevState => ({
      open: !(prevState.open)
    }))
  }

  close() {
    this.setState({ open: false })
  }

  growDiv() {
    const growDiv = document.getElementById('grow')
    if (!this.state.open) {
      growDiv.style.height = 0
    } else {
      const wrapper = document.getElementById('measuringWrapper')
      growDiv.style.height = Math.floor(wrapper.offsetHeight) + "px"
    }
  }

  componentDidUpdate() {
    this.growDiv()
  }

  render() {
    const noHistory = <img src={NothingGIF} onLoad={this.growDiv} style={{ width: '100%' }} />
    return (
      <div>
        <div id='grow'>
          <div id='measuringWrapper'>
            {this.state.searches.length === 0 ? noHistory :
              <ListGroup id='search-list'>
                {this.state.searches.map((search, key) => (
                  <div className='list-group-item-flex'>
                    <ListGroup.Item key={key} onClick={() => {
                      document.querySelector('input').value = search;
                      this.search(this);
                    }}>{search}
                    </ListGroup.Item>
                    <FontAwesomeIcon icon={faTimesCircle} onClick={() => this.remove(key)} className='icon' />
                  </div>
                ))}
              </ListGroup>}
            <Button onClick={this.clear} id='clear-btn'>Clear</Button>
          </div>
        </div>
        <div className='history-border'></div>
      </div>
    )
  }
}

export default History