const SOURCES = ['LIFEPRINT']
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
        const images = parseImages(response, source)
        // TODO: decide how many images to render. just 1 for now
        for (let i = 0; i < 1; i++) {
          const img_src = await makeRequest(images[i].src, 'blob')
          render(img_src)
        }
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

function parseImages(response, source) {
  if (source == 'LIFEPRINT') {
    if (!response.querySelector('blockquote'))
      return
    return response.querySelector('blockquote').getElementsByTagName("img");
  }
  return []
}

function render(img_src) {
  const display = document.createElement('img')
  display.src = window.URL.createObjectURL(img_src);
  RESULTS.appendChild(display)
}

function noResult() {
  const error = document.createElement('p')
  const msg = document.createTextNode('No results')
  error.appendChild(msg)
  RESULTS.appendChild(error)
}