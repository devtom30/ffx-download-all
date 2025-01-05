let forms = document.getElementsByTagName("form");
console.log("forms found " + forms.length);

let form = forms[0];
let inputs = document.getElementsByTagName("input");
let input = inputs[0];
if (input.name === "password"
    && window.location.href.includes("benvenuti")) {
    browser.storage.local.get('password').then((obj) => {
        inputs[0].value = obj.password;
        form.submit();
    });
} else {
    console.log("input named 'password' not found");
    console.log(document.head.innerHTML);
    console.log(document.body.innerHTML);

    browser.runtime.sendMessage({
        command: "save-page",
        head: document.head.innerHTML,
        body: document.body.innerHTML,
        url: document.location.href
    }).then().catch(e => console.log(e));
}
