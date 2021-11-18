"""
WSGI config for autoin project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
import socketio
from monitoring.views import sio
import eventlet
import eventlet.wsgi

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'autoin.settings')

django_app = get_wsgi_application()
application = socketio.WSGIApp(sio, django_app)
eventlet.wsgi.server(eventlet.listen(('', 8000)), application)