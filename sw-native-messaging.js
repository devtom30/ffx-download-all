console.log("sw-native-messaging.js");

let message;
let port = null;
connect();
sendNativeMessage("ready?");

let onCreated = (tab) => {
    console.log("created tab ");
    console.log(tab);
    return tab;
}
let onError = (error) => {
    console.log("error on creating tab " + error);
}

let urlReceived = "";
let tabsCreatingTime = 0;
let urlOk = false;
let func = ((message, sender, sendResponse) => {
    if (message.action && message.action === "open-page") {
        console.log(message);
        urlReceived = message.url;
        urlOk = false;
        let creating = chrome.tabs.create({
            url: urlReceived,
        });
        creating
            .then(onCreated, onError)
            .then(tab => {
                tabsCreatingTime = Date.now();
                console.log("executing script in tab now…");
                return [tab, chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    files: ["/lib/in-tab.js"]
                })];
            });
    } else {
        if (message.command === "save-page") {
            console.log("command save-page received");
            console.log(message);
            urlOk = true;
            sendNativeMessage(urlReceived);
        }
    }
});
chrome.runtime.onMessage.addListener(func);

function sendNativeMessage(message_content) {
    message = { text: message_content };
    port.postMessage(message);

    /*chrome.downloads.download({
        url: "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2158669709/settings_images/4e33371-85cb-04eb-15-0c57a13832_e29c848d-945f-45de-aeee-a12857ebce19.png"
    })
        .then(downloadId => chrome.downloads.search({id: downloadId}))
        .then(downloadItems => {
            console.log(downloadItems);
        });*/
}

function onNativeMessage(message) {
    console.log('Received message: ' + JSON.stringify(message));
}

function onDisconnected() {
    port = null;
}

function connect() {
    const hostName = 'com.google.chrome.example.echo';
    console.log(`connecting to ${hostName}`);
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
}

/*
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect-button').addEventListener('click', connect);
    document
        .getElementById('send-message-button')
        .addEventListener('click', sendNativeMessage);
});
*/
