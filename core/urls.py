from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('upload/', views.upload_file, name="upload"),
    path('receive/', views.receive_file, name="receive"),
    path('download/<code>/', views.download_file, name="download"),
    path('preview/<code>/', views.preview_file, name="preview"),
]
