/* global chrome */
/* global ActiveXObject */
import React from 'react';
import ReactDOM from 'react-dom';
import './css/popup.css';
import ResultList from './js/result-list';
import ResultSection from './js/result-section';
import ResultImage from './js/result-image';
import ResultVideo from './js/result-video';

function Popup() {
  return (
    <div className="App">
      <div class='flex-right'>
        <h3>Sign Search</h3>
        <input type='text' placeholder="Ex: dog" />
        <button type="button" class="btn btn-sm">Go</button>
      </div>
      <div id='container' />
    </div>
  );
}

const SOURCES = ['SPREADTHESIGN', 'LIFEPRINT']
const SOURCE_DISPLAY_NAME = { 'LIFEPRINT': 'Lifeprint', 'SPREADTHESIGN': 'Spread the Sign' }

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', onclick, false)
  async function onclick() {
    const results = ReactDOM.render(
      <ResultList />,
      document.getElementById('container')
    )
    results.reset()
    const input = processText(document.querySelector('input').value)
    for (const source of SOURCES) {
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
  if (source === 'LIFEPRINT')
    return 'http://www.lifeprint.com/asl101/pages-signs/' + input[0] + '/' + input
  else if (source === 'SPREADTHESIGN')
    return 'https://www.spreadthesign.com/en.us/search/?q=' + input
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

function parseMedia(response, source) {
  let media = { 'video': [], 'image': [], 'gif': [], 'iframe': [] }
  if (source === 'LIFEPRINT') {
    if (!response.querySelector('blockquote'))
      return
    for (const img of response.querySelector('blockquote').getElementsByTagName("img")) {
      const key = img.src.includes('.gif') ? 'gif' : 'image'
      media[key].push(img)
    }
    media['iframe'] = response.querySelector('blockquote').getElementsByTagName("iframe")
  } else if (source === 'SPREADTHESIGN') {
    media['video'] = response.getElementsByTagName('video')
  }
  return media
}

async function selectAndRenderMedia(media, source, query, results) {
  let children = []
  if (media['video'].length > 0)
    children.push(renderVideo(media['video'][0]))
  // if (media['iframe'].length > 0)
  //   children.push(renderIFrame(media['iframe'][0]))
  if (media['gif'].length > 0) {
    const img_src = await makeRequest(media['gif'][0].src, 'blob')
    children.push(renderImage(img_src))
  }
  // static images as a last resort
  if (media['iframe'].length === 0 && media['gif'].length === 0) {
    if (media['image'].length > 0) {
      const img_src = await makeRequest(media['image'][0].src, 'blob')
      children.push(renderImage(img_src))
    }
  }

  if (children.length > 0)
    renderResultSection(source, query, children, results)
}

function renderResultSection(source, query, children, results) {
  const section = <ResultSection title={SOURCE_DISPLAY_NAME[source]} link={query}>{children}</ResultSection>
  results.addChild(section)
}

function renderImage(img_src) {
  return <ResultImage src={window.URL.createObjectURL(img_src)} />
}

function renderIFrame(iframe) {
  const display = document.createElement('iframe')
  display.src = iframe.src
  return display
}

function renderVideo(video) {
  return <ResultVideo src={video.src} />
}

export default Popup;
