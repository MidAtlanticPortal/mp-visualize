from django.contrib import admin
from models import *

admin.site.register(Bookmark)

class ContentAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'name', 'description')

admin.site.register(Content, ContentAdmin)
