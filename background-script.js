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
    } else {
        if (message.command === "save-page") {
            console.log("command save-page received");
            console.log(message);
            urlOk = true;
            port.postMessage({
                page: message.url,
                head: message.head,
                body: message.body
            });
        }
    }
});
browser.runtime.onMessage.addListener(func);

/*
setInterval(() => {
    console.log(urlOk);
    if (!urlOk) {
        console.log("url (" + urlReceived + ") has not been saved");
    }
}, 1000);*/
