/* global ActiveXObject */
import React from 'react';
import ReactDOM from 'react-dom';
import ResultList from './js/result-list';
import ResultSection from './js/result-section';
import ResultImage from './js/result-image';
import ResultVideo from './js/result-video';
import ResultIFrame from './js/result-iframe';

import Button from 'react-bootstrap/Button';

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
const CORS_PROXY = 'https://peaceful-stream-10554.herokuapp.com/'
const MAX_REL_SIGNS_PER_SRC = 5

export async function search(history) {
  const results = ReactDOM.render(
    <ResultList />,
    document.getElementById('container')
  )
  results.reset()
  history.close()
  const input = processText(document.querySelector('input').value)

  for (const source of Object.values(SOURCES)) {
    const query = getQuery(input, source)
    try {
      const response = await makeRequest(getQueryCORSProxy(query), 'document')
      const [media, relatedSigns] = await parseMedia(response, source, input)
      console.log('list', relatedSigns)
      await selectAndRenderMedia(media, source, query, results)
      selectAndRenderRelatedSigns(relatedSigns, source, results, history)
    }
    catch (err) { }
  }
  results.finishedLoading()
  history.add(input)
}

function processText(input) {
  // TODO: stemming or lemmatization?
  return input.toLowerCase().trim()
}

function getQuery(input, source) {
  switch (source) {
    case SOURCES.LIFEPRINT:
      const i = input.replace(" ", "-")
      return 'http://www.lifeprint.com/asl101/pages-signs/' + i[0] + '/' + i
    case SOURCES.SPREAD_THE_SIGN:
      return 'https://www.spreadthesign.com/en.us/search/?q=' + input
    default:
      return ''
  }
}

function getQueryCORSProxy(query) {
  // my CORS Anywhere proxy server
  return CORS_PROXY + query;
}

function removeCORSProxy(query) {
  return query.replace(CORS_PROXY, '')
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

async function selectAndRenderRelatedSigns(relatedSigns, source, results, history) {
  let i = 0
  for (const relatedSign of relatedSigns) {
    if (i < MAX_REL_SIGNS_PER_SRC) {
      if (source !== SOURCES.SPREAD_THE_SIGN ||
        (source === SOURCES.SPREAD_THE_SIGN && await checkPageHasVideo(relatedSign.url))) {
        i++
        const name = processText(relatedSign.name)
        results.addRelatedSign(<Button
          variant="link"
          onClick={() => {
            document.querySelector('input').value = name;
            search(history);
          }}>{name}</Button>)
      }
    } else { break }
  }
}

// pull media from webpages
// returns: dict<MEDIA_TYPE.value, [Element]>
async function parseMedia(response, source, input) {
  const media = {}
  const relatedSigns = []
  Object.values(MEDIA_TYPE).forEach(type => {
    media[type] = []
  })
  switch (source) {
    case SOURCES.LIFEPRINT:
      parseLifeprint(media, relatedSigns, response, input)
      break;
    case SOURCES.SPREAD_THE_SIGN:
      await parseSpreadTheSign(media, relatedSigns, response, input)
      break;
    default:
  }
  return [media, relatedSigns]
}

function parseLifeprint(media, relatedSigns, response, input) {
  const body = response.querySelector('body')
  const imgs = body.getElementsByTagName("img")
  for (const img of imgs) {
    const key = img.src.includes('.gif') ? MEDIA_TYPE.GIF : MEDIA_TYPE.IMAGE
    if (!lifeprintExclude(img.src))
      media[key].push(img)
  }
  media[MEDIA_TYPE.IFRAME] = body.getElementsByTagName("iframe")

  // scan links for related signs and animated gifs
  const seenLinks = []
  for (const link of body.querySelectorAll('a')) {
    const url = link.href
    // animated gifs
    if (url.includes('.gif') && !lifeprintExclude(url)) {
      const dummyImage = document.createElement('img')
      dummyImage.src = url
      media[MEDIA_TYPE.GIF].push(dummyImage)
    } // related signs
    else if (!seenLinks.includes(url) && checkLifeprintSignURL(url)) {
      try {
        // "advanced discussion" links sometimes have numbers
        const name = lifeprintSignFromURL(url).replace(/[0-9]/g, '');
        if (name !== input)
          relatedSigns.push({ name: name, url: url })
      } catch (err) { }
    }
    seenLinks.push(url)
  }
  return [media, relatedSigns]
}

function lifeprintExclude(src) {
  const exclude = [
    "images-layout/next.gif",
    "images-layout/concepts.gif",
    "images-layout/back.gif",
    "fingerspelling/abc-gifs"]
  for (const ex of exclude) {
    if (src.includes(ex))
      return true
  }
  return false
}

function lifeprintSignFromURL(url) {
  return url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."))
}

function checkLifeprintSignURL(url) {
  const name = lifeprintSignFromURL(url)
  return url.includes('/' + name[0] + '/' + name)
  // return url.includes('asl101') && !lifeprintExclude(url)
}

async function parseSpreadTheSign(media, relatedSigns, response, input) {
  // get first video + caption
  media = parseSpreadTheSignMedia(media, response)
  // scan the list of results for others with same name (parts of speech, homophones, etc)
  const results = response.getElementsByClassName('search-result')
  for (let i = 1; i < results.length; i++) {
    const text = results[i].innerText.trim()
    // ignores part of speech tag
    const name = processText(text.substring(0, text.lastIndexOf(' ')))
    const url = 'https://www.spreadthesign.com/' + removeCORSProxy(results[i].querySelector('a').href)
    if (name === input) {
      // query the search result's link
      const response2 = await makeRequest(getQueryCORSProxy(url), 'document')
      media = parseSpreadTheSignMedia(media, response2)
    } else {
      relatedSigns.push({ name: name, url: url })
    }
  }
  return [media, relatedSigns]
}

function parseSpreadTheSignMedia(media, response) {
  const video = response.getElementsByTagName('video')
  if (video.length > 0) {
    try {
      const caption = response.getElementsByClassName('result-description')[0].innerText.trim()
      media[MEDIA_TYPE.VIDEO].push({ video: video[0], caption: caption })
    } catch (err) {
      media[MEDIA_TYPE.VIDEO].push({ video: video[0], caption: null })
    }
  }
  return media
}

async function checkPageHasVideo(url) {
  const response = await makeRequest(getQueryCORSProxy(url), 'document')
  return response.getElementsByTagName('video').length > 0
}

async function selectAndRenderMedia(media, source, query, results) {
  const children = []
  let hasVideo = false, hasGif = false
  if (media[MEDIA_TYPE.VIDEO].length > 0) {
    for (const item of media[MEDIA_TYPE.VIDEO]) {
      children.push(renderVideo(item))
    }
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

function renderVideo(item) {
  return <ResultVideo src={item.video.src} caption={item.caption} />
}