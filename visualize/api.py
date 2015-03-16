from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rpc4django import rpcmethod
from features.registry import get_feature_by_uid
from visualize.models import Bookmark

@rpcmethod(login_required=True)
def add_bookmark(name, url_hash, **kwargs):
    request = kwargs['request']

    bookmark = Bookmark(user=request.user, name=name, url_hash=url_hash)
    bookmark.save()
    sharing_groups = [group.name for group in bookmark.sharing_groups.all()]
    content = [{
        'uid': bookmark.uid,
        'name': bookmark.name, 
        'hash': bookmark.url_hash, 
        'sharing_groups': sharing_groups,
    }]
    return content


@rpcmethod()
def get_bookmarks(**kwargs):
    """Return a list of bookmark object for the current user.
    """
    request = kwargs['request']

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
    return content

@rpcmethod(login_required=True)
def remove_bookmark(key, **kwargs):
    request = kwargs['request']
    # uid = appname_modelname_pk
    key = int(key.split('_')[-1])
    bookmark = get_object_or_404(Bookmark, id=key, user=request.user)
    bookmark.delete()

@rpcmethod()
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


