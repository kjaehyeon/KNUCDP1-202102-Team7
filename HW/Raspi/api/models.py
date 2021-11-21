from django.db import models

class SensorValue(models.Model):
    device_id = models.IntegerField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    co = models.FloatField()
    propane = models.FloatField()
    flame = models.IntegerField()
    vibration = models.IntegerField()
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.pk}][{self.device_id}]'

class DayStatValue(models.Model):
    device_id = models.IntegerField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    co = models.FloatField()
    propane = models.FloatField()
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.pk}][{self.device_id}]'

class MonthStatValue(models.Model):
    device_id = models.IntegerField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    co = models.FloatField()
    propane = models.FloatField()
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.pk}][{self.device_id}]'
    

    


