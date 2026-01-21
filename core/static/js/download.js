// Push a fake history state so browser back is detected
history.pushState(null, null, location.href);

// Listen for browser back
window.addEventListener("popstate", function () {
    window.location.href = "/";
});
