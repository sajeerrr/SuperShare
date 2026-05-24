import threading
import time
from django.utils import timezone
from datetime import timedelta
from .models import SharedFile


def background_cleaner():
    while True:
        expired_files = SharedFile.objects.filter(
            created_at__lt=timezone.now() - timedelta(minutes=5)
        )
        expired_files.delete()
        time.sleep(60)  # run every 1 minute


def start_background_cleaner():
    thread = threading.Thread(target=background_cleaner, daemon=True)
    thread.start()
