from rest_framework import serializers
from .models import Project, ContactMessage, Certification


class ProjectSerializer(serializers.ModelSerializer):
    technology_list = serializers.SerializerMethodField()
    has_demo = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'image',
            'technologies', 'technology_list',
            'repo_url', 'demo_url', 'has_demo',
            'featured', 'order', 'created_at'
        ]

    def get_technology_list(self, obj) -> list:
        return obj.technology_list()

    def get_has_demo(self, obj) -> bool:
        return obj.has_demo()


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'created_at', 'read']
        
class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuer', 'date', 'image', 'credential_url', 'order']