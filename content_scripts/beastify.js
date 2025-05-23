(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL to a beast image, remove all existing beasts, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertBeast(beastURL) {
    removeExistingBeasts();
    let beastImage = document.createElement("img");
    beastImage.setAttribute("src", beastURL);
    beastImage.style.height = "100vh";
    beastImage.className = "beastify-image";
    document.body.appendChild(beastImage);
  }

  /**
   * Remove every beast from the page.
   */
  function removeExistingBeasts() {
    let existingBeasts = document.querySelectorAll(".beastify-image");
    for (let beast of existingBeasts) {
      beast.remove();
    }
  }

  function extractButtonView() {
    return document.getElementById("browserItemsContentSortable")
        .getElementsByClassName("browserItemCONTENT")[0]
        .getElementsByClassName("browserItemButtonView")[0];
  }

  function extractButtonPreview() {
    return document.getElementById("browserItemsContentSortable")
        .getElementsByClassName("browserItemCONTENT")[0]
        .getElementsByClassName("browserItemButtonPreview")[0];
  }

  function openCategoriesRec(root, depth, path) {
    let name = root.getElementsByClassName("browserCategoryName")[0]
        .textContent;
    if (path === "") {
      path = name;
    } else {
      path += " /" + name;
    }
    console.log(depth + ") " + name + " (" + path + ")");
    if (root.getElementsByClassName("browserCategoryChilds").length > 0) {
      let categories = root.getElementsByClassName("browserCategoryChilds")[0]
          .getElementsByClassName("browserCategory");
      for (let category of categories) {
        openCategoriesRec(category, depth + 1, path);
      }
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("content_script: request", request);
    if (request.command === "login") {
      let inputs = document.getElementsByTagName("input");
      /*Array.of(inputs).forEach(
        input => {
          if (input.type === "password") {
            console.log(input.type);
          } else {
            console.log(input);
          }
          input.value = message.password;
        }
      );*/
      let input = inputs[0];
      if (input.name === "password"
      && window.location.href.includes("benvenuti")) {
        inputs[0].value = request.password;
        document.getElementsByTagName("form")[0].submit();
      }
    } else if (request.command === "reset") {

    } else if (request.command === "open-preview") {
      console.log("do open-preview");
      let button = extractButtonView();
      if (!button) {
        console.error("Could not find a button view");
        return;
      }
      buttonUrl = button.getAttribute("href");
      console.log("href is : " + buttonUrl);
      if (button.style.display === "none") {
        button = extractButtonPreview();
        if (!button) {
          console.error("Could not find a button preview");
          return;
        }
      }
      console.log("click() now");
      button.click();
      console.log("sendMessage() now just-open-page");
      chrome.runtime.sendMessage({
        command: "just-open-page",
        url: buttonUrl,
        tabId: request.tabId
      });
    } else if (request.command === "discover-all") {
      console.log("discover-all now");
      let root = document.getElementById("browserCategoriesContent")
          .getElementsByClassName("browserCategory")[0];
      openCategoriesRec(root, 0, "");
    }
  });

})();
