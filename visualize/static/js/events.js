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
    // geometry=-8180384.8004717%2C4757443.0945032%2C-8177938.8155669%2C4754997.1095984&
    var geometry = [geometry_raw.UL, geometry_raw.LR].join(',');
    qs.push('geometry=' + geometry);
    // geometryType=esriGeometryEnvelope&
    var geometryType = 'esriGeometryEnvelope';
    qs.push('geometryType=' + geometryType);
    // inSR=3857&
    var inSR = 3857;
    qs.push('inSR=' + inSR);
    // outSR=3857&
    var outSR = 3857;
    qs.push('outSR=' + outSR);
    // spatialRel=esriSpatialRelIntersects&
    var spatialRel = 'esriSpatialRelIntersects';
    qs.push('spatialRel=' + spatialRel);
    // f=json&
    var format = 'json';
    qs.push('f=' + format);
    // returnGeometry=true&
    var returnGeometry = true;
    qs.push('returnGeometry=' + returnGeometry);
    // outFields=*
    // var outFields = app.wrapper.map.getLayerParameter(layer, 'mp_layer').esriOutFields;
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
            // if (mp_layer.attributes.length) {
            //   for (var i=0; i<mp_layer.attributes.length; i+=1) {
            //     if (attributeList[mp_layer.attributes[i].field]) {
            //       var data = attributeList[mp_layer.attributes[i].field],
            //       field_obj = app.utils.getObjectFromList(returnJSON['fields'], 'name', mp_layer.attributes[i].field);
            //       if (field_obj && field_obj.type === 'esriFieldTypeDate') {
            //         data = new Date(data).toDateString();
            //       } else if (app.utils.isNumber(data)) {
            //         data = app.utils.formatNumber(data);
            //       }
            //       if (data && app.utils.trim(data) !== "") {
            //         attributeObjs.push({
            //           'display': mp_layer.attributes[i].display,
            //           'data': data
            //         });
            //       }
            //     }
            //   }
            // } else {
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
            // }
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
          app.viewModel.updateMarker(app.map.clickLocation);
        }
      }
    })
    .fail(function(response){
      console.log(response);
    });
  };
} //ArcREST Click Event
