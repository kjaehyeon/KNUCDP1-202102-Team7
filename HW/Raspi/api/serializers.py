from rest_framework import serializers
from .models import DayStatValue, MonthStatValue, SensorValue

class SensorValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorValue
        fields = ['device_id','temperature','humidity','co','propane','datetime']

class DayStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayStatValue
        fields = ['device_id','temperature','humidity','co','propane','datetime']

class MonthStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthStatValue
        fields = ['device_id','temperature','humidity','co','propane','datetime']
