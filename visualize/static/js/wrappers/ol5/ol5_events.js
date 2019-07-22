/*
  * addZoomEnd - add event watcher to trigger on zoom end
  */
app.wrapper.events.addZoomEnd = function(){
  // map.events.register("zoomend", null, function () {
  //     if (map.zoomBox.active) {
  //         app.viewModel.deactivateZoomBox();
  //     }
  //     if( map.getZoom() < 5)
  //     {
  //         map.zoomTo(5);
  //     }
  //     if (map.getZoom() > 13)
  //     {
  //         map.zoomTo(13);
  //     }
  //     app.viewModel.zoomLevel(map.getZoom());
  // };
};


/**
  * addMoveEnd - enable code to be run every time the map is moved
  * @param {function} moveEndFunction - a function to be run when the map is moved
  */
app.wrapper.events.addMoveEnd = function(moveEndFunction) {
  app.map.on('moveend', moveEndFunction);
}

/**
  * addFeatureClickEvent - event that fires when (vector?) features on map are clicked
  */
app.wrapper.events.addFeatureClickEvent = function(){
  // TODO: Update this for OL5
  var selectClick = new ol.interaction.Select();
  app.map.addInteraction(selectClick);
  selectClick.on('select', function(e) {
    window.alert('Write OL5 code for feature click in ol5_events.js: app.wrapper.events.addFeatureClickEvent()');
  });
  // app.map.events.register(layerModel && "featureclick", null, function(e, test) {
  //   var layer = e.feature.layer.layerModel || e.feature.layer.scenarioModel;
  //   if (layer) {
  //     var text = [],
  //     title = layer.featureAttributionName;
  //
  //     if ( layer.scenarioAttributes && layer.scenarioAttributes.length ) {
  //       var attrs = layer.scenarioAttributes;
  //       for (var i=0; i<attrs.length; i++) {
  //         text.push({'display': attrs[i].title, 'data': attrs[i].data});
  //       }
  //     } else if ( layer.attributes.length ) {
  //       var attrs = layer.attributes;
  //
  //       for (var i=0; i<attrs.length; i++) {
  //         if ( e.feature.data[attrs[i].field] ) {
  //           text.push({'display': attrs[i].display, 'data': e.feature.data[attrs[i].field]});
  //         }
  //       }
  //     }
  //
  //     // the following delay prevents the #map click-event-attributes-clearing from taking place after this has occurred
  //     setTimeout( function() {
  //       if (text.length) {
  //         app.wrapper.map.clickOutput.attributes[layer.featureAttributionName] = [{
  //           'name': 'Feature',
  //           'id': layer.featureAttributionName + '-0',
  //           'attributes':text
  //         }];
  //         app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
  //         app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(e.event.xy));
  //       }
  //       // if (app.marker) {
  //       // app.marker.display(true);
  //       // }
  //     }, 100);
  //
  //   }
  //
  // });//end featureclick event registration
}

/**
  * addFeatureOverEvent - event that fires when (vector?) features on map are hovered over
  */
app.wrapper.events.addFeatureOverEvent = function(){
  // TODO: Update this for OL5
  var selectHover = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove
  });
  app.map.addInteraction(selectHover);
  selectHover.on('select', function(e) {
    console.log('Write OL5 code for feature hover in ol5_events.js: app.wrapper.events.addFeatureOverEvent()');
  });
  // OL2 Cruft below
  // //mouseover events
  // app.map.events.register("featureover", null, function(e, test) {
  //     var feature = e.feature,
  //         layerModel = e.feature.layer.layerModel;
  //
  //     if (layerModel && layerModel.attributeEvent === 'mouseover') {
  //             if (app.map.popups.length) {
  //
  //                 if ( feature.layer.getZIndex() >= app.map.currentPopupFeature.layer.getZIndex() ) {
  //                     app.map.currentPopupFeature.popup.hide();
  //                     app.map.createPopup(feature);
  //                     app.map.currentPopupFeature = feature;
  //                 } else {
  //                     app.map.createPopup(feature);
  //                     feature.popup.hide();
  //                 }
  //
  //             } else {
  //                 app.map.createPopup(feature);
  //                 app.map.currentPopupFeature = feature;
  //             }
  //     }
  //
  // });
  //
  // //mouseout events
  // app.map.events.register("featureout", null, function(e, test) {
  //     var feature = e.feature,
  //         layerModel = e.feature.layer.layerModel;
  //
  //     if (layerModel && layerModel.attributeEvent === 'mouseover') {
  //         //app.map.destroyPopup(feature);
  //         app.map.removePopup(feature.popup);
  //         if (app.map.popups.length && !app.map.anyVisiblePopups()) {
  //             var hiddenPopup = app.map.popups[app.map.popups.length-1];
  //             hiddenPopup.show();
  //             app.map.currentPopupFeature = hiddenPopup.feature;
  //         }
  //     }
};

/*
  * addFeatureOutEvent - event that fires when mouse leaves (vector?) features on map
  */
// app.wrapper.events.addFeatureOutEvent = function(){
//   // OL5 covers both mouse over and mouse out events with 'pointerMove' condition in addFeatureOverEvent function above.
// }

/**
  * registerClickLocationEvent - save location of last map click
  */
app.wrapper.events.registerClickLocationEvent = function() {
  app.map.on('click', function(evt){
    app.wrapper.map.clickLocation = ol.proj.toLonLat(evt.coordinate, 'EPSG:3857');
  });
};
