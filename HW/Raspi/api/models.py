from django.db import models

class SensorValue(models.Model):
    id = models.AutoField(primary_key=True)
    device_id = models.IntegerField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    co = models.FloatField()
    propane = models.FloatField()
    flame = models.IntegerField(max_length=1)
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.pk}][{self.device_id}]'


    


