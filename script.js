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
        let timeout = 20 * 2;

        let interval = setInterval(() => {
            let current = getFirstGenImgSrc();

            if (firstSrc !== current) {
                clearInterval(interval);
                wait(0.5, 'to get the download button loaded')
                    .then(initDownloadAll)
                    .then(() => res())
                    .catch(err => rej(err));
            }

            timeout -= 1;

            if (timeout <= 0) {
                clearInterval(interval);
                console.log('Taking too long to download. Check if you have credits for downloading. Please refresh the page and try again!');
                rej('Iteration Timeout');
            }
        }, 500);
    });
}

async function startDownload(it = 2) {
    let genBtn = getGenerateButton();

    if (!genBtn) {
        alert('Page is not fully loaded. Please refresh the page and try again!');
    }

    while (it > 0) {
        try {
            genBtn.click();
            await observeAndDownload();
            updateCount(4);
            it--;
        } catch (error) {
            if (error === 'Iteration Timeout') {
                await wait(15, 'Cool down on failure');
            }
        }
    }
}

function showDownloadCount(target = 0, downloaded = 0) {
    let btn = document.getElementById('ext-download-counter');

    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'ext-download-counter';

        btn.style.bottom = '50px';
        btn.style.right = '24px';
        btn.style.position = 'fixed';
        applyButtonStyle(btn);
        btn.style.color = 'black';
        btn.style.background = 'white';    
        btn.style.zIndex = '1001';

        document.body.appendChild(btn);
    }

    btn.setAttribute('data-target', target);
    btn.setAttribute('data-downloaded', downloaded);
    
    btn.textContent = `(Current Session) Downloaded ${downloaded} / ${target}`;
}

function applyButtonStyle(btn) {
    btn.style.color = 'white';
    btn.style.background = 'black';
    btn.style.padding = '6px 12px';
    btn.style.border = '1px solid black';
    btn.style.borderRadius = '4px';
}

function showDownloadForm() {
    if (document.getElementById('downloader-form')) {
        return;
    }

    // Create a div element
    const formDiv = document.createElement('div');

    formDiv.id = 'downloader-form';

    formDiv.style.bottom = '50px';
    formDiv.style.left = '24px';
    formDiv.style.position = 'fixed';
    formDiv.style.padding = '12px 24px';
    formDiv.style.border = '2px solid black';
    formDiv.style.borderRadius = '4px';
    formDiv.style.zIndex = '1001';
    formDiv.style.background = 'white';

    // Create a numeric input element
    const input = document.createElement('input');

    input.type = 'number';
    input.name = 'target';
    // input.value = '1';
    input.placeholder = 'Enter target count';
    input.id = 'ext-download-target';
    input.style.marginRight = '36px';
    input.style.padding = '6px 12px';
    input.style.border = '1px solid black';
    input.style.borderRadius = '4px';

    // Create a submit button
    const submitBtn = document.createElement('button');

    submitBtn.type = 'button';
    submitBtn.textContent = 'Start Download';
    submitBtn.id = 'ext-download-start';
    applyButtonStyle(submitBtn);
    submitBtn.addEventListener('click', () => {
        let target = Number(document.getElementById('ext-download-target')?.value);

        if (!target) {
            alert('Please set target');
            return;
        }

        onStart(target);
    });

    // Create a form element
    const form = document.createElement('div');

    // Append the input and submit button to the form
    form.appendChild(input);
    form.appendChild(submitBtn);

    // Append the form to the div
    formDiv.appendChild(form);

    // Inject the div to the main page HTML
    // let mainForm = document.querySelector('form');
    // mainForm.parentNode?.appendChild(formDiv);
    document.body.appendChild(formDiv);
    console.log('Loaded download form');
}

function updateCount(downloaded = 0) {
    let btn = document.getElementById('ext-download-counter');

    let currentTarget = btn.getAttribute('data-target');
    let currentDownloaded = Number(btn.getAttribute('data-downloaded'));

    btn.setAttribute('data-downloaded', currentDownloaded + downloaded);
    btn.textContent = `(Current Session) Downloaded ${currentDownloaded + downloaded} / ${currentTarget}`;
}

function onStart(target) {
    if (hasPrompt()) {
        showDownloadCount(target, 0);
        startDownload(Math.ceil(target / 4)).then(console.log).catch(console.error);
    } else {
        alert('Please write the prompt before starting download!');
    }
}

function hasPrompt() {
    var textarea = document.querySelector('textarea');

    if (textarea && textarea.value) {
        return true;
    }

    return false;
}

async function checkLi() {
    let res = await fetch('https://raw.githubusercontent.com/shafi-/freepik-extension/main/li.json');
    let data = await res.json();

    return new Date(data.allowed) > new Date();
}

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    alert('Use from the page directly');
    return;

    let target = Number(request.targetCount);

    if (!target) {
        alert('Please enter target count!');
        return;
    }

    if (request.action === 'executeFunction') {
        // Execute the injected function
        // onStart();
        // alert('Button clicked!');
        if (hasPrompt()) {
            // let go = confirm('Please make sure you have enough credits to download the images.')
            // return onStart(target);
            showDownloadForm();
        } else {
            alert('Please write the prompt first!');
        }
    }
});

function init() {
    return checkLi().then(hasLi => {
        if (hasLi) {
            showDownloadForm();
        } else {
            alert('Your license has expired! Please contact with developer!');
        }
    });
}

init();
