// Push a fake history state so browser back is detected
history.pushState(null, null, location.href);

// Listen for browser back
window.addEventListener("popstate", function () {
    window.location.href = "/";
});

function handleDownload(code) {
    const key = "downloaded_" + code;
    const msg = document.getElementById("downloadMessage");

    if (localStorage.getItem(key)) {
        msg.style.display = "block";
        return false; // Stop second download
    }

    // First time
    localStorage.setItem(key, "true");
    msg.style.display = "none";
    return true; // Allow download
}
