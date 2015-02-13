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
from features.registry import get_feature_by_uid
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

@csrf_exempt
def share_bookmark(request):
    group_names = request.POST.getlist('groups[]')
    bookmark_uid = request.POST['bookmark']
    bookmark = get_feature_by_uid(bookmark_uid)
    
    viewable, response = bookmark.is_viewable(request.user)
    if not viewable:
        return response
        
    #remove previously shared with groups, before sharing with new list
    bookmark.share_with(None)
    
    groups = []
    for group_name in group_names:
        groups.append(Group.objects.get(name=group_name))
        
    bookmark.share_with(groups, append=False)
    
    return HttpResponse("", status=200)
    
@csrf_exempt
def get_bookmarks(request):
    #sync the client-side bookmarks with the server side bookmarks
    #update the server-side bookmarks and return the new list
    
    # Note: It appears that the only place get_bookmarks is called is in the 
    # initial load of visualize, i.e., prior to there being any bookmarks stored
    # on the client side, so POST is always empty.  
    if 'bookmarks' in request.POST:
        bookmark_dict = request.POST['bookmarks']
        # bookmark_dict = parser.parse(request.POST.urlencode())['bookmarks']
    else:
        bookmark_dict = {}
    
    #loop through the list from the client
    #if user, bm_name, and bm_state match then skip 
    #otherwise, add to the db
    for bookmark in bookmark_dict.values():
        Bookmark.objects.get_or_create(user=request.user, name=bookmark['name'],
                                       url_hash=bookmark['hash'])

    #grab all bookmarks belonging to this user 
    #serialize bookmarks into 'name', 'hash' objects and return json dump 
    content = []
    bookmark_list = Bookmark.objects.filter(user=request.user)
    for bookmark in bookmark_list:
        sharing_groups = [group.name for group in bookmark.sharing_groups.all()]
        content.append({ 
            'uid': bookmark.uid, 
            'name': bookmark.name,
            'hash': bookmark.url_hash, 
            'sharing_groups': sharing_groups
        })
    
    shared_bookmarks = Bookmark.objects.shared_with_user(request.user)
    for bookmark in shared_bookmarks:
        if bookmark not in bookmark_list:
            username = bookmark.user.username
            actual_name = bookmark.user.first_name + ' ' + bookmark.user.last_name
            content.append({
                'uid': bookmark.uid,
                'name': bookmark.name,
                'hash': bookmark.url_hash, 
                'shared': True,
                'shared_by_username': username,
                'shared_by_name': actual_name
            })
    # safe is false because we're returning a list
    return JsonResponse(content, safe=False)


@csrf_exempt
def remove_bookmark(request): 
    # uid = appname_modelname_pk
    key = request.POST['uid']
    key = int(key.split('_')[-1])
    bookmark = get_object_or_404(Bookmark, id=key, user=request.user)
    bookmark.delete()
    return HttpResponse(status=204)

@csrf_exempt
def add_bookmark(request):
    name = request.POST['name']
    url_hash = request.POST['hash']

    bookmark = Bookmark(user=request.user, name=name, url_hash=url_hash)
    bookmark.save()
    sharing_groups = [group.name for group in bookmark.sharing_groups.all()]
    content = [{
        'uid': bookmark.uid,
        'name': bookmark.name, 
        'hash': bookmark.url_hash, 
        'sharing_groups': sharing_groups,
    }]

    return JsonResponse(content, safe=False)
        