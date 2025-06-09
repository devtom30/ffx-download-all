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
    return document.getElementById("browserItemsContent")
        .getElementsByClassName("browserItem")[0]
        .getElementsByClassName("browserItemCONTENT")[0]
        .getElementsByClassName("browserItemButtonView")[0];
  }

  function extractButtonPreview() {
    return document.getElementById("browserItemsContent")
        .getElementsByClassName("browserItem")[0]
        .getElementsByClassName("browserItemCONTENT")[0]
        .getElementsByClassName("browserItemButtonPreview")[0]
  }

  function openCategoriesRec(root, depth, path) {
    let categoryNameA = root.getElementsByClassName("browserCategoryName")[0];
    let name = categoryNameA.textContent;
    if (path === "") {
      path = name;
    } else {
      path += " /" + name;
    }
    console.log(depth + ") " + name + " (" + path + ")");

    // category pages
    categoryNameA.href = "#";
    document.addEventListener("click", (e) => {
      console.log("click on category");
      e.stopPropagation()
      e.preventDefault();
    });

    categoryNameA.click();

    setTimeout(() => {
      const itemsContentContainer = document.getElementById("browserItemsContent");
      const items = itemsContentContainer.getElementsByClassName("browserItem");
      for (let item of items) {
        const itemContent = item.getElementsByClassName("browserItemCONTENT")[0];
        if (itemContent) {
          let button = itemContent.getElementsByClassName("browserItemButtonView")[0];
          if (button) {
            const buttonUrl = button.getAttribute("href");
            console.log("page href is : " + buttonUrl);
            if (button.style.display === "none") {
              button = itemContent.getElementsByClassName("browserItemButtonPreview")[0];
              if (!button) {
                console.error("Could not find a button preview");
              }
            }
          } else {
            console.log("no button view");
          }
        }
      }


    }, 2000);

    return;

    if (root.getElementsByClassName("browserCategoryChilds").length > 0) {
      let categories = root.getElementsByClassName("browserCategoryChilds")[0]
          .getElementsByClassName("browserCategory");
      for (let category of categories) {
        let links = category.getElementsByClassName("browserCategoryName");
        if (links.length > 0) {
          links.forEach(link => {
            console.log(link.innerText);
          })
        }
      }
    }

    return;

    setTimeout(() => {
      categoryNameA.click();
//    window.dispatchEvent(new MouseEvent("mouseenter", {relatedTarget: categoryNameA}));
      setTimeout(() => {
        const browserCategoryAboutName = document.getElementById("browserCategoryAboutName");
        console.log("browserCategoryAboutName : " + browserCategoryAboutName.textContent);
//    window.dispatchEvent(new MouseEvent("click", {relatedTarget: browserCategoryAboutName}));
      }, 2000);
      if (root.getElementsByClassName("browserCategoryChilds").length > 0) {
        let categories = root.getElementsByClassName("browserCategoryChilds")[0]
            .getElementsByClassName("browserCategory");
        //let delay = 2000;
        //let i = 1;
        for (let category of categories) {
          let icons = category.getElementsByClassName("browserCategoryIcon");
          if (icons.length > 0 && icons[0].classList.contains("closed")) {
            icons[0].click();
          }
          // openCategoriesRec(category, depth + 1, path);
        }
      }
    }, 3000);

    return;
    setTimeout(() => {
      const plusAllA = document.getElementById("browserItemsPlusAll");
      if (plusAllA) {
        // window.dispatchEvent(new MouseEvent(123, {relatedTarget: plusAllA}));
        plusAllA.click();
        setTimeout(() => {
          const itemsContentContainer = document.getElementById("browserItemsContent");
          const items = itemsContentContainer.getElementsByClassName("browserItem");
          for (let item of items) {
            const itemContent = item.getElementsByClassName("browserItemCONTENT")[0];
            if (itemContent) {
              let button = itemContent.getElementsByClassName("browserItemButtonView")[0];
              if (button) {
                const buttonUrl = button.getAttribute("href");
                console.log("page href is : " + buttonUrl);
                if (button.style.display === "none") {
                  button = itemContent.getElementsByClassName("browserItemButtonPreview")[0];
                  if (!button) {
                    console.error("Could not find a button preview");
                  }
                }
              } else {
                console.log("no button view");
              }
            }
          }

          if (root.getElementsByClassName("browserCategoryChilds").length > 0) {
            let categories = root.getElementsByClassName("browserCategoryChilds")[0]
                .getElementsByClassName("browserCategory");
            for (let category of categories) {
              let icons = category.getElementsByClassName("browserCategoryIcon");
              if (icons.length > 0 && icons[0].classList.contains("closed")) {
                icons[0].click();
              }
              openCategoriesRec(category, depth + 1, path);
            }
          }
        }, 2000);
      }
    }, 1000);
  }

  function openAllCategories(tabId) {
    const browserCategoryContent = document.getElementById("browserCategoriesContent");
    const links = browserCategoryContent.getElementsByClassName("browserCategoryName");
    if (links.length > 0) {
      Array.from(links).forEach(link => {
        console.log(link.innerText);
        console.log(link);
        chrome.runtime.sendMessage({
          command: "add-category-to-list",
          name: link.innerText,
          linkDataId: link.getAttribute("data-id"),
          tabId: tabId
        })
      });
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
    } else if (request.command === "open-all-categories") {
      openAllCategories(request.tabId);
    } else if (request.command === "save-category") {
      console.log("save-category " + request.name);
      const link = document.querySelectorAll('[data-id="' + request.linkDataId + '"]')[0];
      console.log("link");
      console.log(link);
      link.click();
      setTimeout(() => {
        chrome.runtime.sendMessage({
          command: "save-category-done",
          name: request.name
        });
      }, 2000);
    }
  });

})();
