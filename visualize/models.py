from django.contrib.gis.db import models
from features.registry import register
from features.models import Feature
from tinymce.models import HTMLField
from django.contrib.postgres.fields import JSONField

@register
class Bookmark(Feature):
    url_hash = models.CharField(max_length=2050)
    description = models.TextField(null=True, blank=True, default=None)
    json = models.TextField(null=True, blank=True, default=None)

    class Options:
        verbose_name = 'MARCO Bookmark'
        form = 'visualize.forms.BookmarkForm'

class Content(models.Model):
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=255)
    description = models.TextField()
    content = HTMLField()
    live = models.BooleanField(default=False)
