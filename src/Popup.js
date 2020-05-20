/* global chrome */
/* global ActiveXObject */
import React from 'react';
import ReactDOM from 'react-dom';
import ResultList from './js/result-list';
import ResultSection from './js/result-section';
import ResultImage from './js/result-image';
import ResultVideo from './js/result-video';
import ResultIFrame from './js/result-iframe';
import Button from 'react-bootstrap/Button';

import './css/bootstrap.min.css'
import './css/popup.css';

function Popup() {
  return (
    <div className="App">
      <div class='flex-right'>
        <h3>Sign Search</h3>
        <input type='text' placeholder="Ex: dog" />
        <Button variant="primary" size="sm">Go</Button>
        {/* <button type="button" class="btn btn-sm">Go</button> */}
      </div>
      <div id='container' />
    </div>
  );
}

const SOURCES = Object.freeze({
  SPREAD_THE_SIGN: 'Spread the Sign',
  LIFEPRINT: 'Lifeprint'
})
const MEDIA_TYPE = Object.freeze({
  GIF: 0,
  IFRAME: 1,
  IMAGE: 2,
  VIDEO: 3,
})

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', onclick, false)
  async function onclick() {
    const results = ReactDOM.render(
      <ResultList />,
      document.getElementById('container')
    )
    results.reset()
    const input = processText(document.querySelector('input').value)

    for (const source of Object.values(SOURCES)) {
      const query = getQuery(input, source)
      try {
        const response = await makeRequest(getQueryCORSProxy(query), 'document')
        const media = parseMedia(response, source)
        await selectAndRenderMedia(media, source, query, results)
      }
      catch (err) { }
    }

    results.finishedLoading()
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

function processText(input) {
  // TODO: stemming or lemmatization?
  return input.toLowerCase().trim()
}

function getQuery(input, source) {
  switch (source) {
    case SOURCES.LIFEPRINT:
      return 'http://www.lifeprint.com/asl101/pages-signs/' + input[0] + '/' + input
    case SOURCES.SPREAD_THE_SIGN:
      return 'https://www.spreadthesign.com/en.us/search/?q=' + input
    default:
      return ''
  }
}

function getQueryCORSProxy(query) {
  // my CORS Anywhere proxy server
  return 'https://peaceful-stream-10554.herokuapp.com/' + query;
}

async function makeRequest(query, responseType) {
  const http = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
  return new Promise((resolve, reject) => {
    http.responseType = responseType
    http.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200)
          resolve(this.response)
        else
          reject('Not found')
      }
    }
    http.open('GET', query)
    http.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    http.send()
  })
}

// pull media from webpages
// returns: dict<MEDIA_TYPE.value, [Element]>
function parseMedia(response, source) {
  const media = {}
  Object.values(MEDIA_TYPE).forEach(type => {
    media[type] = []
  })
  switch (source) {
    case SOURCES.LIFEPRINT:
      if (!response.querySelector('blockquote'))
        break;
      const imgs = response.querySelector('blockquote').getElementsByTagName("img")
      for (const img of imgs) {
        const key = img.src.includes('.gif') ? MEDIA_TYPE.GIF : MEDIA_TYPE.IMAGE
        media[key].push(img)
      }
      media[MEDIA_TYPE.IFRAME] = response.querySelector('blockquote').getElementsByTagName("iframe")
      break;

    case SOURCES.SPREAD_THE_SIGN:
      media[MEDIA_TYPE.VIDEO] = response.getElementsByTagName('video')
      break;
    default:
  }
  return media
}

async function selectAndRenderMedia(media, source, query, results) {
  const children = []
  let hasVideo = false, hasGif = false
  if (media[MEDIA_TYPE.VIDEO].length > 0) {
    const src = media[MEDIA_TYPE.VIDEO][0].src
    children.push(<ResultVideo src={src} />)
    hasVideo = true
  }
  if (media[MEDIA_TYPE.IFRAME].length > 0) {
    const src = media[MEDIA_TYPE.IFRAME][0].src
    children.push(<ResultIFrame src={src} />)
    hasVideo = true
  }
  if (media[MEDIA_TYPE.GIF].length > 0) {
    const img_src = await makeRequest(media[MEDIA_TYPE.GIF][0].src, 'blob')
    children.push(renderImage(img_src))
    hasGif = true
  }
  // static images as a last resort
  if (!(hasVideo || hasGif)) {
    if (media[MEDIA_TYPE.IMAGE].length > 0) {
      const img_src = await makeRequest(media[MEDIA_TYPE.IMAGE][0].src, 'blob')
      children.push(renderImage(img_src))
    }
  }
  if (children.length > 0)
    renderResultSection(source, query, children, results)
}

function renderResultSection(source, query, children, results) {
  const section = <ResultSection title={source} link={query}>{children}</ResultSection>
  results.addChild(section)
}

function renderImage(img_src) {
  return <ResultImage src={window.URL.createObjectURL(img_src)} />
}

export default Popup;
