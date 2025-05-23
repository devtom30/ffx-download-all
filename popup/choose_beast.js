/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.beastify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    /**
     * Given the name of a beast, get the URL to the corresponding image.
     */
    function beastNameToURL(beastName) {
      switch (beastName) {
        case "Frog":
          return chrome.runtime.getURL("beasts/frog.jpg");
        case "Snake":
          return chrome.runtime.getURL("beasts/snake.jpg");
        case "Turtle":
          return chrome.runtime.getURL("beasts/turtle.jpg");
      }
    }

    function buttonNameToCommand(buttonName) {
      switch (buttonName) {
        case "Login":
          return "login";
        case "Open preview":
          return "open-preview";
        case "Discover all":
          return "discover-all";
        case "Connect":
          return "connect";
        case "Test message":
          return "testmessage";
        case "Disconnect":
          return "disconnect";
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function beastify(tabs) {
      const action = buttonNameToCommand(e.target.textContent);
      switch (action) {
        case "login":
          chrome.storage.local.get("password").then((obj) => {
            console.log("obj");
            console.log(obj);
            chrome.tabs.sendMessage(tabs[0].id, {
              command: action,
              password: obj.password
            });
          });
          break;
        case "open-preview":
          chrome.tabs.sendMessage(tabs[0].id, {
            command: action,
            tabId: tabs[0].id
          });
          break;
        case "discover-all":
          chrome.tabs.sendMessage(tabs[0].id, {
            command: action,
            tabId: tabs[0].id
          })
        case "connect":
          chrome.runtime.sendMessage({command: "connect"}).then();
          break;
        case "testmessage":
          chrome.runtime.sendMessage({command: "testmessage"}).then();
          break;
        case "disconnect":
          chrome.runtime.sendMessage({command: "disconnect"}).then();
          break;
      }
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      chrome.tabs.removeCSS({code: hidePage}).then(() => {
        chrome.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      // Ignore when click is not on a button within <div id="popup-content">.
      return;
    } 
    if (e.target.type === "reset") {
      chrome.tabs.query({active: true, currentWindow: true})
        .then(reset)
        .catch(reportError);
    } else {
      chrome.tabs.query({active: true, currentWindow: true})
        .then(beastify)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
getCurrentTab().then(tab => chrome.scripting
    .executeScript({
      target : {tabId : tab.id},
      files : [ "/content_scripts/beastify.js" ],
    }))
    .then(listenForClicks)
    .catch(reportExecuteScriptError);

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
