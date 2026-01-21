let totalSeconds = 300;

document.addEventListener("DOMContentLoaded", function () {
    const timerEl = document.getElementById("timer");
    const progressEl = document.getElementById("progress");

    const qrBtn = document.getElementById("qrBtn");
    const backBtn = document.getElementById("backBtn");
    const homeBtn = document.getElementById("homeBtn");
    const reloadBtn = document.getElementById("reloadBtn");

    const codeBox = document.getElementById("codeBox");
    const qrBox = document.getElementById("qrBox");
    const qrCanvas = document.getElementById("qrCanvas");

    let codeTextEl = document.getElementById("codeText");
    let codeText = codeTextEl.innerText.trim();

    const baseURL = getBaseURL();
    const downloadUrl = `${baseURL}/preview/${codeText}/`;

    function startTimer() {
        return setInterval(() => {
            totalSeconds--;

            let minutes = Math.floor(totalSeconds / 60);
            let seconds = totalSeconds % 60;

            timerEl.innerText = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;

            let percent = (totalSeconds / 300) * 100;
            progressEl.style.width = percent + "%";

            if (totalSeconds <= 0) {
                clearInterval(interval);
                timerEl.innerText = "Code Expired";
                progressEl.style.width = "0%";
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(interval);
        totalSeconds = 300;

        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        timerEl.innerText = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Blink new time
        timerEl.classList.add("timer-blink");
        setTimeout(() => {
            timerEl.classList.remove("timer-blink");
        }, 800);

        interval = startTimer();
    }

    // ========== QR BUTTON ==========
    qrBtn.addEventListener("click", () => {
        codeBox.classList.add("hidden");
        qrBox.classList.remove("hidden");

        qrBtn.classList.add("hidden");
        homeBtn.classList.add("hidden");
        backBtn.classList.remove("hidden");

        generateQR(downloadUrl);
    });

    // ========== BACK BUTTON ==========
    backBtn.addEventListener("click", () => {
        qrBox.classList.add("hidden");
        codeBox.classList.remove("hidden");

        backBtn.classList.add("hidden");
        qrBtn.classList.remove("hidden");
        homeBtn.classList.remove("hidden");
    });

    // ========== RELOAD BUTTON ==========
    reloadBtn.addEventListener("click", async () => {
        if (reloadBtn.disabled) return;

        reloadBtn.disabled = true;

        // Force browser to repaint before spinning
        reloadBtn.classList.remove("loading");
        void reloadBtn.offsetWidth;
        reloadBtn.classList.add("loading");

        try {
            const response = await fetch(`/regenerate/${codeText}/`);
            const data = await response.json();

            if (data.new_code) {
                codeText = data.new_code;
                codeTextEl.innerText = data.new_code;

                downloadUrl = `${baseURL}/preview/${codeText}/`;

                resetTimer();

                if (!qrBox.classList.contains("hidden")) {
                    generateQR(downloadUrl);
                }
            } else {
                alert("Failed to regenerate code");
            }
        } catch (err) {
            alert("Network error");
        }

        // Small delay so spin is visible
        setTimeout(() => {
            reloadBtn.disabled = false;
            reloadBtn.classList.remove("loading");
        }, 400);
    });

    function generateQR(url) {
        QRCode.toCanvas(qrCanvas, url, {
            width: 200,
            color: {
                dark: "#00ffff",
                light: "#000000"
            }
        });
    }
});

function getBaseURL() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}
