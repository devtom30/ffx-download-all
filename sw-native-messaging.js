console.log("sw-native-messaging.js");

let message;
let port = null;
connect();
// sendNativeMessage("ready?");

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
let urlMap = new Map();

let func = ((message, sender, sendResponse) => {
    if (message.action && message.action === "open-page") {
        console.log(message);
        urlReceived = message.url;
        urlOk = false;
    } else if (message.command === "save-page") {
        console.log("command save-page received");
        console.log(message);
        urlOk = true;
        sendNativeMessage(urlReceived);
    } else if (message.command === "just-open-page") {
        console.log("command just-open-page received");
        console.log(message);
        urlMap.set(message.url, new UrlState(UrlStatus.OPEN, undefined));
    } else if (message.command === "error-404") {
        let urlInMap = urlMap.get(message.url);
        if (!urlInMap) {
            console.log("error-404: url not found in map " + message.url);
            return;
        }
        chrome.tabs.remove(urlInMap.tabId, () => {
            console.log("tab removed : " + urlInMap.tabId);
        });
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


function onTabsUpdated(tabId, changeInfo, tab) {
    if (tab.status !== "complete") {
        console.log("tab (" + tab.id + ") status: " + tab.status);
        return;
    }
    console.log("onTabsUpdated", tabId, changeInfo, tab);
    console.dir(urlMap);

    if (tab.url.startsWith("https://benvenuti.e-monsite.com/passwordaccess")) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ["/lib/in-tab.js"]
        }).then(() => {
            console.log("script executed successfully in password tab.");
        });
        return;
    }

    let url = urlMap.get(tab.url) ?
        tab.url :
        urlMap.get(tab.pendingUrl) ?
            tab.pendingUrl :
            "";
    if (url
        && urlMap.get(url).status === UrlStatus.OPEN) {
        console.dir(tab);
        console.log("url : " + url);
        console.log("urlMap.get(url)", urlMap.get(url));
        urlMap.get(url).status = UrlStatus.PROCESSING;
        urlMap.get(url).tabId = tab.id;
        console.log(url + " tab open with button : " + tabId);
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ["/lib/in-tab.js"]
        }).then(() => {
            console.log("script executed successfully in tab.");
        });
    }
}
chrome.tabs.onUpdated.addListener(onTabsUpdated);

class UrlState {
    #status = "";
    #tabId = 0;
    constructor(status, tabId) {
        this.#status = status;
        this.#tabId = tabId;
    }

    get status() {
        return this.#status;
    }

    set status(value) {
        this.#status = value;
    }

    get tabId() {
        return this.#tabId;
    }

    set tabId(value) {
        this.#tabId = value;
    }
}

const UrlStatus = Object.freeze({
    OPEN: Symbol("open"),
    PROCESSING: Symbol("processing"),
})