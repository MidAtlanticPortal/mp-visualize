from django.conf.urls import patterns, url
from views import (get_bookmarks, remove_bookmark, add_bookmark, 
                   get_sharing_groups, share_bookmark, show_embedded_map,
                   show_mafmc_map, show_mobile_map, show_planner)

urlpatterns = patterns('',
    url(r'^get_bookmarks$', get_bookmarks),
    url(r'^remove_bookmark$', remove_bookmark),
    url(r'^add_bookmark$', add_bookmark),
    url(r'^get_sharing_groups$', get_sharing_groups),
    url(r'share_bookmark$', share_bookmark),
    (r'^map', show_embedded_map),
    (r'^mafmc', show_mafmc_map),
    (r'^mobile', show_mobile_map),
    (r'^$', show_planner),
)
