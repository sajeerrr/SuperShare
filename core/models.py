from django.db import models
from django.utils import timezone
from datetime import timedelta


class SharedFile(models.Model):
    code = models.CharField(max_length=5, db_index=True)  # ❗ NO unique
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100, default='application/octet-stream')
    file_data = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)
