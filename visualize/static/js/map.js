app.init = function () {

    var map = app.init_map(app.region.map, 'map', app.region.srid, app.region.init_lon, app.region.init_lat, app.region.init_zoom);

    app.map = map;

    // TODO:
    if (P97.Controls.hasOwnProperty('LayerLoadProgress')) {
      map.addControl(new P97.Controls.LayerLoadProgress({
        map: app.map,
        element: null,
        onStartLoading: function() {
          this.element.show();
        },
        onLoading: function(num, max, percentStr) {
          this.element.text(percentStr);
        },
        onFinishLoading: function() {
          this.element.hide();
        }
      }));
    }

    // See if addBaseLayers is available in {lib}_map.js
    if (app.wrapper.map.hasOwnProperty('addBaseLayers')) {
      app.wrapper.map.addBaseLayers();
    }

    // See if switcher is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addSwitcher')) {
      app.wrapper.controls.addSwitcher();
    }

    // See if scale is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addScale')) {
      app.wrapper.controls.addScale();
    }

    // See if zoombox is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addZoomBox')) {
      //enables zooming to a given extent on the map by holding down shift key while dragging the mouse
      app.wrapper.controls.addZoomBox();
    }

    // See if mousePosition is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addMousePosition')) {
      app.wrapper.controls.addMousePosition();
    }

    // See if zoomEnd is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addZoomEnd')) {
      app.wrapper.events.addZoomEnd();
    }

    // See if addMoveEnd is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addMoveEnd')) {
      var moveEndFunction = function (evt) {
        app.updateUrl();
      };
      app.wrapper.events.addMoveEnd(moveEndFunction);
    }

    if (!app.wrapper.map.hasOwnProperty('attributes')) {
      app.wrapper.map.attributes = [];
    }

    if (!app.wrapper.map.hasOwnProperty('clickOutput')) {
      app.wrapper.map.clickOutput = { time: 0, attributes: {} };
    }

    // See if addUTFGrid is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addUTFGrid')) {
      app.wrapper.controls.addUTFGrid();
    }

    // See if addFeatureClickEvent is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addFeatureClickEvent')) {
      app.wrapper.events.addFeatureClickEvent();
    }

    // See if addFeatureOverEvent is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addFeatureOverEvent')) {
      app.wrapper.events.addFeatureOverEvent();
    }

    // See if addFeatureOutEvent is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addFeatureOutEvent')) {
      app.wrapper.events.addFeatureOutEvent();
    }

    // See if app.wrapper.map.createPopup is available in {lib}_map.js

    app.map.anyVisiblePopups = function() {
        if (app.wrapper.map.hasOwnProperty('popups')) {
          for (var i=0; i<app.wrapper.map.popups.length; i+=1) {
            if (app.map.popups[0].visible()) {
              return true;
            }
          }
          return false;
        } else {
          window.alert("Error: Please inform site owner that map popups are not enabled for current map library");
          return false;
        }
    };

    // See if app.wrapper.map.addMarkersLayer is abailabel in {lib}_map.js
    if (app.wrapper.map.hasOwnProperty('addMarkersLayer')) {
      app.wrapper.map.addMarkersLayer();
    }

    // See if app.wrapper.events.getClickLocation is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('registerClickLocationEvent')) {
      app.wrapper.events.registerClickLocationEvent();
    }

    // See if app.wrapper.map.removeLayerByName is set in {lib}_map.js


    app.utils = {};
    app.utils.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    app.utils.numberWithCommas = function(x) {
        if (x.toString().length > 4){
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
          return x.toString();
        }
    }
    app.utils.isInteger = function(n) {
        return app.utils.isNumber(n) && (Math.floor(n) === n);
    }
    app.utils.formatNumber = function(n) {
        var number = Number(n);
        if (app.utils.isInteger(number)) {
            var preciseNumber = number.toFixed(0);
        } else {
            var preciseNumber = number.toFixed(1);
        }
        return app.utils.numberWithCommas(preciseNumber);
    }
    app.utils.trim = function(str) {
        return str.replace(/^\s+|\s+$/g,'');
    }
    app.utils.getObjectFromList = function(list, field, value) {
        for (var i=0; i<list.length; i+=1) {
            if (list[i][field] === value) {
                return list[i];
            }
        }
        return undefined;
    }

    // setTimeout( function() {
    //     if (app.mafmc) {
    //         map.removeLayer(openStreetMap);
    //         map.removeLayer(googleStreet);
    //         map.removeLayer(googleTerrain);
    //         map.removeLayer(googleSatellite);
    //     }
    // }, 1000);


    app.menus = {}
    app.menus.bookmark = [
        new ContextualMenu.Item("Share Bookmark", app.viewModel.bookmarks.showSharingModal, 'fa fa-link'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Delete Bookmark", app.viewModel.bookmarks.removeBookmark, 'fa fa-times-circle red')
    ];

    app.menus.sharedDrawing = [
        new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToDrawing, 'fa fa-search-plus'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Create Copy", app.viewModel.scenarios.createCopyOfDrawing, 'fa fa-copy')
    ];

    app.menus.drawing = [
        new ContextualMenu.Item("Edit", app.viewModel.scenarios.editDrawing, 'fa fa-edit'),
        new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToDrawing, 'fa fa-search-plus'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Share…", app.viewModel.scenarios.shareDrawing, 'fa fa-share-alt'),
        new ContextualMenu.Item("Export…", app.viewModel.exportGeometry.showDialog.bind(app.viewModel.exportGeometry), 'far fa-file'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Delete Drawing", app.viewModel.scenarios.deleteDrawing, 'fa fa-times-circle red')
    ];

    app.menus.sharedLeaseBlockCollection = [
        new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToLeaseBlockCollection, 'fa fa-search-plus'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Create Copy", app.viewModel.scenarios.createCopyOfLeaseBlockCollection, 'fa fa-copy')
    ];

    app.menus.leaseBlockCollection = [
        new ContextualMenu.Item("Edit", app.viewModel.scenarios.editLeaseBlockCollection, 'fa fa-edit'),
        new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToLeaseBlockCollection, 'fa fa-search-plus'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Share", app.viewModel.scenarios.shareLeaseBlockCollection, 'fa fa-share-alt'),
        new ContextualMenu.Item("Export…", app.viewModel.exportGeometry.showDialog.bind(app.viewModel.exportGeometry), 'far fa-file'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Delete Lease Block Collection", app.viewModel.scenarios.deleteLeaseBlockCollection, 'fa fa-times-circle red')
    ];

    app.menus.sharedWindEnergySiting = [
        new ContextualMenu.Item("Zoom To", function(){console.info("sharedWindEnergySiting: Zoom To")}, 'fa fa-search-plus'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Create Copy", app.viewModel.scenarios.createCopyOfWindEnergySiting, 'fa fa-copy')
    ];

    app.menus.windEnergySiting = [
        new ContextualMenu.Item("Edit", app.viewModel.scenarios.editWindEnergySiting, 'fa fa-edit'),
        new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToWindEnergySiting, 'fa fa-search-plus'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Share", app.viewModel.scenarios.shareWindEnergySiting, 'fa fa-share-alt'),
        new ContextualMenu.Item("Export…", app.viewModel.exportGeometry.showDialog.bind(app.viewModel.exportGeometry), 'far fa-file'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Delete Wind Energy Siting", app.viewModel.scenarios.deleteWindEnergySiting, 'fa fa-times-circle red')
    ];

    $(function() {
        // manually bind up the context menu here, otherwise ko will complain
        // that we're binding the same element twice (MP's viewmodel applies
        // to the entire page
        //ContextualMenu.Init(app.menus, document.querySelector('#context-menu'))
        app.menuModel = new ContextualMenu.Model(app.menus, document.querySelector('#context-menu'));
        // fix for top nav's negative margin
        app.menuModel.setCorrectionOffset(0, 0);
        ko.applyBindings(app.menuModel, document.querySelector('#context-menu'));
    });
};

app.addLayerToMap = function(layer) {
    if (!layer.layer) {
        if (layer.utfurl || (layer.parent && layer.parent.utfurl)) {
            app.addUtfLayerToMap(layer);
        } else if (layer.type === 'Vector') {
            app.addVectorLayerToMap(layer);
        } else if (layer.type === 'ArcRest') {
            app.addArcRestLayerToMap(layer);
        } else if (layer.type === 'WMS') {
            app.addWmsLayerToMap(layer);
        } else { //if XYZ with no utfgrid
            app.addXyzLayerToMap(layer);
        }
    }
    app.map.addLayer(layer.layer);
    layer.layer.opacity = layer.opacity();
    layer.layer.setVisibility(true);
};

// add XYZ layer with no utfgrid
app.addXyzLayerToMap = function(layer) {
    var opts = { displayInLayerSwitcher: false };

    // adding layer to the map for the first time
    layer.layer = new OpenLayers.Layer.XYZ(layer.name,
        layer.url,
        $.extend({}, opts,
            {
                sphericalMercator: true,
                isBaseLayer: false //previously set automatically when allOverlays was set to true, must now be set manually
            }
        )
    );
};

app.addWmsLayerToMap = function(layer) {
    wms_url = layer.url;
    wms_proxy = false;
    layer_params = {
      layers: layer.wms_slug,
      transparent: "true"
    }
    if (layer.wms_format){
      layer_params.format = layer.format;
    } else {
      layer_params.format = "image/png";
    }
    if (layer.wms_srs){
      // OL2 - We need to proxy to another WMS that DOES support the current projection
      if (layer.wms_srs != 'EPSG:3857') {
        wms_proxy = true;
        // var time_def_param_key = app.server_constants.time_def_param_key;
        wms_url = app.server_constants.wms_proxy_url;
        layer_params[app.server_constants.wms_proxy_mapfile_field] = app.server_constants.wms_proxy_mapfile
        layer_params[app.server_constants.source_srs_param_key] = layer.srs;
        layer_params[app.server_constants.conn_param_key] =  layer.url;
        layer_params[app.server_constants.layer_name_param_key] = layer.wms_slug;
        if (layer.wms_timing) {
          layer_params.layers = app.server_constants.proxy_time_layer;
          layer_params[app.server_constants.time_param_key] = layer.wms_timing;
          if (layer.wms_time_item) {
            layer_params[app.server_constants.time_item_param_key] = layer.wms_time_item;
          }
        } else {
          layer_params.layers = app.server_constants.proxy_generic_layer;
        }
        layer_params[app.server_constants.format_param_key] = layer.wms_format;
        layer_params[app.server_constants.version_param_key] = layer.wms_version;
        layer_params[app.server_constants.style_param_key] = layer.wms_styles;
      }
    }
    if (!wms_proxy) {
      if (layer.wms_styles){
        layer_params.styles = layer.wms_styles;
      }
      if (layer.wms_timing){
        layer_params.time = layer.wms_timing;
      }
      if (layer.wms_additional){
        if (layer.wms_additional[0] == '?') {
          layer.wms_additional = layer.wms_additional.slice(1);
        }
        var additional_list = layer.wms_additional.split("&");
        for (var i = 0; i < additional_list.length; i++) {
          key_val = additional_list[i].split('=');
          if (key_val.length == 2) {
            key = key_val[0];
            value = key_val[1];
            layer_params[key] = value;
          }
        }
      }

    }

    layer.layer = new OpenLayers.Layer.WMS(
        layer.name,
        wms_url,
        layer_params
    );
};

app.addArcRestLayerToMap = function(layer) {
    if (layer.url){
      var identifyUrl = layer.url.replace('export', layer.arcgislayers + '/query');
    } else {
      var identifyUrl = '';
    }

    layer.arcIdentifyControl = new OpenLayers.Control.ArcGisRestIdentify(
    {
        eventListeners: {
            arcfeaturequery: function() {
                //if ( ! layer.attributesFromWebServices || layer.utfurl ) {
                if ( layer.utfurl ) { // || layer.name === 'Offshore Wind Compatibility Assessments' ) {
                    return false;
                }
            },
            //the handler for the return click data
            resultarrived : function(responseText) {
                var clickAttributes = {},
                    jsonFormat = new OpenLayers.Format.JSON(),
                    returnJSON = jsonFormat.read(responseText.text);

                //data manager opted to disable via DAI
                if (layer.disable_click) {
                    return false;
                }

                if(returnJSON['features'] && returnJSON['features'].length) {

                    var report_features = []
                    $.each(returnJSON['features'], function(index, feature) {
                        var attributeObjs = [];
                        var attributeList = feature['attributes'];

                        if('fields' in returnJSON) {
                            if (layer.attributes.length) {
                                for (var i=0; i<layer.attributes.length; i+=1) {
                                    if (attributeList[layer.attributes[i].field]) {
                                        var data = attributeList[layer.attributes[i].field],
                                            field_obj = app.utils.getObjectFromList(returnJSON['fields'], 'name', layer.attributes[i].field);
                                        if (field_obj && field_obj.type === 'esriFieldTypeDate') {
                                            data = new Date(data).toDateString();
                                        } else if (app.utils.isNumber(data)) {
                                            data = app.utils.formatNumber(data);
                                        }
                                        if (data && app.utils.trim(data) !== "") {
                                            attributeObjs.push({
                                                'display': layer.attributes[i].display,
                                                'data': data
                                            });
                                        }
                                    }
                                }
                            } else {
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
                        }
                        report_features.push({
                          'name': 'Feature ' + (index+1),
                          'id': layer.featureAttributionName + '-' + index,
                          'attributes': attributeObjs
                        })
                        return;
                    });
                    if ( layer.name === 'Aids to Navigation' ) {
                        app.viewModel.adjustAidsToNavigationAttributes(report_features[0].attributes);
                    }
                }

                if (report_features && report_features.length) {
                    clickAttributes[layer.featureAttributionName] = report_features;
                    $.extend(app.map.clickOutput.attributes, clickAttributes);
                    app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                    //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
                    //the following ensures that the location of the marker has not been displaced while waiting for web services
                    app.viewModel.updateMarker(app.map.clickLocation);
                }
            }
        },
        url : identifyUrl,
        layerid : layer.arcgislayers,
        sr : 3857,
        clickTolerance: 2,
        outFields: '*'
    });
    app.map.addControl(layer.arcIdentifyControl);

    layer.layer = new OpenLayers.Layer.ArcGIS93Rest(
        layer.name,
        layer.url,
        {
            layers: "show:"+layer.arcgislayers,
            srs: 'EPSG:3857',
            transparent: true
        },
        {
            isBaseLayer: false
        }
    );
};

app.addVectorLayerToMap = function(layer) {
    if (layer.annotated) { // such as the canyon labels in the mafmc project
        var styleMap = new OpenLayers.StyleMap( {
            label: "${NAME}",
            fontColor: "#333",
            fontSize: "12px",
            fillColor: layer.color,
            fillOpacity: layer.fillOpacity,
            //strokeDashStyle: "dash",
            //strokeOpacity: 1,
            strokeColor: layer.color,
            strokeOpacity: layer.defaultOpacity,
            //strokeLinecap: "square",
            //http://dev.openlayers.org/apidocs/files/OpenLayers/Feature/Vector-js.html
            //title: 'testing'
            pointRadius: layer.point_radius,
            externalGraphic: layer.graphic,
            graphicWidth: 8,
            graphicHeight: 8,
            graphicOpacity: layer.defaultOpacity
        });
    } else {
        var styleMap = new OpenLayers.StyleMap( {
            fillColor: layer.color,
            fillOpacity: layer.fillOpacity,
            //strokeDashStyle: "dash",
            //strokeOpacity: 1,
            strokeColor: layer.outline_color,
            strokeOpacity: layer.outline_opacity,
            //strokeLinecap: "square",
            //http://dev.openlayers.org/apidocs/files/OpenLayers/Feature/Vector-js.html
            //title: 'testing'
            pointRadius: layer.point_radius,
            externalGraphic: layer.graphic,
            graphicWidth: 8,
            graphicHeight: 8,
            graphicOpacity: layer.defaultOpacity
        });
    }
    if (layer.name === 'Coral Protection Mockups') {
        /*styleMap.styles['default']['defaultStyle']['label'] = '${NAME}';
        styleMap.styles['default']['defaultStyle']['fontColor'] = "red";
        styleMap.styles['default']['defaultStyle']['fontSize'] = "14px";
        styleMap.styles['default']['defaultStyle']['labelAlign'] = "cm";
        styleMap.styles['default']['defaultStyle']['labelOutlineColor'] = "white";
        styleMap.styles['default']['defaultStyle']['labelOutlineWidth'] = 3;*/
    }
    if (layer.lookupField) {
        var mylookup = {};
        $.each(layer.lookupDetails, function(index, details) {
            var fillOp = 0.5;
            //the following are special cases for Shipping Lanes that ensure suitable attribution with proper display
            if (details.value === 'Precautionary Area') {
                fillOp = 0.0;
            } else if (details.value === 'Shipping Safety Fairway') {
                fillOp = 0.0;
            } else if (details.value === 'Traffic Lane') {
                fillOp = 0.0;
            }
            mylookup[details.value] = {
                strokeColor: details.color,
                strokeDashstyle: details.dashstyle,
                fill: details.fill,
                fillColor: details.color,
                fillOpacity: fillOp,
                externalGraphic: details.graphic
            };
            /*special case for Discharge Flow
            if (layer.lookupField === "Flow") {
                mylookup[details.value] = {
                    strokeColor: layer.color,
                    pointRadius: details.value * 5
                };
                console.log(mylookup);
            }*/
        });
        styleMap.addUniqueValueRules("default", layer.lookupField, mylookup);
        //styleMap.addUniqueValueRules("select", layer.lookupField, mylookup);
    }
    layer.layer = new OpenLayers.Layer.Vector(
        layer.name,
        {
            projection: new OpenLayers.Projection('EPSG:3857'),
            displayInLayerSwitcher: false,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                url: layer.url,
                format: new OpenLayers.Format.GeoJSON()
            }),
            styleMap: styleMap,
            layerModel: layer,
            // set minZoom to 9 for annotated layers, set minZoom to some much smaller zoom level for non-annotated layers
            scales: layer.annotated ? [1000000, 1] : [90000000, 1],
            units: 'm'
        }
    );

};

app.addUtfLayerToMap = function(layer) {
    var opts = { displayInLayerSwitcher: false };
    layer.utfgrid = new OpenLayers.Layer.UTFGrid({
        layerModel: layer,
        url: layer.utfurl ? layer.utfurl : layer.parent.utfurl,
        sphericalMercator: true,
        //events: {fallThrough: true},
        utfgridResolution: 4, // default is 2
        displayInLayerSwitcher: false,
        useJSONP: false
    });

    app.map.addLayer(layer.utfgrid);

    if (layer.type === 'ArcRest') {
        app.addArcRestLayerToMap(layer);
    } else if (layer.type === 'XYZ') {
        //maybe just call app.addXyzLayerToMap(layer)
        app.addXyzLayerToMap(layer);
        /*
        layer.layer = new OpenLayers.Layer.XYZ(
            layer.name,
            layer.url,
            $.extend({}, opts,
                {
                    sphericalMercator: true,
                    isBaseLayer: false //previously set automatically when allOverlays was set to true, must now be set manually
                }
            )
        );
        */
    } else {
        //debugger;
    }
};

app.setLayerVisibility = function(layer, visibility) {
    // if layer is in openlayers, hide/show it
    if (layer.layer) {
        layer.layer.setVisibility(visibility);
    }
};

app.setLayerZIndex = function(layer, index) {
    layer.layer.setZIndex(index);
};


app.reCenterMap = function () {
    app.setMapPosition(app.state.x, app.state.y, 7);
};
