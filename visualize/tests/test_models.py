from django.test import TestCase
from django.contrib.auth.models import User
from visualize.models import Bookmark, Content, UserLayer

# models test
class BookmarkTest(TestCase):
    fixtures = ['test_data.json',]

    def create_bookmark(
        self, 
        name="User Added Layer Bookmark",
        user=None,
        url_hash="x=-72.93&y=37.02&z=5.76&logo=true&controls=true&" + 
            "dls%5B%5D=true&dls%5B%5D=0.5&dls%5B%5D=164&" + 
            "dls%5B%5D=true&dls%5B%5D=0.96&dls%5B%5D=user_layer_0&" + 
            "basemap=ocean&tab=designs&legends=false&layers=true",
        description="What's this look like in the DB?",
        json='{"x":"-72.93","y":"37.02","z":5.76,"basemap":"ocean","layers":[' + 
            '{"visible":true,"opacity":0.5,"type":"ArcRest",' + 
            '"url":"https://coast.noaa.gov/arcgis/rest/services/OceanReports/CetaceanBiologicallyImportantAreas_Feeding/MapServer/export",' + 
            '"name":"Biologically Important Areas for Cetaceans - Feeding","id":164,"order":0,"dynamic":false,"isUserLayer":false,"isMDAT":false,"isVTR":false,"arcgislayers":"0"},{"visible":true,"opacity":0.96,"type":"ArcRest","url":"https://mgelmaps.env.duke.edu/mdat/rest/services/MDAT/Avian_Abundance_CI90/MapServer/export","name":"User Added Layer","id":"user_layer_0","order":1,"dynamic":true,"isUserLayer":true,"isMDAT":false,"isVTR":false,"arcgislayers":"12.23"}],"themes":{"ids":[]},"panel":"true","legends":"false","logo":true}'
    ) :
        user = User.objects.get(email='rhodges@ecotrust.org')
        return Bookmark.objects.create(name=name, user=user, url_hash=url_hash, description=description, json=json)

    def test_bookmark_creation(self):
        bookmark = self.create_bookmark()
        self.assertTrue(isinstance(bookmark, Bookmark))
        self.assertEqual(bookmark.__unicode__(), 'visualize_bookmark_{}'.format(bookmark.pk))


    def create_user_layer(
        self,
        user=None,
        layer_type="ArcRest",
        url="https://mgelmaps.env.duke.edu/mdat/rest/services/MDAT/Avian_Abundance_CI90/MapServer/export",
        name="User Added Layer",
        arcgis_layers="12,23"
    ):
        if not user:
            user = User.objects.get(email='rhodges@ecotrust.org')
        return UserLayer.objects.create(name=name, user=user, layer_type=layer_type, url=url, arcgis_layers=arcgis_layers)

    def test_user_layer_creation(self):
        layer_name = "Test User Layer Name"
        user_layer = self.create_user_layer(name=layer_name)
        self.assertTrue(isinstance(user_layer, UserLayer))
        self.assertEqual(user_layer.__unicode__(), layer_name)