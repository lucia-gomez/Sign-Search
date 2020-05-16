document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', onclick, false)

  function onclick() {
    const input = document.querySelector('input').value
    const query = input[0] + '/' + input
    document.querySelector('#result').src = 'http://www.lifeprint.com/asl101/pages-signs/' + query
    // chrome.tabs.query({ currentWindow: true, active: true },
    //   function (tabs) {
    //     chrome.tabs.sendMessage(tabs[0].id, 'hi there')
    //   })
  }
}, false)