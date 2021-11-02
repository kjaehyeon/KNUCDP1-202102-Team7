from django.shortcuts import render
from .serializers import SensorValueSerializer
from .models import SensorValue
from rest_framework import generics, mixins, status
from rest_framework.response import Response

class SensorValueList(generics.APIView, mixins.ListModelMixin):
    serializer_class = SensorValueSerializer

    def perfrom_create(self, serializers):
        serializers.save(self, serializers)


    def post(self, request, *args, **kwargs):
        return self.create_response(request, *args, **kwargs)

