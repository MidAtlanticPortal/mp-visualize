from django.contrib.gis.db import models
from features.registry import register
from features.models import Feature
from tinymce.models import HTMLField

@register
class Bookmark(Feature):
    url_hash = models.CharField(max_length=2050)

    class Options:
        verbose_name = 'MARCO Bookmark'
        form = 'visualize.forms.BookmarkForm'

class Content(models.Model):
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=255)
    description = models.TextField()
    content = HTMLField()
    live = models.BooleanField(default=False)
