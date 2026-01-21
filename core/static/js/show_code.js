let totalSeconds = 300;

document.addEventListener("DOMContentLoaded", function () {
    const timerEl = document.getElementById("timer");
    const progressEl = document.getElementById("progress");

    const qrBtn = document.getElementById("qrBtn");
    const backBtn = document.getElementById("backBtn");
    const homeBtn = document.getElementById("homeBtn");

    const codeBox = document.getElementById("codeBox");
    const qrBox = document.getElementById("qrBox");
    const qrCanvas = document.getElementById("qrCanvas");

    const codeText = document.getElementById("codeText").innerText.trim();

    const baseURL = getBaseURL();
    const downloadUrl = `${baseURL}/preview/${codeText}/`;

    // TIMER
    const interval = setInterval(() => {
        totalSeconds--;

        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        timerEl.innerText = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;

        let percent = (totalSeconds / 300) * 100;
        progressEl.style.width = percent + "%";

        if (totalSeconds <= 0) {
            clearInterval(interval);
            timerEl.innerText = "Code Expired";
            timerEl.style.color = "red";
            progressEl.style.width = "0%";
        }
    }, 1000);

    // QR BUTTON
    qrBtn.addEventListener("click", () => {
        codeBox.classList.add("hidden");
        qrBox.classList.remove("hidden");

        qrBtn.classList.add("hidden");
        homeBtn.classList.add("hidden");
        backBtn.classList.remove("hidden");

        QRCode.toCanvas(qrCanvas, downloadUrl, {
            width: 200,
            color: {
                dark: "#00ffff",
                light: "#000000"
            }
        });
    });

    // BACK BUTTON
    backBtn.addEventListener("click", () => {
        qrBox.classList.add("hidden");
        codeBox.classList.remove("hidden");

        backBtn.classList.add("hidden");
        qrBtn.classList.remove("hidden");
        homeBtn.classList.remove("hidden");
    });
});

function getBaseURL() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}
