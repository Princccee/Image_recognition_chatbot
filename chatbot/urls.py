from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('process-input/', views.process_input, name='process-input'),
]