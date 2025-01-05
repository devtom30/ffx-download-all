const saveOptions = () => {
    const passwordValue = document.querySelector("#password").value
    chrome.storage.local.set(
        { password: passwordValue },
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(() => {
                status.textContent = '';
            }, 750);
        }
    );
};

const restoreOptions = () => {
    chrome.storage.local.get(["password"])
        .then((result) => {
            document.getElementById('password').value = result.password;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);