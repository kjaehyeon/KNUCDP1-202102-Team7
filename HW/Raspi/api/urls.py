from django.urls import path
from . import views

urlpatterns =[
    #path('monitoring/', views.category_page),
    #path('stat/', views.tag_page),
    path('sensorval/', views.SensorValueList.as_view()),
    path('initial/', views.SensorInitial),
]