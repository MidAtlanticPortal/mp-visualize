/**
  * init_map (OL5)- Takes map parameters and returns an OpenLayers 5 map instance
  * @param {string} base - a layer as defined in wrappers/ol5/layers.js
  * @param {string} target - the id of the map div
  * @param {int} srid - the SRID used to generate this map
  * @param {int} center_x - Map initial center longitude coordinate
  * @param {int} center_y - Map initial center latitude coordinate
  * @param {int} zoom - Map initial zoom level
  */
app.init_map = function(base, target, srid, center_x, center_y, zoom){
  if (srid == 4326) {
    var center = ol.proj.fromLonLat([center_x, center_y]);
  } else {
    var center = [center_x, center_y];
  }

  var map = new ol.Map({
    layers: [
      app.wrapper.layers[base]
    ],
    target: target,
    view: new ol.View({
      center: center,
      zoom: zoom
    })
  });

  return map;
}
