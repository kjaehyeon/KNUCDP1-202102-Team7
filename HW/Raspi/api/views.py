from .serializers import DayStatSerializer, MonthStatSerializer, SensorValueSerializer
from .models import DayStatValue, MonthStatValue, SensorValue
from rest_framework import generics, mixins
from datetime import datetime

class DayStat(generics.GenericAPIView, mixins.ListModelMixin):
    serializer_class = SensorValueSerializer
    
    def get_queryset(self):
        tmp : datetime = datetime.strptime(self.request.GET['datetime'],"%Y-%m-%d")
        return SensorValue.objects.filter(datetime__year = tmp.year, 
                                           datetime__month = tmp.month,
                                           datetime__day = tmp.day)
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class MonthStat(generics.GenericAPIView, mixins.ListModelMixin):
    serializer_class = DayStatSerializer
    
    def get_queryset(self):
        tmp : datetime = datetime.strptime(self.request.GET['datetime'],"%Y-%m")
        
        return DayStatValue.objects.filter(datetime__year = tmp.year, 
                                           datetime__month = tmp.month)
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    
class YearStat(generics.GenericAPIView, mixins.ListModelMixin):
    serializer_class = MonthStatSerializer
    
    def get_queryset(self):
        tmp : datetime = datetime.strptime(self.request.GET['datetime'],"%Y")
        
        return MonthStatValue.objects.filter(datetime__year = tmp.year)
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
