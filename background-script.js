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
    let executing = browser.tabs.executeScript(
        tab.id,
        {
            file: "/lib/in-tab.js"
        }
    )

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

