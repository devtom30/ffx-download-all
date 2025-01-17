let forms = document.getElementsByTagName("form");
console.log("forms found " + forms.length);

let form = forms[0];
let inputs = document.getElementsByTagName("input");
let input = inputs[0];
if (input.name === "password"
    && window.location.href.includes("benvenuti")) {
    console.log("input found");
    chrome.storage.local.get(["password"])
        .then((result) => {
            console.log("password from storage: " + result.password);
            inputs[0].value = result.password;
            form.submit();
        });
} else {
    console.log("no input password found ");
    if (document.getElementById("view-404") !== null
        && document.getElementById("view-404") !== undefined) {
        chrome.runtime.sendMessage({
            command: "error-404",
            url: document.location.href
        }).then().catch(e => console.log(e));
    } else {
        console.log("input named 'password' not found");
        console.log("head : " + document.head.innerHTML.length);
        console.log("body : " + document.body.innerHTML.length);

        chrome.runtime.sendMessage({
            command: "save-page",
            head: document.head.innerHTML,
            body: document.body.innerHTML,
            url: document.location.href
        }).then().catch(e => console.log(e));
    }
}
