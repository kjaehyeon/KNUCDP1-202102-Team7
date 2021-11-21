from django.conf.urls import url

from . import views

urlpatterns = [
    url('test_page/', views.index_test),
    url('sensor_val/', views.sensor_value)
]