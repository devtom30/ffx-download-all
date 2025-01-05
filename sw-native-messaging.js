console.log("sw-native-messaging.js");

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
            /*port.postMessage({
                page: message.url,
                head: message.head,
                body: message.body
            });*/
        }
    }
});
chrome.runtime.onMessage.addListener(func);