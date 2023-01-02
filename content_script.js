// content_script.js

console.log("Content script loaded.");

browser.runtime.onMessage.addListener((message) => {
    console.log("Content:", message);
})