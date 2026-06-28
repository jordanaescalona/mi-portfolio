from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .services import ProjectService, ContactService, CertificationService
from .serializers import ProjectSerializer, ContactMessageSerializer, CertificationSerializer

class ProjectListController(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProjectService()

    def get(self, request):
        featured = request.query_params.get('featured')
        projects = self.service.get_featured() if featured else self.service.get_all()
        serializer = ProjectSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        project = self.service.create(serializer.validated_data)
        return Response(ProjectSerializer(project, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ProjectDetailController(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProjectService()

    def get(self, request, pk: int):
        project = self.service.get_by_id(pk)
        if not project:
            return Response({'error': 'Proyecto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProjectSerializer(project, context={'request': request}).data)

    def put(self, request, pk: int):
        project = self.service.update(pk, request.data)
        if not project:
            return Response({'error': 'Proyecto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProjectSerializer(project, context={'request': request}).data)

    def delete(self, request, pk: int):
        deleted = self.service.delete(pk)
        if not deleted:
            return Response({'error': 'Proyecto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContactListController(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ContactService()

    def get(self, request):
        messages = self.service.get_all()
        return Response(ContactMessageSerializer(messages, many=True).data)

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            message = self.service.send_message(
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                message=serializer.validated_data['message']
            )
            return Response(ContactMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ContactDetailController(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ContactService()

    def patch(self, request, pk: int):
        updated = self.service.mark_as_read(pk)
        if not updated:
            return Response({'error': 'Mensaje no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 'marcado como leído'})
    

class CertificationListController(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = CertificationService()

    def get(self, request):
        certifications = self.service.get_all()
        serializer = CertificationSerializer(certifications, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CertificationSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        certification = self.service.create(serializer.validated_data)
        return Response(CertificationSerializer(certification, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CertificationDetailController(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = CertificationService()

    def get(self, request, pk: int):
        certification = self.service.get_by_id(pk)
        if not certification:
            return Response({'error': 'Certificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CertificationSerializer(certification, context={'request': request}).data)

    def put(self, request, pk: int):
        certification = self.service.update(pk, request.data)
        if not certification:
            return Response({'error': 'Certificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CertificationSerializer(certification, context={'request': request}).data)

    def delete(self, request, pk: int):
        deleted = self.service.delete(pk)
        if not deleted:
            return Response({'error': 'Certificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)