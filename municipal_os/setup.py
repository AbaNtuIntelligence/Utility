import os
import subprocess

desktop = r'C:\Users\thabe\Desktop'
project_folder = os.path.join(desktop, 'MunicipalFlow')

if os.path.exists(project_folder):
    import shutil
    shutil.rmtree(project_folder)

os.makedirs(project_folder)
os.chdir(project_folder)

subprocess.run(['pip', 'install', 'django', 'djangorestframework', 'django-cors-headers'])
subprocess.run(['django-admin', 'startproject', 'backend', '.'])

os.makedirs(r'backend\apps\statements')
open(r'backend\apps\__init__.py', 'w').close()
open(r'backend\apps\statements\__init__.py', 'w').close()

with open(r'backend\apps\statements\views.py', 'w') as f:
    f.write('from rest_framework.decorators import api_view\nfrom rest_framework.response import Response\n\n@api_view(["GET"])\ndef test_api(request):\n    return Response({"message": "MunicipalFlow API is working!", "status": "success"})')

with open(r'backend\apps\statements\urls.py', 'w') as f:
    f.write('from django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path("test/", views.test_api, name="test"),\n]')

settings_path = r'backend\backend\settings.py'
with open(settings_path, 'r') as f:
    settings = f.read()

settings = settings.replace('INSTALLED_APPS = [', 'INSTALLED_APPS = [\n    "rest_framework",\n    "corsheaders",\n    "apps.statements",')
settings = settings.replace('MIDDLEWARE = [', 'MIDDLEWARE = [\n    "corsheaders.middleware.CorsMiddleware",')
settings += '\nCORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]\nREST_FRAMEWORK = {"DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"]}'

with open(settings_path, 'w') as f:
    f.write(settings)

urls_path = r'backend\backend\urls.py'
with open(urls_path, 'r') as f:
    urls = f.read()

urls = urls.replace('from django.urls import path', 'from django.urls import path, include')
urls = urls.replace('urlpatterns = [', 'urlpatterns = [\n    path("api/", include("apps.statements.urls")),')

with open(urls_path, 'w') as f:
    f.write(urls)

subprocess.run(['python', r'backend\manage.py', 'makemigrations'])
subprocess.run(['python', r'backend\manage.py', 'migrate'])

with open('START_SERVER.bat', 'w') as f:
    f.write('@echo off\ncd /d %~dp0backend\npython manage.py runserver\npause')

print("SUCCESS! MunicipalFlow created on your Desktop")
os.startfile(project_folder)
