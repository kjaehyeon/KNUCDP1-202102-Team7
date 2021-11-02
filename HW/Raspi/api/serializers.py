from rest_framework import serializers
from .models import SensorValue

class SensorValueSerializer(serializers.ModelSerializer):
    class meta:
        model = SensorValue
        fields = ['id','device_id','temperature','humidity','co','propane','flame','datetime']
