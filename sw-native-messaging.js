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
const urlMap = new Map();
let mainTabId = 0;

let func = ((message, sender, sendResponse) => {
    if (message.action && message.action === "open-page") {
        console.log(message);
        urlReceived = message.url;
        urlOk = false;
    } else if (message.command === "save-page") {
        console.log("command save-page received");
        console.log(message);
        urlOk = true;
        let task = {
            url: message.url,
            task_type: "parse",
            body: message.body,
            head: message.head
        };
        sendNativeMessageTask(task);
    } else if (message.command === "just-open-page") {
        console.log("command just-open-page received");
        console.log(message);
        urlMap.set(message.url, new UrlState(UrlStatus.OPEN, undefined));
        console.log("urlMap new url: " + message.url);
        console.dir(urlMap);
        mainTabId = message.tabId;
        console.log("mainTabId is : " + mainTabId);
    } else if (message.command === "error-404") {
        let urlInMap = urlMap.get(message.url);
        if (!urlInMap) {
            console.log("error-404: url not found in map " + message.url);
            return;
        }
        chrome.tabs.remove(urlInMap.tabId, () => {
            console.log("tab removed : " + urlInMap.tabId);
        });

        console.log("sending message to mainTabId " + mainTabId);
        chrome.tabs.sendMessage(mainTabId, {
            command: "open-preview",
        }).then().catch((e) => console.log(e));
    } else if (message.command === "connect") {
        console.log("native connect now");
        connect();
    } else if (message.command === "testmessage") {
        console.log("test message sending now");
        sendNativeMessage("the test message");
    } else if (message.command === "disconnect") {
        console.log("disconnect now");
        disconnect();
    }
});
chrome.runtime.onMessage.addListener(func);

function sendNativeMessage(message_content) {
    message = { text: message_content };
    console.log("sending message ");
    console.dir(message);
    port.postMessage(message);

    /*chrome.downloads.download({
        url: "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2158669709/settings_images/4e33371-85cb-04eb-15-0c57a13832_e29c848d-945f-45de-aeee-a12857ebce19.png"
    })
        .then(downloadId => chrome.downloads.search({id: downloadId}))
        .then(downloadItems => {
            console.log(downloadItems);
        });*/
}

function sendNativeMessageTask(task) {
    console.log("sending task ");
    console.log(task);
    port.postMessage(task);
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

function disconnect() {
    port.disconnect();
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

    let url = getFromMap(urlMap, tab.url) ?
        tab.url :
        getFromMap(urlMap, tab.pendingUrl) ?
            tab.pendingUrl :
            "";
    if (url === "") {
        return;
    }
    console.log("url: " + url);
    let urlData = getFromMap(urlMap, url);
    console.dir(urlData);
    console.log("status: " + urlData.status.toString());
    if (urlData
        && urlData.status === UrlStatus.OPEN) {
        console.dir(tab);
        console.log("url : " + url);
        getFromMap(urlMap, url).status = UrlStatus.PROCESSING;
        getFromMap(urlMap, url).tabId = tab.id;
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
    status = "";
    tabId = 0;
    constructor(status, tabId) {
        this.status = status;
        this.tabId = tabId;
    }

    get status() {
        return this.status;
    }

    set status(value) {
        this.status = value;
    }

    get tabId() {
        return this.tabId;
    }

    set tabId(value) {
        this.tabId = value;
    }
}

const UrlStatus = Object.freeze({
    OPEN: Symbol("open"),
    PROCESSING: Symbol("processing"),
})

const TaskType = Object.freeze({
    PARSE: Symbol("parse"),
    ATTACH: Symbol("attach")
})

function getFromMap(map, url) {
    if (url === null || url === undefined) {
        return null;
    }
    console.log("getFromMap() url:  " + url);
    if (url.startsWith("https:")) {
        url = url.replace("https:", "http:");
    }
    console.log("getting url " + url);
    return map.get(url);
}

function isUrlOpen(map, url) {
    if (url.startsWith("https:")) {
        url = url.replace("https:", "http:");
        console.log("getFromMap(): " + url);
    }
    const urlState = map.get(url);
    return urlState.status === UrlStatus.OPEN;
}
