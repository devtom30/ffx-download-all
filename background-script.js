browser.runtime.onInstalled.addListener(() => {
    /*browser.contextMenus.create({
        id: "sampleContextMenu",
        title: "Sample Context Menu",
        contexts: ["selection"],
    });*/
    console.log("Installed");
});

let func = ((message, sender, sendResponse) => {
    if (message.action && message.action === "open-page") {
        console.log(message);
        /*let creating = browser.tabs.create({
            url: "https://example.org",
        });
        creating.then(onCreated, onError);*/
    }
});
browser.runtime.onMessage.addListener(func);

