// document.getElementById('btn-img-dn-start').addEventListener('click', function (e) {
//   // Communicate with the content script
//   // alert('Alert from popup.js');
//   // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   //     chrome.tabs.sendMessage(tabs[0].id, { action: 'executeFunction' });
//   // });
//   e.target.classList.add('bg-green');
//   console.trace(window.onStart);
// });

// Function to check if the document is ready
function isDocumentReady() {
  return document.readyState === 'complete';
}

// Function to perform actions when the document is ready
function onDocumentReady() {
  // Your code to run when the document is fully loaded
  console.log('Document is fully loaded and ready.');

  // Enable download button
  // document.getElementById('btn-img-dn-start').classList.remove('d-none');
}

// Check if the document is already ready
if (isDocumentReady()) {
  onDocumentReady();
} else {
  document.addEventListener('DOMContentLoaded', onDocumentReady);
}

document.getElementById('btn-img-dn-start').addEventListener('click', function (e) {
  // Send message to the content script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'executeFunction' });
  });

  e.target.classList.add('bg-green');
});
