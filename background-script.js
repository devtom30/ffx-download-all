browser.runtime.onInstalled.addListener(() => {
    /*browser.contextMenus.create({
        id: "sampleContextMenu",
        title: "Sample Context Menu",
        contexts: ["selection"],
    });*/
});

/*function connectNative(aAppName, onConnect, onFail) {
    var listener = function(payload) {
        if (!connected) {
            connected = true;
            port.onDisconnect.removeListener(failedConnect);
            onConnect();
        } else {
            // process messages
        }
    }
    var failedConnect = function() {
        onFail('failed for unattainable reason - however see browser console as it got logged there');
    }
    var connected = false;
    var port = chrome.runtime.connectNative(aAppName);
    port.onMessage.addListener(listener);
    port.onDisconnect.addListener(failedConnect);
    return port;
}*/

let port = chrome.runtime.connectNative("org.devtom.ffx.download.all.companion")
//let port = chrome.runtime.connectNative("auieauie")
//    .error((e) => console.log(e))
;

//  port = connectNative("org.devtom.ffx.download.all.companion", () => console.log("connected"), (e) => console.log(e));

port.onMessage.addListener((message) => {
    console.log(message);
});
port.postMessage({
    command: "hello"
});

let sending = browser.runtime.sendNativeMessage("org.devtom.ffx.download.all.companion", "ping");
sending.then(() => {console.log("uh")}, (e) => {console.log("damn it"); console.log(e)});

const makeItGreen = 'document.body.style.border = "5px solid green"';

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
let categoryListToDo = new Map();
let categoryListProcessing = new Map();
let categoryListDone = new Map();
let func = ((message, sender, sendResponse) => {
    if (message.action && message.action === "open-page") {
        console.log(message);
        urlReceived = message.url;
        urlOk = false;
        let creating = browser.tabs.create({
            url: urlReceived,
        });
        creating
            .then(onCreated, onError)
            .then(tab => {
                tabsCreatingTime = Date.now();
                console.log("executing script in tab now…");
                return [tab, browser.tabs.executeScript(tab.id, {
                    file: "/lib/in-tab.js"
                })];
            });
    } else if (message.command === "save-page") {
        console.log("command save-page received");
        console.log(message);
        urlOk = true;
        port.postMessage({
            page: message.url,
            head: message.head,
            body: message.body
        });
    } else if (message.command === "add-category-to-list") {
        console.log("adding category to list");
        categoryListToDo.set(message.name, message.domObject)
    } else if (message.command === "save_category_done") {
        console.log("receive end for category " + message.name);
        categoryListDone.set(message.name, categoryListProcessing.get(message.name));
        categoryListProcessing.delete(message.name);
    }
});
browser.runtime.onMessage.addListener(func);

setInterval(() => {
    if (categoryListProcessing.size > 0) {
        console.log("processing category ");
        return;
    }
    if (categoryListToDo.size > 0) {
        const catToDo = categoryListToDo.keys()[0];
        console.log("processing category " + catToDo);
        categoryListProcessing.set(catToDo, categoryListToDo.get(catToDo));
        categoryListToDo.delete(catToDo);
        chrome.runtime.sendMessage({
            name: catToDo,
            command: "save-category"
        })
    } else {
        console.log("no category to process");
    }
}, 1000);
