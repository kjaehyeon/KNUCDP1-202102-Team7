from django.shortcuts import render
from .serializers import SensorValueSerializer
from .models import SensorValue
from rest_framework import generics, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import api_view


class SensorValueList(generics.GenericAPIView, mixins.ListModelMixin):
    serializer_class = SensorValueSerializer

    def perfrom_create(self, serializers):
        serializers.save(self, serializers)

    def post(self, request, *args, **kwargs):
        return self.create_response(request, *args, **kwargs)

def visitor_ip_address(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['GET'])
def SensorInitial(request):
    global websoc_svr
    if request.method == 'GET':
        return Response(status=200)



