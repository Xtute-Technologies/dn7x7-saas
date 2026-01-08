from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer, UserSerializer as BaseUserSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'organization', 'profile_image',
                  'password')


class UserSerializer(BaseUserSerializer):
    role = serializers.SerializerMethodField()

    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'organization', 'profile_image', 'role','date_joined')
        read_only_fields = ('is_staff',)

    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'user'
class AdminUserSerializer(BaseUserSerializer):
    role = serializers.SerializerMethodField()

    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'organization', 'profile_image', 'role','date_joined','is_active','is_staff')
        read_only_fields = ('is_staff',)

    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'user'
