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

async function initDownloadAll() {
    let btn = getDownloadAllBtn();

    if (btn) {
        btn.click();
    } else {
        alert('Please refresh the page and try again!');
    }

    await wait(1);
}

window.initDownloadAll = initDownloadAll;

function wait(timeInSecond, msg = '') {
    return new Promise((res, rej) => {
        let timeout = setTimeout(() => {
            console.log(`Waited for ${timeInSecond} seconds ${msg}`);
            res();
            clearTimeout(timeout);
        }, timeInSecond * 1000);
    });
}

window.wait = wait;

function getFirstGenImgSrc() {
    let all = document.querySelectorAll('img[src^="https://wepik.com/api/image/ai/"]');

    if (all.length) {
        return all[0].src;
    }

    return '';
}

async function observeAndDownload() {
    let firstSrc = getFirstGenImgSrc();

    return new Promise((res, rej) => {
        let interval = setInterval(() => {
            let current = getFirstGenImgSrc();

            if (firstSrc !== current) {
                clearInterval(interval);
                wait(1, 'to get the download button loaded')
                    .then(initDownloadAll)
                    .then(() => res())
                    .catch(err => rej(err));
            }
        }, 500);
    });
}

async function startDownload(it = 2) {
    let genBtn = getGenerateButton();

    if (!genBtn) {
        alert('Please refresh the page and try again!');
    }

    while (it > 0) {
        genBtn.click();
        // await wait(30);
        await observeAndDownload();
        it--;
    }
}

window.startDownload = startDownload;

// startDownload(2).then(console.log).catch(console.error);

function onStart() {
    startDownload(3).then(console.log).catch(console.error);
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
            // let go = confirm('Please make sure you have enough credits to download the images.')
            return onStart();
        } else {
            alert('Please write the prompt first!');
        }
    }
});
