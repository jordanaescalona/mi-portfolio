from .repositories import ProjectRepository, ContactRepository, CertificationRepository


class ProjectService:
    def __init__(self):
        self.repository = ProjectRepository()

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def get_featured(self):
        return self.repository.get_featured()

    def create(self, data: dict):
        return self.repository.create(data)

    def update(self, id: int, data: dict):
        project = self.repository.get_by_id(id)
        if not project:
            return None
        return self.repository.update(project, data)

    def delete(self, id: int) -> bool:
        project = self.repository.get_by_id(id)
        if not project:
            return False
        self.repository.delete(project)
        return True


class ContactService:
    def __init__(self):
        self.repository = ContactRepository()

    def send_message(self, name: str, email: str, message: str):
        if not all([name, email, message]):
            raise ValueError("Todos los campos son obligatorios")
        return self.repository.save(name, email, message)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def mark_as_read(self, id: int) -> bool:
        message = self.repository.get_by_id(id)
        if not message:
            return False
        message.mark_as_read()
        return True

class CertificationService:
    def __init__(self):
        self.repository = CertificationRepository()

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def create(self, data: dict):
        return self.repository.create(data)

    def update(self, id: int, data: dict):
        certification = self.repository.get_by_id(id)
        if not certification:
            return None
        return self.repository.update(certification, data)

    def delete(self, id: int) -> bool:
        certification = self.repository.get_by_id(id)
        if not certification:
            return False
        self.repository.delete(certification)
        return True