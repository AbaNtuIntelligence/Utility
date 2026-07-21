from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_api, name='test'),
    path('list/', views.properties_list, name='list'),
    path('upload/', views.upload_statement, name='upload'),
]