document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const dropContent = document.getElementById("dropContent");
    const form = document.getElementById("uploadForm");
    const errorMsg = document.getElementById("uploadError");
    const loader = document.getElementById("loader");
    const progressText = document.getElementById("progressText");
    const submitBtn = document.getElementById("submitBtn");

    let filesArray = [];

    dropZone.onclick = () => fileInput.click();

    dropZone.ondragover = e => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    };

    dropZone.ondragleave = () => dropZone.classList.remove("dragover");

    dropZone.ondrop = e => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        addFiles(e.dataTransfer.files);
    };

    fileInput.onchange = () => {
        addFiles(fileInput.files);
        fileInput.value = "";
    };

    function truncate(name) {
        if (name.length <= 18) return name;
        const ext = name.split('.').pop();
        return name.substring(0, 10) + "..." + ext;
    }

    function addFiles(newFiles) {
        Array.from(newFiles).forEach(file => filesArray.push(file));
        renderFiles();
    }

    function renderFiles() {
        fileList.innerHTML = "";

        if (filesArray.length === 0) {
            dropContent.style.display = "block";
            return;
        }

        dropContent.style.display = "none";

        filesArray.forEach((file, index) => {
            const li = document.createElement("li");
            li.className = "file-item";

            li.innerHTML = `
                <span class="file-name" title="${file.name}">
                    ${truncate(file.name)}
                </span>
                <span class="file-size">
                    ${(file.size / 1024).toFixed(1)} KB
                </span>
                <span class="remove-btn" data-index="${index}">✖</span>
            `;

            fileList.appendChild(li);
        });

        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const index = this.getAttribute("data-index");
                filesArray.splice(index, 1);
                renderFiles();
            };
        });
    }

    form.onsubmit = e => {
        e.preventDefault();

        if (filesArray.length === 0) {
            errorMsg.innerText = "First upload a file";
            errorMsg.style.display = "block";
            return;
        }

        errorMsg.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.innerText = "Uploading...";
        loader.style.display = "flex";

        const formData = new FormData(form);
        filesArray.forEach(file => formData.append("files", file));

        const xhr = new XMLHttpRequest();
        xhr.open("POST", form.action, true);

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressText.innerText = percent + "%";
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 302) {
                // Proper navigation
                document.open();
                document.write(xhr.responseText);
                document.close();
            }
        };

        xhr.send(formData);
    };
});
