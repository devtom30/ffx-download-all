browser.runtime.onInstalled.addListener(() => {
    /*browser.contextMenus.create({
        id: "sampleContextMenu",
        title: "Sample Context Menu",
        contexts: ["selection"],
    });*/
    console.log("Installed");
});

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
            console.log(message);
            urlOk = true;
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
