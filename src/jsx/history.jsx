/* eslint-disable import/first */
/* global chrome */
import React from 'react'
import Button from 'react-bootstrap/Button';

class History extends React.Component {
  constructor(props) {
    super(props)
    this.key = 'search_history'
    this.maxLength = 100
    this.numDisplay = 5
    this.state = {}
    this.init()
  }

  init() {
    chrome.storage.local.get(this.key, function (hist) {
      if (!hist.search_history)
        chrome.storage.local.set({ search_history: [] })
    })
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
    hist.push(query)
    chrome.storage.local.set({ [this.key]: hist })
  }

  render() {
    return (
      <Button id='history-btn'>History</Button>
    )
  }
}

export default History