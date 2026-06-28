from django.urls import path
from .views import (
    ProjectListController,
    ProjectDetailController,
    ContactListController,
    ContactDetailController,
    CertificationListController,
    CertificationDetailController,
)

urlpatterns = [
    path('projects/', ProjectListController.as_view()),
    path('projects/<int:pk>/', ProjectDetailController.as_view()),
    path('contact/', ContactListController.as_view()),
    path('contact/<int:pk>/read/', ContactDetailController.as_view()),
    path('certifications/', CertificationListController.as_view()),
    path('certifications/<int:pk>/', CertificationDetailController.as_view()),
]