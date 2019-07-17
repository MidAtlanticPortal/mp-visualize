app.wrapper = {
  'layers': {},
  'events': {},
  'map': {},
  'controls': {},
  'state': {},
  'baseLayers': [
    {
      'name': 'ocean',
      'url': 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'projection': '',
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': 'osm',
      'url': '',
      'attribution': '',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'technology': 'OSM',
      'textColor': 'black'
    },
    {
      'name': 'streets',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom, and others',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': 'topo',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': 'satellite',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and others',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'white'
    },
    {
      'name': 'nautical',
      'url': 'https://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer/exportImage',
      'attribution': 'NOAA',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'projection': 'EPSG:3857',
      'technology': 'ArcGIS',
      'params': {'layers': null },
      'textColor': 'black'
    },
  ]
}
