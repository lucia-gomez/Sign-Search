const SOURCES = ['LIFEPRINT']
const RESULTS = document.getElementById('results');

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', onclick, false)
  async function onclick() {
    RESULTS.innerHTML = ''
    const input = processText(document.querySelector('input').value)
    for (const source of SOURCES) {
      const query = getQuery(input, source)
      await makeRequest(query, source)
    }
    console.log(RESULTS.childElementCount)
    if (RESULTS.childElementCount == 0)
      noResult()
  }
}, false)

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

function processText(input) {
  return input.toLowerCase().trim()
}

function getQuery(input, source) {
  if (source == 'LIFEPRINT') {
    return 'http://www.lifeprint.com/asl101/pages-signs/' + input[0] + '/' + input
  }
}

function queryCORSProxy(query) {
  // my CORS Anywhere proxy server
  return 'https://peaceful-stream-10554.herokuapp.com/' + query;
}

async function makeRequest(query, source) {
  const http = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  http.open('GET', queryCORSProxy(query), true);
  http.responseType = 'document'
  http.onreadystatechange = async function () {
    if (this.readyState !== 4)
      return
    if (this.status !== 200)
      return
    else {
      const images = parseImages(this.response, source)
      for (let i = 0; i < 1; i++)
        makeImageRequest(images[i].src)
    }
  };
  http.send()
}

function makeImageRequest(img_src) {
  const http = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  http.open('GET', img_src);
  http.responseType = 'blob';
  http.onload = function (e) {
    outputContent(this.response)
  };
  http.send();
}

function parseImages(response, source) {
  if (source == 'LIFEPRINT') {
    if (!response.querySelector('blockquote'))
      return
    return response.querySelector('blockquote').getElementsByTagName("img");
  }
  return []
}

function outputContent(img_src) {
  const display = document.createElement('img')
  display.src = window.URL.createObjectURL(img_src);
  RESULTS.appendChild(display)
  console.log(RESULTS.childElementCount)
}

function noResult() {
  const error = document.createElement('p')
  const msg = document.createTextNode('No results')
  error.appendChild(msg)
  RESULTS.appendChild(error)
}