browser.runtime.onInstalled.addListener(() => {
    /*browser.contextMenus.create({
        id: "sampleContextMenu",
        title: "Sample Context Menu",
        contexts: ["selection"],
    });*/
    console.log("Installed");
});
