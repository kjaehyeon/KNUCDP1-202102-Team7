from django.conf.urls import url

from . import views

urlpatterns = [
    url('test/', views.index),#, name='index'),
    url('test_page/', views.index_test)
]