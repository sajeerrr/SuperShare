from django.contrib import admin
from .models import SharedFile


@admin.register(SharedFile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ("filename", "created_at")
    ordering = ("-created_at",)

    exclude = ("file_data", "code")  # Hide binary data & code completely
    readonly_fields = ("filename", "content_type", "created_at",)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

