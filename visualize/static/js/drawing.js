
function drawingModel(options) {
    var self = this;

    var ret = scenarioModel.apply(this, arguments);

    self.loadStatus = ko.observable(false);

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

    self.isDrawing = ko.observable(false);
    self.showEdit = ko.observable(false);
    self.isEditing = ko.observable(false);
    self.hasShape = ko.observable(false);

    app.addDrawingLayerToMap();

    self.startSketch = app.startSketch;
    self.startEdit = app.startEdit;
    self.completeEdit = app.completeEdit;

    //self.selectFeature = new OpenLayers.Control.SelectFeature(self.polygonLayer);
    //app.map.addControl(self.selectFeature);

    // self.startEdit = function() {
    //     self.isEditing(true);
    //     //activate the modify feature control
    //     self.editControl.activate();
    //     //disable feature attribution
    //     app.viewModel.disableFeatureAttribution();
    //     //select polygon
    //     self.editControl.selectFeature(self.polygonLayer.features[0]);
    // };

    // self.completeEdit = function() {
    //     self.isEditing(false);
    //     //deactivate the modify feature control
    //     self.editControl.deactivate();
    //     geom = self.polygonLayer.features[0].geometry;
    //     if (geom instanceof OpenLayers.Geometry.Polygon) {
    //       // small edit for backward compatibility with polygon-only drawings
    //       polys = [geom]
    //     } else {
    //       polys = geom.components;
    //     }
    //     //check that all shapes are polygons
    //     for (var i = polys.length-1; i >= 0; i--) {
    //       poly = polys[i];
    //       if (!self.validate_polygon(poly)){
    //         geom.removeComponent(polys[i]);
    //       }
    //     }
    //     self.polygonLayer.redraw();
    //     //re-enable feature attribution
    //     app.viewModel.enableFeatureAttribution();
    //     // Check that at least 1 shape remains after validation
    //     if (self.polygonLayer.features.length == 0 || self.polygonLayer.features[0].geometry.components.length == 0) {
    //       self.hasShape(false);
    //       self.startSketch();
    //       window.alert('You have no shapes drawn. Please draw a shape before saving.');
    //     }
    // };

    // self.consolidatePolygonLayerFeatures = function() {
    //   // Despite the name, this mostly functions to convert old Polygon drawings
    //   //    into single-part multipolygons, but it also helps with isertion of
    //   //    new polygons into multipolygons.
    //   feature_list = self.polygonLayer.features;
    //   polygon_list = [];
    //   for (var i=0; i < feature_list.length; i++) {
    //     if (feature_list[i].geometry instanceof OpenLayers.Geometry.Polygon) {
    //       polygon_list.push(feature_list[i].geometry)
    //     } else if (feature_list[i].geometry instanceof OpenLayers.Geometry.MultiPolygon) {
    //       for (var j=0; j < feature_list[i].geometry.components.length; j++) {
    //         if (feature_list[i].geometry.components[j] instanceof OpenLayers.Geometry.Polygon) {
    //           polygon_list.push(feature_list[i].geometry.components[j])
    //         }
    //       }
    //     } else {
    //       window.alert('New geometry is not a polygon and will not be added to the drawing.');
    //     }
    //   }
    //   multipolygon = new OpenLayers.Geometry.MultiPolygon;
    //   for (var poly_idx = 0; poly_idx < polygon_list.length; poly_idx++) {
    //     multipolygon.addComponent(polygon_list[poly_idx]);
    //   }
    //   if (self.polygonLayer.features.length > 0) {
    //     self.polygonLayer.features[0].geometry = multipolygon;
    //     while (self.polygonLayer.features.length > 1) {
    //       self.polygonLayer.features.pop(1);
    //     }
    //   }
    // }

    self.cleanUp = app.cleanupDrawing;

    return self;
} // end polygonFormModel
