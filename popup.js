document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', onclick, false)

  function onclick() {
    const input = processText(document.querySelector('input').value)
    const query = queryLifePrint(input)
    document.querySelector('#result').src = 'http://www.lifeprint.com/asl101/pages-signs/' + query
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

function processText(query) {
  return query.toLowerCase().trim()
}

function queryLifePrint(query) {
  return query[0] + '/' + query
}