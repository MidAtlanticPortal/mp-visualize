app.wrapper.layers.ocean = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: "Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others",
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}",
  })
});

app.wrapper.layers.osm = new ol.layer.Tile({
  source: new ol.source.OSM()
});

app.wrapper.layers.streets = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions:"Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom, and others",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  })
});
app.wrapper.layers.topo = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
              'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
              'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  })
});

app.wrapper.layers.satellite = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: "Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and others",
    url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  })
});

app.wrapper.layers.nautical = new ol.layer.Tile({
  source: new ol.source.TileArcGISRest({
    url: "https://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer/exportImage",
    projection: "EPSG:3857",
    params: {
      layers: 'null'
    },
  })
});
