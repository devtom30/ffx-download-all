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

  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
      let items = document.getElementById("browserItemsContentSortable");
      console.log(items);
      let itemsContent = items.getElementsByClassName("browserItemCONTENT");
      let buttons = itemsContent[0].getElementsByClassName("browserItemButtonView");
      let url = buttons[0].getAttribute("href");
      console.log("href is : " + url);
      chrome.runtime.sendMessage({
        action: "open-page",
        url: url
      }).then(result => {console.log("result", result);});
    }
  });

})();
