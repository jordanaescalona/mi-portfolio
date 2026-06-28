from abc import ABC, abstractmethod
from typing import Optional
from .models import Project, ContactMessage, Certification


class BaseRepository(ABC):
    @abstractmethod
    def get_all(self):
        pass

    @abstractmethod
    def get_by_id(self, id: int):
        pass


class ProjectRepository(BaseRepository):
    def get_all(self):
        return Project.objects.all()

    def get_by_id(self, id: int) -> Optional[Project]:
        try:
            return Project.objects.get(pk=id)
        except Project.DoesNotExist:
            return None

    def get_featured(self):
        return Project.objects.filter(featured=True)

    def create(self, data: dict) -> Project:
        return Project.objects.create(**data)

    def update(self, project: Project, data: dict) -> Project:
        for key, value in data.items():
            setattr(project, key, value)
        project.save()
        return project

    def delete(self, project: Project):
        project.delete()


class ContactRepository:
    def save(self, name: str, email: str, message: str) -> ContactMessage:
        return ContactMessage.objects.create(
            name=name,
            email=email,
            message=message
        )

    def get_all(self):
        return ContactMessage.objects.all().order_by('-created_at')

    def get_by_id(self, id: int) -> Optional[ContactMessage]:
        try:
            return ContactMessage.objects.get(pk=id)
        except ContactMessage.DoesNotExist:
            return None
        
class CertificationRepository:
    def get_all(self):
        return Certification.objects.all()

    def get_by_id(self, id: int):
        try:
            return Certification.objects.get(pk=id)
        except Certification.DoesNotExist:
            return None

    def create(self, data: dict) -> Certification:
        return Certification.objects.create(**data)

    def update(self, certification: Certification, data: dict) -> Certification:
        for key, value in data.items():
            setattr(certification, key, value)
        certification.save()
        return certification

    def delete(self, certification: Certification):
        certification.delete()