/**
  * app.wrapper.map_library.transform - given coordinates and two projection identifiers, transform from one to the other.
  * @param lon - the longitude value of the coordinate;
  * @param lat - the latitude value of the coordinate;
  * @param from - the common identifier (i.e. 'EPSG:3857') of the current coordinate projection
  * @param to - the common identifier (i.e. 'EPSG:4326') of the output coordinate projection
  */
app.wrapper.map_library.transform = function(lon, lat, from, to) {
  return ol.proj.transform([lon, lat], from, to);
}

/**
  * app.wrapper.map_library.getProjection - get the current projection of the map
  */
app.wrapper.map_library.getProjection = function() {
  return app.map.getView().getProjection();
}

/**
  * app.wrapper.map_library.getArea - get the area of a (multi)polygon geometry
  */
app.wrapper.map_library.getArea = function(geom) {
  return ol.sphere.getArea(geom);
}

/**
  * app.wrapper.map_library.m2ToMi2 - convert square meters into a human readable 'x sq mi' string
  */
app.wrapper.map_library.m2ToMi2 = function(sqm_area) {
  // According to https://www.asknumbers.com/square-meter-to-square-mile.aspx
  area_mi2 = sqm_area*0.00000038610215855;

  if (Math.abs(area_mi2<100)) {
    return area_mi2.toFixed(2) + " sq mi";
  } else if (Math.abs(area_mi2<1000)) {
    return area_mi2.toFixed(1) + " sq mi";
  } else {
    return area_mi2.toFixed(0) + " sq mi";
  }
}
