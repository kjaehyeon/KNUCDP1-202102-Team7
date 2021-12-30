from django.urls import path, include

from . import views

urlpatterns = [
    path('test_page/', views.index_test),
    path('sensor_val/', views.sensor_value)
]