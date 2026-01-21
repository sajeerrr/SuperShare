from django.shortcuts import render
from django.http import FileResponse
from .models import SharedFile
import random, string, zipfile, os
from django.conf import settings
import threading
import time

def generate_unique_code():
    while True:
        code = ''.join(random.choices(string.digits, k=5))
        if not SharedFile.objects.filter(code=code).exists():
            return code


def home(request):
    return render(request, "home.html")


def upload_file(request):
    if request.method == "POST":
        files = request.FILES.getlist("files")

        if not files:
            return render(request, "upload.html", {"error": "No files uploaded"})

        code = generate_unique_code()

        for f in files:
            SharedFile.objects.create(code=code, file=f)

        return render(request, "show_code.html", {"code": code})

    return render(request, "upload.html")


def receive_file(request):
    if request.method == "POST":
        code = request.POST.get("code")
        files = SharedFile.objects.filter(code=code)

        if not files.exists():
            return render(request, "receive.html", {"error": "Invalid Code"})

        if files.first().is_expired():
            files.delete()
            return render(request, "receive.html", {"error": "Code expired"})

        return render(request, "download.html", {"code": code})

    return render(request, "receive.html")


def delete_file_later(path, delay=5):
    time.sleep(delay)
    try:
        if os.path.exists(path):
            os.remove(path)
    except:
        pass


def download_file(request, code):
    files = SharedFile.objects.filter(code=code)

    if not files.exists():
        return render(request, "receive.html", {"error": "Invalid or expired code"})

    if files.first().is_expired():
        files.delete()
        return render(request, "receive.html", {"error": "Code expired"})

    # Single file
    if files.count() == 1:
        f = files.first()
        response = FileResponse(open(f.file.path, "rb"), as_attachment=True)
        files.delete()  # deletes DB + disk
        return response

    # Multiple → ZIP
    zip_path = os.path.join(settings.MEDIA_ROOT, f"{code}.zip")

    with zipfile.ZipFile(zip_path, "w") as zipf:
        for f in files:
            zipf.write(f.file.path, os.path.basename(f.file.path))

    response = FileResponse(open(zip_path, "rb"), as_attachment=True)

    files.delete()  # delete originals

    # delete zip later
    threading.Thread(target=delete_file_later, args=(zip_path,)).start()

    return response


def preview_file(request, code):
    files = SharedFile.objects.filter(code=code)

    if not files.exists():
        return render(request, "receive.html", {"error": "Invalid or expired code"})

    if files.first().is_expired():
        files.delete()
        return render(request, "receive.html", {"error": "Code expired"})

    return render(request, "download.html", {"code": code})
