/*
  * app.wrapper.map.addBaseLayers - add initial base layers to the map
  *@param {null} none
  */
// app.wrapper.map.addBaseLayers() {};

/**
  * app.wrapper.map.getCenter - get the center coords of the map in 4326
  */
app.wrapper.map.getCenter = function() {
  var center = ol.proj.toLonLat(app.map.getView().getCenter(), 'EPSG:3857');
  return {
    'lon': center[0],
    'lat': center[1]
  };
};

/**
  * setCenter - set the center of the map from given coords in 4326
  * @param {float} lon - longitude coordinate (in EPSG:4326) for new center of map view
  * @param {float} lat - latitude coordinate (in EPSG:4326) for new center of map view
  */
app.wrapper.map.setCenter = function(lon, lat) {
  app.map.getView().setCenter(ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)], 'EPSG:3857'));
}

/**
  * setZoom - set the zoom level of the map
  * @param {int} zoom - the zoom level to set the map to
  */
app.wrapper.map.setZoom = function(zoom) {
  app.map.getView().setZoom(parseInt(zoom));
}

/**
  * getLayers - return all layers on map as an array
  */
app.wrapper.map.getLayers = function() {
  return app.map.getLayers().getArray();
}

/**
  * getLayersByName - get all layers added to map that have the provided name
  * @param {string} layerName - the name of all layers to be returned
  */
app.wrapper.map.getLayersByName = function(layerName) {
  var layers = app.map.getLayers().getArray()[0].getLayers().getArray();
  var return_layers = []
  for (var i=0; i < layers.length; i++) {
    if (layers[i].get('name') == layerName) {
      return_layers.push(layers[i]);
    }
  }
  return return_layers;
}

/**
  * sortLayers - sort layers by z index
  */
app.wrapper.map.sortLayers = function() {
  // re-ordering map layers by z value
  app.map.layers = app.wrapper.map.getLayers();
  app.map.layers.sort(function(a, b) {
      // ascending sort
      if (a.hasOwnProperty('state_') && a.state_){
        if (b.hasOwnProperty('state_') && b.state_) {
          return a.state_.zIndex - b.state_.zIndex;
        }
      }
      return true;
  });
}

app.wrapper.map.setLayerVisibility = function(layer, visibility){
      // if layer is in openlayers, hide/show it
      if (layer.layer) {
          layer.layer.set('visible', visibility);
      }
}

/**
  * app.wrapper.map.getZoom - get the current zoom level of the map
  */
app.wrapper.map.getZoom = function() {
  return app.map.getView().getZoom();
}

/**
  * app.wrapper.map.getBasemap - get info about the current active base layer
  */
app.wrapper.map.getBasemap = function() {
  var basemapGroup = app.map.getLayers().getArray()[0];
  var basemaps = basemapGroup.getLayers().getArray();
  var basemap = false;
  for (var i = 0; i < basemaps.length; i++) {
    if (basemaps[i].getVisible()) {
      if (basemap) {
        basemaps[i].setVisible(false);
      } else {
        basemap = basemaps[i];
      }
    }
  }
  if (!basemap) {
    basemap = basemaps[0];
    basemap.setVisible(true);
  }
  return {
    'name': basemap.get('name'),
    'id': basemap.ol_uid,
    'textColor': basemap.get('textColor'),
    'layer': basemap
  }
}

/**
  * setBasemap - set basemap to the given layer
  * @param {object} layer - the name of the layer to set as the live basemap
  */
app.wrapper.map.setBasemap = function(layer) {
  var basemapGroup = app.map.getLayers().getArray()[0];
  var basemaps = basemapGroup.getLayers().getArray();
  var current_basemap = app.wrapper.map.getBasemap().layer;
  // determine if layer is layer object or name
  if (typeof(layer) == "string") {
    for (var i = 0; i < basemaps.length; i++) {
      if (basemaps[i].get('name') == layer) {
        layer = basemaps[i];
        break;
      }
    }
  }
  current_basemap.setVisible(false);
  layer.setVisible(true);

  //testing
  var match_found = false;
  var name_match_found = false;
  for (var i=0; i < basemaps.length; i++) {
    if (basemaps[i].get('name') == layer.get('name')) {
      name_match_found = true;
    }
    if (basemaps[i] == layer) {
      match_found = true;
    }
  }
  if (!match_found){
    basemaps.push(layer);
    if (!name_match_found) {
      alert('Provided base map is nothing like any designated basemap options. Adding...');
    } else {
      alert('Provided base map not included in designated basemaps. Adding...');
    }
  }
}

/**
  * createPopup - function to create OL popups on map
  * @param {object} feature - map feature on which to apply the popup
  */
app.wrapper.map.createPopup = function(feature) {
    window.alert('Please create OL5 logic to handle this scenario in ol5_map.js: app.wrapper.map.createPopup.');
    // OL2 Cruft below
    // var mouseoverAttribute = feature.layer.layerModel.mouseoverAttribute,
    //     attributeValue = mouseoverAttribute ? feature.attributes[mouseoverAttribute] : feature.layer.layerModel.name,
    //     location = feature.geometry.getBounds().getCenterLonLat();
    //
    // if ( ! app.map.getExtent().containsLonLat(location) ) {
    //     location = app.map.center;
    // }
    // var popup = new OpenLayers.Popup.FramedCloud(
    //     "",
    //     location,
    //     new OpenLayers.Size(100,100),
    //     "<div>" + attributeValue + "</div>",
    //     null,
    //     false,
    //     null
    // );
    // popup.feature = feature;
    // feature.popup = popup;
    // app.wrapper.map.addPopup(popup);
};

/**
  * addMarkersLayer - function to add a vector layer for displaying markers on map
  */
app.wrapper.map.addMarkersLayer = function() {
  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point([0, 0]),
    name: 'Marker'
  });
  var iconSize = ol.size.toSize([16,25]);
  var iconStyle = new ol.style.Style({
    image: new ol.style.Icon({
      src: '/static/visualize/img/red-pin.png',
      size: iconSize,
      offset: [-8, -25],
      // imgSize: iconSize
    })
  });
  iconFeature.setStyle(iconStyle);
  var markerSource = new ol.source.Vector({
    features: [iconFeature]
  });
  var markerLayer = new ol.layer.Tile({
    source: markerSource
  });
  app.markers = {};
  // app.map.addLayer(markerLayer);

  // OL2 Cruft Below
  // app.markers = new OpenLayers.Layer.Markers( "Markers" );
  // var size = new OpenLayers.Size(16,25);
  // var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
  // app.markers.icon = new OpenLayers.Icon('/static/visualize/img/red-pin.png', size, offset);
  // app.map.addLayer(app.markers);
}

/**
  * removeLayerByName - given a string, find layers with that name and remove them from the map
  * @param {string} layerName - string representing the name of layer(s) to be removed
  */
app.wrapper.map.removeLayerByName = function(layerName) {
  var layers = app.map.getLayers().getArray();
  for (var i=0; i<layers.length; i++) {
      if (layers[i].get('name') === layerName) {
          app.map.removeLayer(layers[i]);
      }
  }
};

/**
  * postProcessLayer - perform additional post-processing steps on any layer added
  * @param {object} layer - mp layer instance
  */
app.wrapper.map.postProcessLayer = function(layer){
  layer.layer.set('name', layer.name);
  layer.layer.set('type', 'overlay');
  layer.layer.set('mpid', layer.id);
  app.map.addLayer(layer.layer);
  layer.layer.opacity = layer.opacity();
  // layer.layer.setVisibility(true);
}

/**
  * addArcRestLayerToMap - add an arcRest layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addArcRestLayerToMap = function(layer) {
  var layerSource = new ol.source.TileArcGISRest({
    attributions: '',
    params: {
      layers: 'show:' + layer.arcgislayers
    },
    projection: 'ESPG:3857',
    url: layer.url,
  })
  layer.layer = new ol.layer.Tile({
    source: layerSource,
    useInterimTilesOnError: false
  });

};

/**
  * addVectorLayerToMap - add vector layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addVectorLayerToMap = function(layer) {
    var iconSize = ol.size.toSize([8,8]);
    var stroke = new ol.style.Stroke({
      color: layer.outline_color,
      opacity: layer.outline_opacity,
    });
    var fill = new ol.style.Fill({
      color: layer.color,
      opacity: layer.fillOpacity,
    });
    var point = new ol.style.Circle({
      radius: layer.point_radius,
      fill: fill,
      stroke: stroke,
    });
    // var image = new ol.style.Icon({
    //   src: layer.graphic,
    //   size: iconSize,
    // });
    var textStroke = new ol.style.Stroke({
      color: "#333",
    });
    var text = new ol.style.Text({
      text: "${NAME}",
      stroke: textStroke,
      font: "12px sans-serif",
    });

    var style_dict = {
      fill: fill,
      // image: image,
      stroke: stroke
    };
    if (layer.annotated){
      style_dict.text = text;
    }
    var styleMap = new ol.style.Style(style_dict);

  layer.layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: layer.url,
          format: new ol.format.GeoJSON()
        }),
        style: styleMap,
        strategy: new ol.loadingstrategy.all(),
      }
  );
}
