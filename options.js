async function saveOptions(e) {
    e.preventDefault();
    await browser.storage.local.set({
        password: document.querySelector("#password").value
    });
    console.log("Saved");
    let pass = await browser.storage.local.get('password');
    console.log(pass);
}

async function restoreOptions() {
    let res = await browser.storage.managed.get('password');
    document.querySelector("#managed-password").innerText = res.password;

    res = await browser.storage.local.get('password');
    document.querySelector("#password").value = res.password || '';
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);