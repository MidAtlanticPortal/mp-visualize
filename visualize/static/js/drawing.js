
function drawingModel(options) {
    var self = this;

    var ret = scenarioModel.apply(this, arguments);

    //self.isSelectionModel = true;

    //self.pointControl = new OpenLayers.Control.DrawFeature(pointLayer, OpenLayers.Handler.Point);
    //self.lineControl = new OpenLayers.Control.DrawFeature(lineLayer, OpenLayers.Handler.Path);

    //will need to distinguish between drawing types...
    self.edit = function() {
        self.drawing = this;
        if ( ! self.drawing.active() ) {
            self.drawing.activateLayer();
        }
        //app.viewModel.scenarios.drawingFormModel.polygonLayer.addFeatures([new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT($('#id_geometry_orig')[0].value))]);
        //app.viewModel.scenarios.drawingFormModel.polygonLayer.addFeatures([new OpenLayers.Format.WKT().read($('#id_geometry_orig')[0].value)]);

        //app.setLayerVisibility(drawing, false);
        return $.ajax({
            url: '/features/aoi/' + self.drawing.uid + '/form/',
            success: function(data) {
                app.viewModel.scenarios.drawingForm(true);
                app.viewModel.scenarios.drawingFormModel = new polygonFormModel();
                //app.viewModel.scenarios.drawingFormModel.replacePolygonLayer(self.drawing.layer);
                var oldLayer = app.viewModel.scenarios.drawingFormModel.polygonLayer;
                app.viewModel.scenarios.drawingFormModel.originalDrawing = self.drawing;
                app.viewModel.scenarios.drawingFormModel.polygonLayer = self.drawing.layer;
                //debugger;

                app.map.zoomToExtent(self.drawing.layer.getDataExtent());
                app.map.zoomOut();

                $('#drawing-form').html(data);
                ko.applyBindings(app.viewModel.scenarios.drawingFormModel, document.getElementById('drawing-form'));

                app.viewModel.scenarios.drawingFormModel.showEdit(true);
                app.viewModel.scenarios.drawingFormModel.hasShape(true);
                app.viewModel.scenarios.drawingFormModel.startEdit();
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.createCopy = function() {
        var drawing = this;

        //create a copy of this shape to be owned by the user
        $.ajax({
            url: '/scenario/copy_design/' + drawing.uid + '/',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                //app.viewModel.scenarios.loadSelectionsFromServer();
                app.viewModel.scenarios.addScenarioToMap(null, {uid: data[0].uid});
            },
            error: function (result) {
                //debugger;
            }
        });
    };
    self.deleteScenario = function() {
        var drawing = this;

        //remove from activeLayers
        app.viewModel.activeLayers.remove(drawing);
        //remove from app.map
        if (drawing.layer) {
            app.map.removeLayer(drawing.layer);
        }
        //remove from selectionList
        app.viewModel.scenarios.drawingList.remove(drawing);

        //remove from server-side db (this should provide error message to the user on fail)
        $.jsonrpc('delete_drawing', [drawing.uid], {
            //complete: drawingModel.loadDrawingList
        });
    };

    self.shapefileDownloadLink = function() {
        var url = "/scenario/export/shp/" + self.id + ".zip";
        return url;
    }
    self.geojsonDownloadLink = function() {
        var url = "/scenario/export/geojson/" + self.id + ".geojson";
        return url;
    }
    self.wktDownloadLink = function() {
        var url = "/scenario/export/wkt/" + self.id + "-wkt.txt";
        return url;
    }
    self.kmlDownloadLink = function() {
        var url = "/scenario/export/kml/" + self.id + ".kml";
        return url;
    }
}



function polygonFormModel(options) {
    var self = this;

    self.newPolygonLayerName = "New Polygon Design 23";

    self.isDrawing = ko.observable(false);
    self.showEdit = ko.observable(false);
    self.isEditing = ko.observable(false);
    self.hasShape = ko.observable(false);

    self.polygonLayer = new OpenLayers.Layer.Vector(self.newPolygonLayerName);
    app.map.addLayer(self.polygonLayer);

    self.polygonControl = new OpenLayers.Control.DrawFeature(self.polygonLayer, OpenLayers.Handler.Polygon, {multi:false});
    app.map.addControl(self.polygonControl);

    self.editControl = new OpenLayers.Control.ModifyFeature(self.polygonLayer);
    app.map.addControl(self.editControl);

    //self.selectFeature = new OpenLayers.Control.SelectFeature(self.polygonLayer);
    //app.map.addControl(self.selectFeature);

    self.polygonControl.events.register(
        'featureadded',
        self.polygonLayer,
        function(e) {
            new_feature = e.feature;
            is_polygon = self.validate_polygon(new_feature);
            if (is_polygon) {
                self.assign_correct_layer(new_feature);
                self.completeSketch();
                self.showEdit(true);
            } else {
              window.alert('Shapes must have at least 3 corners.');
              e.feature.layer.removeFeatures(e.feature);
            }
        }
    );

    self.validate_polygon = function(feature) {
      if (feature.geometry.getArea() > 0 && feature.geometry.getVertices().length > 2){
        return true;
      } else {
        return false;
      }
    };

    self.assign_correct_layer = function(new_feature) {
      if (new_feature.layer != self.polygonLayer) {
        feat = new_feature.geometry;
        var poly_found = false;
        while (!poly_found || !feat.hasOwnProperty('components')) {
          if (feat instanceof OpenLayers.Geometry.Polygon) {
            if (self.polygonLayer.features[0].geometry instanceof OpenLayers.Feature.Vector) {
              self.polygonLayer.features[0].geometry.components.push(feat);
            } else {
              self.polygonLayer.features[0].geometry.addComponent(feat);
            }
            poly_found = true;
          } else {
            feat = feat.components[0].geometry;
          }
        }
        if (poly_found) {
          new_feature.layer.destroy();
          self.polygonLayer.redraw();
        }
      }
    };

    self.startEdit = function() {
        self.isEditing(true);
        //activate the modify feature control
        self.editControl.activate();
        //disable feature attribution
        app.viewModel.disableFeatureAttribution();
        //select polygon
        self.editControl.selectFeature(self.polygonLayer.features[0]);
    };

    self.completeEdit = function() {
        self.isEditing(false);
        //deactivate the modify feature control
        self.editControl.deactivate();
        //re-enable feature attribution
        app.viewModel.enableFeatureAttribution();
        //advance form (in case this was called clicking Done Editing button
        $('#button_next').click();
    };

    self.completeSketch = function() {
        self.hasShape(true);
        self.isDrawing(false);
        //deactivate the draw feature control
        self.polygonControl.deactivate();


        //Handle multipolygons
        if (self.polygonLayer.features.length > 1) {
          feature_list = self.polygonLayer.features;
          polygon_list = [];
          for (var i=0; i < feature_list.length; i++) {
            if (feature_list[i].geometry instanceof OpenLayers.Geometry.Polygon) {
              polygon_list.push(feature_list[i].geometry)
            } else if (feature_list[i].geometry instanceof OpenLayers.Geometry.MultiPolygon) {
              for (var j=0; j < feature_list[i].geometry.components.length; j++) {
                if (feature_list[i].geometry.components[j] instanceof OpenLayers.Geometry.Polygon) {
                  polygon_list.push(feature_list[i].geometry.components[j])
                }
              }
            } else {
              window.alert('New geometry is not a polygon and will not be added to the drawing.');
            }
          }
          multipolygon = new OpenLayers.Geometry.MultiPolygon;
          for (var poly_idx = 0; poly_idx < polygon_list.length; poly_idx++) {
            multipolygon.addComponent(polygon_list[poly_idx]);
          }
          self.polygonLayer.features[0].geometry = multipolygon;
          while (self.polygonLayer.features.length > 1) {
            self.polygonLayer.features.pop(1);
          }
        }



        //re-enable feature attribution
        app.viewModel.enableFeatureAttribution();
    };

    self.startSketch = function() {
        self.isDrawing(true);
        //activate the draw feature control
        self.polygonControl.activate();
        //disable feature attribution
        app.viewModel.disableFeatureAttribution();
    };
    /*
    self.replacePolygonLayer = function(newLayer) {
        app.map.removeLayer(self.polygonLayer);
        self.polygonLayer = newLayer;
        //maybe remove layer from app.map and then re-add layer?
        app.map.removeLayer(newLayer);
        app.map.addLayer(newLayer);
    };
    */
    self.cleanUp = function() {
        //app.map.removeLayer(self.polygonLayer);
        self.polygonControl.deactivate();
        app.map.removeControl(self.polygonControl);
        self.editControl.deactivate();
        app.map.removeControl(self.editControl);
        //BETTER YET -- just remove all app.map.layer items that match the name New Polygon Layer
        //might make the name slightly more cryptic for this...
        app.map.removeLayerByName(self.newPolygonLayerName);
    };

    return self;
} // end polygonFormModel
