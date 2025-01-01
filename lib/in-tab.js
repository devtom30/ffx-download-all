let forms = document.getElementsByTagName("form");
console.log("forms found " + forms.length);

let form = forms[0];
let inputs = document.getElementsByTagName("input");
let input = inputs[0];
if (input.name === "password"
    && window.location.href.includes("benvenuti")) {
    let password = "";
    inputs[0].value = password;
    form.submit();
} else {
    console.log("input named 'password' not found");
    console.log(document.head.innerHTML);
    console.log(document.body.innerHTML);
}