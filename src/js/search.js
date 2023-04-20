/* global ActiveXObject */
import React from 'react';
import ReactDOM from 'react-dom';
import ResultList from './result-list';
import ResultSection from './result-section';
import ResultImage from './result-image';
import ResultVideo from './result-video';
import ResultIFrame from './result-iframe';

import Button from 'react-bootstrap/Button';
import nlp from 'compromise'

import $ from 'jquery';
import youtube from "../private-keys";

const SOURCES = Object.freeze({
  SPREAD_THE_SIGN: 'Spread the Sign',
  SMART_SIGN_DICTIONARY: 'SmartSign Dictionary',
  LIFEPRINT: 'Lifeprint',
  SIGNING_SAVVY: 'Signing Savvy',
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
  let input = processText(document.querySelector('input').value)
  results.setCurrentQuery(input)
  await searchSources(input, results, history)
  if (results.isEmpty()) {
    const newInput = processNLP(input)
    if (newInput !== input) {
      input = newInput
      results.newSearch(input)
      await searchSources(input, results, history)
    }
  }
  results.finishedLoading()
  history.add(input)
}

async function searchSources(input, results, history) {
  for (const source of Object.values(SOURCES)) {
    const query = getQuery(input, source);

    try {
      const responseType = getSourceResponseType(source);
      const response = await makeRequest(getQueryCORSProxy(query), responseType)
      const [media, relatedSigns] = await parseMedia(response, source, input)
      const linkToSource = getLinkForSource(source, query, input)
      await selectAndRenderMedia(media, source, linkToSource, results)
      selectAndRenderRelatedSigns(relatedSigns, input, source, results, history)
    }
    catch (err) { }
  }
}

function processText(input) {
  return input.toLowerCase().trim()
}

function processNLP(input) {
  const doc = nlp(input.toLowerCase().trim())
  doc.nouns().toSingular()
  doc.verbs().toInfinitive().all()
  return doc.text()
}

function getQuery(input, source) {
  switch (source) {
    case SOURCES.LIFEPRINT:
      const i = input.replace(" ", "-")
      return 'http://www.lifeprint.com/asl101/pages-signs/' + i[0] + '/' + i + '.htm'
    case SOURCES.SPREAD_THE_SIGN:
      return 'https://www.spreadthesign.com/en.us/search/?q=' + input
    case SOURCES.SIGNING_SAVVY:
      return 'https://www.signingsavvy.com/sign/' + input
    case SOURCES.SMART_SIGN_DICTIONARY:
      return 'https://smart-sign-dictionary.herokuapp.com/query/' + input
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

function getLinkForSource(source, query, input) {
  switch (source) {
    case SOURCES.SMART_SIGN_DICTIONARY:
      return 'https://www.youtube.com/user/smartsigndictionary/search?query=' + input;
    default:
      return query;
  }
}

function getSourceResponseType(source) {
  switch (source) {
    case SOURCES.SMART_SIGN_DICTIONARY:
      return 'json';
    default:
      return 'document';
  }
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

async function selectAndRenderRelatedSigns(relatedSigns, input, source, results, history) {
  let i = 0
  for (const relatedSign of relatedSigns) {
    if (results.getCurrentQuery() === input && i < MAX_REL_SIGNS_PER_SRC) {
      if (source !== SOURCES.SPREAD_THE_SIGN ||
        (source === SOURCES.SPREAD_THE_SIGN && await checkPageHasVideo(relatedSign.url))) {
        i++
        const name = processText(relatedSign.name)
        results.addRelatedSign(<Button
          variant="link"
          onClick={() => {
            document.querySelector('input').value = name;
            search(history);
          }}>{name}</Button>, input)
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
    case SOURCES.SIGNING_SAVVY:
      await parseSigningSavvy(media, relatedSigns, response, input)
      break;
    case SOURCES.SMART_SIGN_DICTIONARY:
      await parseSmartSignDictionary(media, relatedSigns, response, input)
      break;
    default:
  }
  return [media, relatedSigns]
}

function parseLifeprint(media, relatedSigns, response, input) {
  const body = response.querySelector('body')
  const imgs = body.getElementsByTagName("img")
  for (const img of imgs) {
    if (!lifeprintExclude(img.src) && img.src.includes('signjpegs'))
      media[MEDIA_TYPE.IMAGE].push(img)
    else {
      const key = img.src.includes('.gif') ? MEDIA_TYPE.GIF : MEDIA_TYPE.IMAGE
      if (!lifeprintExclude(img.src))
        media[key].push(img)
    }
  }

  media[MEDIA_TYPE.IFRAME] = Array.from(body.getElementsByTagName("iframe")).map(item => { return { src: item.src } });

  // scan links for related signs and animated gifs
  const seenLinks = []
  for (const link of body.querySelectorAll('a')) {
    const url = link.href
    // animated gifs
    if (url.includes('.gif') && !lifeprintExclude(url))
      media[MEDIA_TYPE.GIF].push({ src: url })
    // related signs
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
    "images-layout",
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
  // media = parseSpreadTheSignMedia(media, response)
  // scan the list of results for others with same name (parts of speech, homophones, etc)
  const results = response.getElementsByClassName('search-result')
  for (const result of results) {
    const text = result.innerText.trim()
    const i = text.lastIndexOf(' ')
    const name = processText(text.substring(0, i)), partOfSpeech = text.substring(i + 1)
    const url = 'https://www.spreadthesign.com/' + removeCORSProxy(result.querySelector('a').href)
    if (name === input) {
      // query the search result's link
      const response2 = await makeRequest(getQueryCORSProxy(url), 'document')
      media = parseSpreadTheSignMedia(media, partOfSpeech, response2)
    } else {
      relatedSigns.push({ name: name, url: url })
    }
  }
  return [media, relatedSigns]
}

function parseSpreadTheSignMedia(media, partOfSpeech, response) {
  const video = response.getElementsByTagName('video')
  if (video.length > 0) {
    try {
      const caption = response.getElementsByClassName('result-description')[0].innerText.trim()
      media[MEDIA_TYPE.VIDEO].push({ video: video[0], caption: '(' + partOfSpeech + ') ' + caption })
    } catch (err) {
      media[MEDIA_TYPE.VIDEO].push({ video: video[0], caption: '(' + partOfSpeech + ')' })
    }
  }
  return media
}

async function checkPageHasVideo(url) {
  const response = await makeRequest(getQueryCORSProxy(url), 'document')
  return response.getElementsByTagName('video').length > 0
}

async function parseSigningSavvy(media, relatedSigns, response, input) {
  // if there are multiple versions, go through each
  const results = response.getElementsByClassName('search_results')[0]
  if (results) {
    for (const result of results.getElementsByTagName('a')) {
      const response2 = await makeRequest(result.href, 'document')
      parseSigningSavvyMedia(media, response2, input)
    }
  }
  else
    parseSigningSavvyMedia(media, response, input)
  return [media, relatedSigns]
}

function parseSigningSavvyMedia(media, response, input) {
  const video = response.getElementsByClassName('signing_body')[0].querySelector('video').querySelector('source')
  if (video) {
    const name = processText(response.getElementsByClassName('signing_header')[0].querySelector('h2').innerText)
    if (input !== name)
      return
    try {
      let caption = response.getElementsByClassName('signing_header')[0].querySelector('em').innerText
      if (caption[0] === '(')
        caption = nlp(caption).parentheses().json({ normal: true })[0].normal
      media[MEDIA_TYPE.VIDEO].push({ video: video, caption: caption })
    } catch (err) {
      media[MEDIA_TYPE.VIDEO].push({ video: video, caption: "" })
    }
  }
}

async function queryYouTubeIds(ids) {
  return await $.ajax({
    url: getQueryCORSProxy("https://youtube.googleapis.com/youtube/v3/videos"),
    type: "get",
    data: {
      key: youtube,
      part: "snippet",
      id: ids,
      maxResults: 10,
    },
    headers: {
      "X-Requested-With": 'XMLHttpRequest'
    },
    success: data => {
      return data;
    }
  });
}

function cleanSmartSignCaption(title) {
  let caption = title;
  const len = caption.length;
  if (caption.substring(len - 3, len).toUpperCase() === "ASL") {
    caption = caption.substring(0, len - 3);
  }
  return caption;
}

async function parseSmartSignDictionary(media, relatedSigns, response, input) {
  const usedIds = [];
  const ids = response.youtubeIds.map(id => id).join(",");
  const videoData = await queryYouTubeIds(ids);

  const hasExactMatch = videoData.items.map(item => {
    return cleanSmartSignCaption(item.snippet.title) === input;
  }).some(x => x);

  videoData.items.forEach(item => {
    const id = item.id;
    const caption = cleanSmartSignCaption(item.snippet.title);
    const captionWords = caption.split(",");
    if (caption === input) {
      // if the caption = the query, then it's good
      usedIds.push(id);
    } else if (!hasExactMatch && captionWords.includes(input)) {
      // if we have no exact matches, use results that contain the query
      usedIds.push(id);
    }
    if (usedIds.includes(id)) {
      media[MEDIA_TYPE.IFRAME].push({
        src: `https://www.youtube.com/embed/${id}?`,
        caption: caption,
      });
    } else {
      captionWords.forEach(word => {
        relatedSigns.push({ name: word, url: '' });
      })
    }
  });
  return [media, relatedSigns];
}

async function selectAndRenderMedia(media, source, linkToSource, results) {
  const children = []
  let hasVideo = false, hasGif = false
  if (media[MEDIA_TYPE.VIDEO].length > 0) {
    for (const item of media[MEDIA_TYPE.VIDEO]) {
      const zoom = source === SOURCES.SIGNING_SAVVY
      children.push(renderVideo(item, zoom))
    }
    hasVideo = true
  }
  if (media[MEDIA_TYPE.IFRAME].length > 0) {
    let maxShow = source === SOURCES.SMART_SIGN_DICTIONARY ? 3 : 1;
    const iframes = media[MEDIA_TYPE.IFRAME].slice(0, maxShow);
    iframes.forEach(item => children.push(renderIFrame(item)));
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
    renderResultSection(source, linkToSource, children, results)
}

function renderResultSection(source, linkToSource, children, results) {
  const section = <ResultSection title={source} link={linkToSource}>{children}</ResultSection>
  results.addChild(section)
}

function renderImage(img_src) {
  return <ResultImage src={window.URL.createObjectURL(img_src)} />
}

function renderVideo(item, zoom) {
  return <ResultVideo src={item.video.src} caption={item.caption} zoom={zoom} />
}

function renderIFrame(item) {
  return <ResultIFrame src={item.src} caption={item.caption} />
}