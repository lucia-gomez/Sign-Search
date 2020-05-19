const SOURCES = ['SPREADTHESIGN', 'LIFEPRINT']
const SOURCE_DISPLAY_NAME = { 'LIFEPRINT': 'Lifeprint', 'SPREADTHESIGN': 'Spread the Sign' }
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
  // TODO: stemming or lemmatization?
  return input.toLowerCase().trim()
}

function getQuery(input, source) {
  if (source == 'LIFEPRINT')
    return 'http://www.lifeprint.com/asl101/pages-signs/' + input[0] + '/' + input
  else if (source == 'SPREADTHESIGN')
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
  let media = { 'video': [], 'image': [], 'gif': [], 'iframe': [] }
  if (source == 'LIFEPRINT') {
    if (!response.querySelector('blockquote'))
      return
    for (const img of response.querySelector('blockquote').getElementsByTagName("img")) {
      const key = img.src.includes('.gif') ? 'gif' : 'image'
      media[key].push(img)
    }
    media['iframe'] = response.querySelector('blockquote').getElementsByTagName("iframe")
  } else if (source == 'SPREADTHESIGN') {
    media['video'] = response.getElementsByTagName('video')
    console.log('num videos', media['video'])
  }
  return media
}

async function selectAndRenderMedia(media, source, query) {
  let children = []
  if (media['video'].length > 0)
    children.push(renderVideo(media['video'][0]))
  if (media['iframe'].length > 0)
    children.push(renderIFrame(media['iframe'][0]))
  if (media['gif'].length > 0) {
    const img_src = await makeRequest(media['gif'][0].src, 'blob')
    children.push(renderImage(img_src))
  }
  // static images as a last resort
  if (media['iframe'].length == 0 && media['gif'].length == 0) {
    if (media['image'].length > 0) {
      const img_src = await makeRequest(media['image'][0].src, 'blob')
      children.push(renderImage(img_src))
    }
  }

  if (children.length > 0)
    renderResultSection(source, query, children)
}

function renderResultSection(source, query, children) {
  const section = document.createElement('section')
  section.appendChild(renderSourceName(source, query))
  children.forEach(child => {
    section.appendChild(child)
  });
  RESULTS.appendChild(section)
}

function renderImage(img_src) {
  const display = document.createElement('img')
  display.src = window.URL.createObjectURL(img_src);
  return display
}

function renderIFrame(iframe) {
  const display = document.createElement('iframe')
  display.src = iframe.src
  return display
}

function renderVideo(video) {
  const display = document.createElement('video')
  display.src = video.src
  display.autoplay = true;
  display.loop = true;
  display.muted = true;
  return display
}

function renderSourceName(source, query) {
  const title = document.createElement('a')
  title.appendChild(document.createTextNode('View on ' + SOURCE_DISPLAY_NAME[source]))
  title.href = query
  title.target = '_blank'
  return title
}

function noResult() {
  const error = document.createElement('p')
  error.appendChild(document.createTextNode('No results'))
  error.id = 'no-results'
  RESULTS.appendChild(error)
}