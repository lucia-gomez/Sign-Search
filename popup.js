const SOURCES = ['LIFEPRINT']
const SOURCE_DISPLAY_NAME = { 'LIFEPRINT': 'LifePrint' }
const RESULTS = document.getElementById('results');

// populate the textfield with the current selected text, if any
chrome.tabs.executeScript({
  code: "window.getSelection().toString();"
}, function (selection) {
  const input = document.querySelector('input')
  if (selection && selection.length > 0)
    input.value = selection[0]
  else
    input.value = ''
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', onclick, false)
  async function onclick() {
    RESULTS.innerHTML = ''
    const input = processText(document.querySelector('input').value)
    for (const source of SOURCES) {
      const query = getQuery(input, source)
      try {
        const response = await makeRequest(getQueryCORSProxy(query), 'document')
        const media = parseMedia(response, source)
        await selectAndRenderMedia(media, source, query)
      }
      catch (err) { }
    }
    if (RESULTS.childElementCount == 0)
      noResult()
  }
}, false)

function processText(input) {
  return input.toLowerCase().trim()
}

function getQuery(input, source) {
  if (source == 'LIFEPRINT') {
    return 'http://www.lifeprint.com/asl101/pages-signs/' + input[0] + '/' + input
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
      if (this.readyState == 4) {
        if (this.status == 200)
          resolve(this.response)
        else
          reject('Not found')
      }
    }
    http.open('GET', query)
    http.send()
  })
}

function parseMedia(response, source) {
  let media = {}
  if (source == 'LIFEPRINT') {
    if (!response.querySelector('blockquote'))
      return
    media['image'] = []
    media['gif'] = []
    for (const img of response.querySelector('blockquote').getElementsByTagName("img")) {
      const key = img.src.includes('.gif') ? 'gif' : 'image'
      media[key].push(img)
    }
    media['iframe'] = response.querySelector('blockquote').getElementsByTagName("iframe")
  }
  return media
}

async function selectAndRenderMedia(media, source, query) {
  renderSourceName(source, query)
  if (media['iframe'].length > 0)
    renderIFrame(media['iframe'][0])
  if (media['gif'].length > 0) {
    const img_src = await makeRequest(media['gif'][0].src, 'blob')
    renderImage(img_src)
  }
  // static images as a last resort
  if (media['iframe'].length == 0 && media['gif'].length == 0) {
    if (media['image'].length > 0) {
      const img_src = await makeRequest(media['image'][0].src, 'blob')
      renderImage(img_src)
    }
  }
}

function renderImage(img_src) {
  const display = document.createElement('img')
  display.src = window.URL.createObjectURL(img_src);
  RESULTS.appendChild(display)
}

function renderIFrame(iframe) {
  const display = document.createElement('iframe')
  display.src = iframe.src
  RESULTS.appendChild(display)
}

function renderSourceName(source, query) {
  const title = document.createElement('a')
  title.appendChild(document.createTextNode(SOURCE_DISPLAY_NAME[source]))
  title.href = query
  title.target = '_blank'
  RESULTS.appendChild(title)
}

function noResult() {
  const error = document.createElement('p')
  error.appendChild(document.createTextNode('No results'))
  RESULTS.appendChild(error)
}