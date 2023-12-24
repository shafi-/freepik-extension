function findButtonByText(buttonText) {
    // Select all buttons on the page
    const buttons = document.querySelectorAll('button');
  
    // Find the button with the specified text content
    const button = Array.from(buttons).find((btn) => btn.textContent.includes(buttonText));
  
    if (button) {
      // Trigger a click on the button
      // button.click();
        console.log(button);
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
