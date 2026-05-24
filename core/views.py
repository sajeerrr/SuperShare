from django.shortcuts import render
from django.http import HttpResponse
from .models import SharedFile
import random
import string
import zipfile
import io


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
            SharedFile.objects.create(
                code=code,
                filename=f.name,
                content_type=f.content_type or 'application/octet-stream',
                file_data=f.read(),
            )

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


def download_file(request, code):
    files = SharedFile.objects.filter(code=code)

    if not files.exists():
        return render(request, "receive.html", {"error": "Invalid or expired code"})

    if files.first().is_expired():
        files.delete()
        return render(request, "receive.html", {"error": "Code expired"})

    # Single file — serve directly from DB
    if files.count() == 1:
        f = files.first()
        response = HttpResponse(
            bytes(f.file_data),
            content_type=f.content_type,
        )
        response['Content-Disposition'] = f'attachment; filename="{f.filename}"'
        files.delete()
        return response

    # Multiple files → ZIP in memory
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in files:
            zipf.writestr(f.filename, bytes(f.file_data))

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/zip',
    )
    response['Content-Disposition'] = f'attachment; filename="{code}.zip"'

    files.delete()
    return response


def preview_file(request, code):
    files = SharedFile.objects.filter(code=code)

    if not files.exists():
        return render(request, "receive.html", {"error": "Invalid or expired code"})

    if files.first().is_expired():
        files.delete()
        return render(request, "receive.html", {"error": "Code expired"})

    return render(request, "download.html", {"code": code})
