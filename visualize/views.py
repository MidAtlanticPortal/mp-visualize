# Create your views here.
from django.contrib.auth.models import Group
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from querystring_parser import parser
import json
from features.registry import user_sharing_groups
from functools import cmp_to_key
import locale

from django.conf import settings
from models import *
from data_manager.models import *
from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse

def show_planner(request, template='visualize/planner.html'):
    try:
        socket_url = settings.SOCKET_URL
    except AttributeError:
        socket_url = ''
    context = {'MEDIA_URL': settings.MEDIA_URL, 'SOCKET_URL': socket_url, 'login': 'true'}
    if request.user.is_authenticated:
        context['session'] = request.session._session_key
    return render_to_response(template, RequestContext(request, context)) 
    
def show_embedded_map(request, template='map.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render_to_response(template, RequestContext(request, context)) 
    
def show_mafmc_map(request, template='mafmc.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render_to_response(template, RequestContext(request, context)) 
    
def show_mobile_map(request, template='mobile-map.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render_to_response(template, RequestContext(request, context)) 


        