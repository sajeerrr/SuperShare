from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
import os


def sitemap_view(request):
    sitemap_path = os.path.join(settings.BASE_DIR, "sitemap.xml")
    with open(sitemap_path, "r") as f:
        return HttpResponse(f.read(), content_type="application/xml")

def robots_view(request):
    robots_path = os.path.join(settings.BASE_DIR, "robots.txt")
    with open(robots_path, "r") as f:
        return HttpResponse(f.read(), content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path("sitemap.xml", sitemap_view),
    path("robots.txt", robots_view),
]
