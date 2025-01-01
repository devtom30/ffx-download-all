browser.runtime.onInstalled.addListener(() => {
    /*browser.contextMenus.create({
        id: "sampleContextMenu",
        title: "Sample Context Menu",
        contexts: ["selection"],
    });*/
    console.log("Installed");
});

let onCreated = (tab) => {
    console.log("created tab " + tab);
}
let onError = (error) => {
    console.log("error on creating tab " + error);
}

let func = ((message, sender, sendResponse) => {
    if (message.action && message.action === "open-page") {
        console.log(message);
        let creating = browser.tabs.create({
            url: message.url,
        });
        creating.then(onCreated, onError);
    }
});
browser.runtime.onMessage.addListener(func);

