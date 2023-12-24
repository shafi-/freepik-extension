console.log('Content script injected successfully.');

function findButtonByText(buttonText) {
    const buttons = document.querySelectorAll('button');

    const button = Array.from(buttons).find((btn) => btn.textContent.includes(buttonText));

    if (button) {
        return button;
    } else {
        console.error(`Button with text '${buttonText}' not found.`);
    }
}

function getGenerateButton() {
    return findButtonByText('Generate');
}

window.getGenerateButton = getGenerateButton;

function getDownloadAllBtn() {
    return findButtonByText('Download all');
}

window.getDownloadAllBtn = getDownloadAllBtn;

function initDownloadAll() {
    getDownloadAllBtn().click();
}

window.initDownloadAll = initDownloadAll;

function wait(timeInSecond) {
    return new Promise((res, rej) => {
        let timeout = setTimeout(() => {
            res();
            clearTimeout(timeout);
        }, timeInSecond * 1000);
    });
}

window.wait = wait;

async function startDownload(it = 2) {
    let genBtn = getGenerateButton();
    
    if (!genBtn) {
        alert('Please refresh the page and try again!');
    }

    while (it > 0) {
        genBtn.click();
        // await wait(30);
        observeAndDownload();
        await wait(2);
        it--;
    }
}

window.startDownload = startDownload;

// startDownload(2).then(console.log).catch(console.error);

function getFirstGenImgSrc() {
    let all = document.querySelectorAll('img[src^="https://wepik.com/api/image/ai/"]');

    if (all.length) {
        return all[0].src;
    }

    return '';
}

function observeAndDownload() {
    let firstSrc = getFirstGenImgSrc();

    let interval = setInterval(() => {
        let now = getFirstGenImgSrc();

        if (firstSrc !== now) {
            clearInterval(interval);
            wait(1).then(initDownloadAll).catch(console.error);
        }
    }, 500);
}

function onStart() {
    startDownload(2).then(console.log).catch(console.error);
}

window.onStart = onStart;

function hasPrompt() {
    var textarea = document.querySelector('textarea');
    
    if (textarea.value) {
        return true;
    }

    return false;
}

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'executeFunction') {
        // Execute the injected function
        // onStart();
        // alert('Button clicked!');
        if (hasPrompt()) {
            return onStart();
        } else {
            alert('Please write the prompt first!');
        }
    }
});
