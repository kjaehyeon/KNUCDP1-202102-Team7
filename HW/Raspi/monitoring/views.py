async_mode = None

import os
import asyncio

from django.http import HttpResponse
from rest_framework.response import Response
import socketio
from api.models import SensorValue, DayStatValue, MonthStatValue
from datetime import datetime
from rest_framework.decorators import api_view
import json
from datetime import datetime, timedelta
import eventlet
from django.db.models import Avg
import requests
from django.http import JsonResponse  
import socket

basedir = os.path.dirname(os.path.realpath(__file__))
#eventlet.monkey_patch()
sio = socketio.Server(async_mode='eventlet', cors_allowed_origins='*', cors_credentials=True)

thread = None

#일정 시간마다 데이터 저장하는 함수
def data_processing(parsed_data):
    now = datetime.now()
    #store data on every 30minute
    if(now.minute == 30 or now.minute == 0):
        if(not SensorValue.objects.filter(device_id=parsed_data["device_id"], datetime__year = now.year, datetime__month = now.month, 
                                        datetime__day = now.day, datetime__hour=now.hour, datetime__minute=now.minute).exists()):
            SensorValue.objects.create(device_id=parsed_data["device_id"], temperature=parsed_data["temperature"]
                                        , humidity=parsed_data["humidity"], co=parsed_data["co"], propane=parsed_data["propane"],
                                        flame=parsed_data["flame"], vibration=parsed_data["vibration"])
    #store statistic data of yesterday
    if(now.hour == 0 and now.minute == 1 and now.second == 0):
        yesterday = now - timedelta(days=1)
        if(not DayStatValue.objects.filter(device_id=parsed_data["device_id"],datetime__year=yesterday.year, datetime__month=yesterday.month, datetime__day=yesterday.day).exists()):
            yesterdayValueList : SensorValue = SensorValue.objects.filter(device_id=parsed_data["device_id"],datetime__year=yesterday.year, datetime__month=yesterday.month, datetime__day=yesterday.day)
            aggreResult = yesterdayValueList.values('device_id').aggregate(Avg('temperature'), Avg('humidity'), Avg('co'), Avg('propane'))
            tmp = DayStatValue(device_id=parsed_data["device_id"],temperature=aggreResult['temperature__avg'], humidity=aggreResult['humidity__avg'],
                            co=aggreResult['co__avg'], propane=aggreResult['propane__avg'], datetime=yesterday)
            tmp.save()
            
    #store statistic data of last month
    if(now.day == 1 and now.hour == 0 and now.minute == 1 and now.second == 0 ):
        yesterday = now - timedelta(days=1)
        if(not MonthStatValue.objects.filter(device_id=parsed_data["device_id"],datetime__year=yesterday.year, datetime__month=yesterday.month).exists()):
            LastMonthValueList : DayStatValue = DayStatValue.objects.filter(device_id=parsed_data["device_id"],datetime__year=yesterday.year, datetime__month=yesterday.month)
            aggreResult = LastMonthValueList.values('device_id').aggregate(Avg('temperature'), Avg('humidity'), Avg('co'), Avg('propane'))
            tmp = MonthStatValue(device_id=parsed_data["device_id"],temperature=aggreResult['temperature__avg'], humidity=aggreResult['humidity__avg'],
                            co=aggreResult['co__avg'], propane=aggreResult['propane__avg'], datetime=yesterday)
            tmp.save()

class AuthSmsSend():
    EmgCount = 0
    pre = 0
    time = None

def notiEmg(data):
    if data["flame"] == 0 or data["temperature"] > 100 or data["co"] > 200 or data["propane"] > 15 or data["vibration"] < 1000:
        AuthSmsSend.pre = 1
        ip = requests.get("https://api.ipify.org").text
        if (AuthSmsSend.time is not None):
            timeDiff = datetime.now() - AuthSmsSend.time
        if AuthSmsSend.EmgCount >= 5 and (AuthSmsSend.time is None or timeDiff >= timedelta(hours = 1)):
            headers ={
                'Content-Type': 'application/json; charset=utf-8',
                'client-ip' : f'http://{ip}:50000'
            }
            response = requests.get('http://192.168.0.17:5000/Api/Alert', headers=headers)

            AuthSmsSend.EmgCount = 0
        else:
            if (AuthSmsSend.pre == 1):
                AuthSmsSend.EmgCount += 1
    else:
        if (AuthSmsSend.pre == 1):
            AuthSmsSend.EmgCount = 0
        AuthSmsSend.pre = 0
        return 

#센서 디바이스로 부터 데이터 받아오는 함수
@api_view(['GET'])
def sensor_value(request):
    if(request.method == 'GET'):
        parsed_data : json = json.loads('{"device_id":'+request.GET['device_id']+
                            ',"temperature":'+request.GET['temperature']+
                            ',"humidity":'+request.GET['humidity']+
                            ',"co":'+request.GET['co']+
                            ',"propane":'+request.GET['propane']+
                            ',"flame":'+request.GET['flame']+
                            ',"vibration":'+request.GET['vibration']+
                            '}')
        data = json.dumps(parsed_data)
        sio.emit('response', {'data' : data})
        data_processing(parsed_data)
        notiEmg(parsed_data)
    return Response(status=200)

#socket.io 테스트 페이지       
def index_test(request):
    global thread
    if thread is None:
        thread = sio.start_background_task(background_thread)
    return HttpResponse(open(os.path.join(basedir, 'static/index.html')))

def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        sio.sleep(10)
        count += 1
        sio.emit('response', {'data': 'Server generated event'},
                 namespace='/test')
    
@sio.event
def my_broadcast_event(sid, message):
    sio.emit('response', {'data': message['data']})
    
@sio.event
def camera_move(sid, message):
    orientation = message['data']
    clientsocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    clientsocket.setblocking(False)
    try:
        clientsocket.connect(("192.168.0.21", 1234))
        if(orientation == 'r'):
            clientsocket.send((orientation+'\n').encode('utf-8'))
        elif(orientation == 'l'):
            clientsocket.send((orientation+'\n').encode('utf-8'))
    except (socket.error , BlockingIOError) as e:
        pass
    finally:
        clientsocket.close()
    
#추후 다중 센서 디바이스 연결을 위한 함수
@sio.event
def my_event(sid, message):
    sio.emit('response', {'data': message['data']}, room=sid)

@sio.event
def join(sid, message):
    sio.enter_room(sid, message['room'])
    sio.emit('response', {'data': 'Entered room: ' + message['room']},
             room=sid)

@sio.event
def leave(sid, message):
    sio.leave_room(sid, message['room'])
    sio.emit('response', {'data': 'Left room: ' + message['room']},
             room=sid)

@sio.event
def close_room(sid, message):
    sio.emit('response',
             {'data': 'Room ' + message['room'] + ' is closing.'},
             room=message['room'])
    sio.close_room(message['room'])

@sio.event
def my_room_event(sid, message):
    sio.emit('response', {'data': message['data']}, room=message['room'])

@sio.event
def disconnect_request(sid):
    sio.disconnect(sid)

@sio.event
def connect(sid, environ):
    sio.emit('response', {'data': 'Connected'}, room=sid)

@sio.event
def disconnect(sid):
    print('Client disconnected')


