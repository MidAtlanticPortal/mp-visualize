from django.contrib import admin
from .models import *

class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'description')

admin.site.register(Bookmark, BookmarkAdmin)

class ContentAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'name', 'description', 'live')

admin.site.register(Content, ContentAdmin)

class UserLayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'url', 'layer_type', 'description')

admin.site.register(UserLayer, UserLayerAdmin)
