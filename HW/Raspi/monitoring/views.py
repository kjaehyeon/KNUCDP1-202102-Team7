async_mode = None

import os

from django.http import HttpResponse
from rest_framework.response import Response
import socketio
from api.models import SensorValue, DayStatValue, MonthStatValue
from datetime import datetime
import json

basedir = os.path.dirname(os.path.realpath(__file__))
sio = socketio.Server(async_mode=async_mode)
thread = None

# def data_processing(data):
#     now : datetime = datetime.datetime.now()
#     #store data on every 30minute
#     if((now.minute == 30 or now.minute == 0) and now.second == 0):
#         parsed_data = json.loads(data)
#         SensorValue.objects.create(device_id=parsed_data["device_id"], temperature=parsed_data["temperature"]
#                                    , humidity=parsed_data["humidity"], co=parsed_data["co"], propane=parsed_data["propane"],
#                                    flame=parsed_data["flame"], vibration=parsed_data["vibration"])
#     #store data every day
#     if(now.hour == 0 and now.minute == 0 and now.second == 0):
#         todayList = SensorValue.objects.filter(datetime__year=now.year, datetime__month=now.month, datetime__day=now.day)
        
    
#     if(now.day == 1 and now.hour == 0 and now.minute == 0 and now.second == 0 ):
#         monvalList = MonthStatValue.objects.filter(datetime__year=now.year)
        
        
def index(request):
    global thread
    if thread is None:
        thread = sio.start_background_task(background_thread)
    return HttpResponse(status=200)
    #return HttpResponse(open(os.path.join(basedir, 'static/index.html')))

def index_test(request):
    global thread
    if thread is None:
        thread = sio.start_background_task(background_thread)
    #return HttpResponse('connected!')
    return HttpResponse(open(os.path.join(basedir, 'static/index.html')))


def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        sio.sleep(10)
        count += 1
        sio.emit('my_response', {'data': 'Server generated event'},
                 namespace='/test')

@sio.event
def my_broadcast_event(sid, message):
    sio.emit('my_response', {'data': message['data']})
    #data_processing(message['data'])

#추후 다중 센서 디바이스 연결을 위한 함수
@sio.event
def my_event(sid, message):
    sio.emit('my_response', {'data': message['data']}, room=sid)

@sio.event
def join(sid, message):
    sio.enter_room(sid, message['room'])
    sio.emit('my_response', {'data': 'Entered room: ' + message['room']},
             room=sid)

@sio.event
def leave(sid, message):
    sio.leave_room(sid, message['room'])
    sio.emit('my_response', {'data': 'Left room: ' + message['room']},
             room=sid)

@sio.event
def close_room(sid, message):
    sio.emit('my_response',
             {'data': 'Room ' + message['room'] + ' is closing.'},
             room=message['room'])
    sio.close_room(message['room'])

@sio.event
def my_room_event(sid, message):
    sio.emit('my_response', {'data': message['data']}, room=message['room'])

@sio.event
def disconnect_request(sid):
    sio.disconnect(sid)

@sio.event
def connect(sid, environ):
    sio.emit('my_response', {'data': 'Connected', 'count': 0}, room=sid)

@sio.event
def disconnect(sid):
    print('Client disconnected')


