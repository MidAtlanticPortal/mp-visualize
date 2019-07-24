/**
  * clickOnArcRESTLayerEvent - check if identification query should be performed, doing it if so
  * @param {object} layer - the layer clicked
  * @param {object} evt - the click event
  */
if (!app.wrapper.events.hasOwnProperty('clickOnArcRESTLayerEvent')) {
  app.wrapper.events.clickOnArcRESTLayerEvent = function(layer, evt){
    if (app.wrapper.map.getLayerParameter(layer, 'url')){
      var identifyUrl = app.wrapper.map.getLayerParameter(layer, 'url')
      .replace('export', app.wrapper.map.getLayerParameter(layer, 'arcgislayers') + '/query');
    } else {
      var identifyUrl = '';
    }

    var qs = []

    // buffer click by two pixels each direction and use that for selection envelope
    var geometry_raw = {
      UL: app.map.getCoordinateFromPixel([evt.pixel[0]-2, evt.pixel[1]-2]),
      LR: app.map.getCoordinateFromPixel([evt.pixel[0]-2, evt.pixel[1]-2])
    }
    var geometry = [geometry_raw.UL, geometry_raw.LR].join(',');
    qs.push('geometry=' + geometry);
    var geometryType = 'esriGeometryEnvelope';
    qs.push('geometryType=' + geometryType);
    var inSR = 3857;
    qs.push('inSR=' + inSR);
    var outSR = 3857;
    qs.push('outSR=' + outSR);
    var spatialRel = 'esriSpatialRelIntersects';
    qs.push('spatialRel=' + spatialRel);
    var format = 'json';
    qs.push('f=' + format);
    var returnGeometry = true;
    qs.push('returnGeometry=' + returnGeometry);
    var mp_layer = app.wrapper.map.getLayerParameter(layer, 'mp_layer');
    if (mp_layer.attributes.length > 0) {
      var outFieldList = [];
      for (var i = 0; i < mp_layer.attributes.length; i++) {
        attr = mp_layer.attributes[i];
        outFieldList.push(attr.field);
      }
      var outFields = outFieldList.join(',');
    } else {
      var outFields = '*';
    }
    qs.push('outFields=' + outFields);

    $.ajax({
      accepts: {
        mycustomtype: 'application/json',
      },
      dataType: 'json',
      url: identifyUrl + '?' + qs.join('&')
    })
    .done(function(responseText) {
      var clickAttributes = {},
      returnJSON = responseText;
      var mp_layer = app.wrapper.map.getLayerParameter(layer, 'mp_layer');

      //data manager opted to disable via DAI
      if (mp_layer.disable_click) {
        return false;
      }

      if(returnJSON['features'] && returnJSON['features'].length) {

        var report_features = []
        $.each(returnJSON['features'], function(index, feature) {
          var attributeObjs = [];
          var attributeList = feature['attributes'];

          if('fields' in returnJSON) {
            $.each(returnJSON['fields'], function(fieldNdx, field) {
              if (field.name.indexOf('OBJECTID') === -1 && field.name.indexOf('CFR_id') === -1) {
                var data = attributeList[field.name]
                if (field.type === 'esriFieldTypeDate') {
                  data = new Date(data).toDateString();
                } else if (app.utils.isNumber(data)) {
                  data = app.utils.formatNumber(data);
                } else if (typeof(data) == 'string' && (data.indexOf('http') >= 0 || field.name.toLowerCase() == 'link' )) {
                  // Make link attributes live!
                  str_list = data.split('; ');
                  if (str_list.length == 1) {
                    str_list = data.split(' ');
                  }
                  for (var i=0; i < str_list.length; i++) {
                    if (str_list[i].indexOf('http') < 0) {
                      var list_addr = 'http://' + str_list[i];
                    } else {
                      var list_addr = str_list[i];
                    }
                    link_string = '<a href="' + list_addr + '" target="_blank">' + str_list[i] + '</a>';
                    str_list[i] = link_string;
                  }
                  data = str_list.join(' ');
                }
                if (data && app.utils.trim(data) !== "") {
                  attributeObjs.push({
                    'display': field.alias,
                    'data': data
                  });
                }
              }
            });
          }
          report_features.push({
            'name': 'Feature ' + (index+1),
            'id': mp_layer.featureAttributionName + '-' + index,
            'attributes': attributeObjs
          })
          return;
        });
        if (report_features && report_features.length) {
          clickAttributes[mp_layer.featureAttributionName] = report_features;
          $.extend(app.wrapper.map.clickOutput.attributes, clickAttributes);
          app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
          //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
          //the following ensures that the location of the marker has not been displaced while waiting for web services
          app.viewModel.updateMarker(app.wrapper.map.clickLocation);
        }
      }
    })
    .fail(function(response){
      console.log(response);
    });
  };
} //ArcREST Click Event

/**
  * clickOnVectorLayerEvent - check if id query should be performed, doing it if so.
  * @param {object} layer - the layer clicked
  * @param {object} evt - the click event
  */
if (!app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
  app.wrapper.events.clickOnVectorLayerEvent = function(layer, evt){
    console.log('Write ' + app.map_tech + ' code for feature click in ' + app.map_tech + '_events.js: app.wrapper.events.addFeatureClickEvent()');
  }
}

/**
  * clickOnUTFGridLayerEvent - check if id query should be performed, doing it if so
  */
if (!app.wrapper.events.hasOwnProperty('clickOnUTFGridLayerEvent')) {
  app.wrapper.events.clickOnUTFGridLayerEvent = function(layer, evt){
    console.log('Write ' + app.map_tech + ' code for UTF click in ' + app.map_tech + '_events.js: app.wrapper.events.clickOnUTFGridLayerEvent()');
  }
}

if (!app.wrapper.events.hasOwnProperty('cleanAttributeReportValue')) {
  /**
    * cleanAttributeReportValue - ...
    */
  // app.wrapper.events.cleanAttributeReportValue = function(mp_layer, entry){
  //   try {
  //       //set the precision and add any necessary commas
  //       value = value.toFixed(obj.precision);
  //       value = app.utils.numberWithCommas(value);
  //   }
  //   catch (e) {
  //       //keep on keeping on
  //   }
  //   attribute_objs.push({'display': obj.display, 'data': value});
  // }

}

if (!app.wrapper.events.hasOwnProperty('generateAttributeReport')) {
  /**
  * generateAttributeReport - given an object of report data and a layer, reformat for attr reporting
  * @param {object} mp_layer - the mp_layer the report is for
  * @param {list} data - the list of the data objects to be reported, one per selected feature
  */
  app.wrapper.events.generateAttributeReport = function(mp_layer, data){
    var attr_fields = mp_layer.attributes;
    var clickAttributes = {};
    var report_attributes = {};
    for (var i = 0; i < attr_fields.length; i++) {
      report_attributes[attr_fields[i].field] = attr_fields[i].display;
    }
    var report_features = [];
    if (data.length > 0){
      var report_keys = Object.keys(report_attributes);
      console.log('TODO: Clean report values (app.wrapper.events.cleanAttributeReportValue)!');
      for (var i = 0; i < data.length; i++) {
        var attributeObjs = [];
        var feature = data[i];
        var attr_keys = Object.keys(feature);
        if (mp_layer.name == "Essential Fish Habitats" && mp_layer.utfurl && mp_layer.utfurl!= ''){
          attributeObjs = app.wrapper.events.parseEFHData(data[i]);
        } else {
          for (var j = 0; j < attr_keys.length; j++) {
            var key = attr_keys[j];
            if (report_keys.length == 0){
              attributeObjs.push({
                'display': key,
                'data': feature[key]
              });
            } else if(report_keys.indexOf(key) >= 0) {
              attributeObjs.push({
                'display': report_attributes[key],
                'data': feature[key]
              });
            }
          }
        }
        report_features.push({
          'name': 'Feature ' + (i+1),
          'id': mp_layer.featureAttributionName + '-' + i,
          'attributes': attributeObjs
        });
      }
      if (report_features && report_features.length) {
        clickAttributes[mp_layer.featureAttributionName] = report_features;
        $.extend(app.wrapper.map.clickOutput.attributes, clickAttributes);
        app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
        //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
        //the following ensures that the location of the marker has not been displaced while waiting for web services
        app.viewModel.updateMarker(app.wrapper.map.clickLocation);
      }
    }
  };
}

if (!app.wrapper.events.hasOwnProperty('parseEFHData')) {
  /**
    * parseEFHData - interpret esoteric EFH UTFGrid data
    * - This is specific to the Mid-Atlantic Portal, and unlikely to be used by other instances of MarinePlanner
    * @param {object} data - the UTFGrid Data response
    */
    app.wrapper.events.parseEFHData = function(data){
      return app.viewModel.getEFHAttributes(data);
    }
}
