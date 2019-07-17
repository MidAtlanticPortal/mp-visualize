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
    // undefinedHTML: '&nbsp;'
  });

  var map = new ol.Map({
    controls: ol.control.defaults().extend([
      scaleLineControl,
      mousePositionControl
    ]),
    // layers: layers,
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

  return map;
}