console.log("sw-native-messaging.js");

let server_url = "http://localhost:3000";
const POST_TASK_URL = server_url + "/task";

let message;
let port = null;
//connect();
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
const downloadMap = new Map();
const downloadPageUrlMap = new Map();
let mainTabId = 0;

let categoryMap = new Map();
let categoryListToDo = new Map();
let categoryListProcessing = new Map();
let categoryListDone = new Map();
let savingCategoriesOnGoing = false;

const savingCategoriesIntervalId = setInterval(() => {
    if (categoryListProcessing.size > 0) {
        console.log("processing category ");
    } else if (categoryListToDo.size > 0) {
        savingCategoriesOnGoing = true;
        const catIdToDo = categoryListToDo.keys().next().value;
        const category = categoryMap.get(catIdToDo);
        console.log("processing category");
        console.dir(category);
        categoryListProcessing.set(catIdToDo, null);
        categoryListToDo.delete(catIdToDo);
        chrome.tabs.sendMessage(mainTabId, {
            catId: catIdToDo,
            command: "save-category",
            linkDataId: category.linkDataId,
            name: category.name,
        }).then().catch((e) => console.log(e));
    } else {
        console.log("no category to process");
        if (savingCategoriesOnGoing) {
            savingCategoriesOnGoing = false;
            clearInterval(savingCategoriesIntervalId);
        }
    }
    console.log("remaining " + categoryListToDo.size);
    console.log("done " + categoryListDone.size);
}, 1000);



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
        //sendNativeMessageTask(task);
        fetch(POST_TASK_URL, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(task)
        }).then(res => {
            console.log("Request complete! response:", res);
        }).catch((e) => {
            console.log("error occurred:", e.message);
            console.error(e);
        });
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
    } else if (message.command === "add-category-to-list") {
        console.log("adding category to list");
        console.log(message);
        mainTabId = message.tabId;
        console.log("mainTabId is " + mainTabId);
        const catId = self.crypto.randomUUID();
        console.log("adding new cat to list : " + catId + " " + message.name);
        const category = {
            name: message.name,
            linkDataId: message.linkDataId,
            path: message.path
        };
        categoryMap.set(catId, category);
        categoryListToDo.set(catId, null);
    } else if (message.command === "save-category-done") {
        console.log("receive end for category " + message.name);
        categoryListDone.set(message.catId, null);
        categoryListProcessing.delete(message.catId);
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
    if (message.task_type === "download"
        && message.url
        && message.page_url) {
        startDownload(message.url, message.page_url);
    } else {
        console.log("incomplete task received");
    }
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

function startDownload(url, page_url) {
    chrome.downloads.download({
        url: url
    }).then(downloadId => {
        downloadPageUrlMap.set(downloadId, page_url);
        console.log("Download done: " + downloadId);
    });
}

/*
chrome.downloads.download({
    url: "https://www.gstatic.com/devrel-devsite/prod/va15d3cf2bbb0f0b76bff872a3310df731db3118331ec014ebef7ea080350285b/chrome/images/lockup.svg",
    filename: "downloaded_lockup.svg" // Optional
}).then(downloadId => {
    console.log("Download started: " + downloadId);
    downloadMap.set(downloadId, {});
});
*/

function handleCompletedDownload(downloadItem) {
    if (downloadMap.get(downloadItem.id) !== null) {
        downloadMap.set(downloadItem.id, downloadItem)
        sendNativeMessageTask({
            task_type: "attach",
            url: downloadItem.url,
            file_path: downloadItem.filename,
            page_url: downloadPageUrlMap.get(downloadItem.id)
        });
    } else {
        console.log("downloadItem not found in downloadMap");
    }
}

chrome.downloads.onChanged.addListener(function(delta) {
    console.log("Download changed: " + JSON.stringify(delta));
    if (delta.state && delta.state.current === "complete") {
        console.log("Download completed: " + delta.id);
        chrome.downloads.search({id: delta.id}).then(downloadItems => {
            console.log("Download filename: " + downloadItems[0].filename);
            handleCompletedDownload(downloadItems[0]);
        })
    }
});


