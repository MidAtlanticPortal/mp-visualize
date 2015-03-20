from django.conf.urls import patterns, url
from views import (show_embedded_map,
                   show_mafmc_map, show_mobile_map, show_planner)

urlpatterns = patterns('',
    url(r'^map', show_embedded_map, name="embedded_map"),
    url(r'^mafmc', show_mafmc_map, name="mafmc_map"),
    url(r'^mobile', show_mobile_map, name="mobile_map"),
    url(r'^$', show_planner, name="planner"),
)
