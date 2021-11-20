from django.urls import path
from . import views

urlpatterns =[
    path('stat/day', views.DayStat.as_view()),
    path('stat/month', views.MonthStat.as_view()),
    path('stat/year', views.YearStat.as_view()),
]