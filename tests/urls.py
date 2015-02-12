from django.conf.urls import url, include
import accounts.urls

urlpatterns = [
    url(r'^visualize/', include('visualize.urls')),
]
