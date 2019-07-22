/**
  * init_map (OL5)- Takes map parameters and returns an OpenLayers 5 map instance
  * @param {string} base - a layer as defined in wrappers/ol5/layers.js
  * @param {string} target - the id of the map div
  * @param {int} srid - the SRID used to generate this map
  * @param {float} center_x - Map initial center longitude coordinate
  * @param {float} center_y - Map initial center latitude coordinate
  * @param {int} zoom - Map initial zoom level
  */
app.init_map = function(base, target, srid, center_x, center_y, zoom){
  if (srid == 4326) {
    var center = ol.proj.fromLonLat([center_x, center_y]);
  } else {
    var center = [center_x, center_y];
  }

  // ---------- OL5 CONTROLS ------------- //
  var scaleLineControl = new ol.control.ScaleLine();
  scaleLineControl.setUnits("us");

  var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'olControlMousePosition',
    undefinedHTML: null
  });

  var map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: {
        'label': 'i',
        'collapseLabel': '«'
      }
    }).extend([
      scaleLineControl,
      mousePositionControl
    ]),
    layers: [
      app.wrapper.map.baseLayersGroup
    ],
    target: target,
    view: new ol.View({
      center: center,
      zoom: zoom
    })
  });
  app.wrapper.layers[base].setVisible(true);

  var layerClickCallback = function(layer, pixelColor) {
    console.log('Clicked on layer: ' + layer.get('name'));
    if (layer.get('utfgrid')) {
      if (app.wrapper.events.hasOwnProperty('clickOnUTFGridLayerEvent')){
        app.wrapper.events.clickOnUTFGridLayerEvent(layer, app.wrapper.map.event)
      }
    } else if (layer.get('tech') == 'ArcRest'){
      if (app.wrapper.events.hasOwnProperty('clickOnArcRESTLayerEvent')) {
        app.wrapper.events.clickOnArcRESTLayerEvent(layer, app.wrapper.map.event)
      }
    } else if (layer.get('tech') == 'Vector'){
      if (app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
        app.wrapper.events.clickOnVectorLayerEvent(layer, app.wrapper.map.event)
      }
    } else if (layer.get('tech') == 'WMS'){
      if (app.wrapper.events.hasOwnProperty('clickOnWMSLayerEvent')) {
        app.wrapper.events.clickOnWMSLayerEvent(layer, app.wrapper.map.event)
      }
    } else { //if (layer.get('tech') == 'XYZ'){
      if (app.wrapper.events.hasOwnProperty('clickOnXYZLayerEvent')) {
        app.wrapper.events.clickOnXYZLayerEvent(layer, app.wrapper.map.event)
      }
    }
    return true;
  }

  map.on('singleclick', function (evt) {
    app.wrapper.map.clearMarkers();
    app.viewModel.closeAttribution();
    app.wrapper.map.event = evt;
    app.wrapper.map.clickOutput = {
        attributes: []
    };
    var overlays = app.wrapper.map.getOverlays();
    for (var i = 0; i < overlays.length; i++) {
      layerClickCallback(overlays[i]);
    }
  });

  return map;
}
