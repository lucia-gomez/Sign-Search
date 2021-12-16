/* eslint-disable import/first */
/* eslint default-case: "off", no-fallthrough: "off", no-loop-func: "off" */
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
    chrome.storage.local.get(this.key, async function (hist) {
      if (!hist.search_history)
        await chrome.storage.local.set({ search_history: [] })
      const _get = function (hist) {
        this.setState({ searches: hist.search_history })
      }.bind(this)
      await this.get(_get)
    }.bind(this))
  }

  async clear() {
    chrome.storage.local.set({ search_history: [] })
    this.setState({ searches: [] })
  }

  async get(callback) {
    await chrome.storage.local.get(this.key, callback)
  }

  async add(query) {
    if (query.length === 0)
      return
    const _add = function (histObj) {
      const hist = histObj.search_history
      if (hist.length === this.maxLength)
        hist.shift()
      hist.unshift(query)
      this.setState({ searches: hist })
      chrome.storage.local.set({ [this.key]: hist })
    }.bind(this)
    await this.get(_add)
  }

  async remove(index) {
    const item = document.getElementById('list-group-item-flex-' + index)
    item.classList.add('remove')
    const _this = this
    setTimeout(function () {
      const hist = _this.state.searches
      hist.splice(index, 1)
      _this.setState({ searches: hist })
      try {
        item.classList.remove('remove')
      } catch (err) { }
      _this.growDiv()
      chrome.storage.local.set({ [_this.key]: hist })
    }, 400);
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
                  <div className='list-group-item-flex' id={'list-group-item-flex-' + key}>
                    <ListGroup.Item key={key} onClick={() => {
                      document.querySelector('input').value = search;
                      this.search(this);
                    }}>{search}
                    </ListGroup.Item>
                    <FontAwesomeIcon icon={faTimesCircle} onClick={() => this.remove(key)} className='icon' />
                  </div>
                ))}
              </ListGroup>}
            <Button onClick={this.clear} id='clear-btn' variant="secondary">Clear</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default History