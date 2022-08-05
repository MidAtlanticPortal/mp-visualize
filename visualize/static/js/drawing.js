
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
                
                // RDH 20220804: If users try to edit a shape before adding it to the map, the extent
                //  comes back as [Infinity, Infinity, -Infinity, -Infinity], and breaks stuff and 
                //  no edit form shows, forcing the user to refresh the page. This code tries to wait for it.
                let lyr_extent = self.drawing.layer().getDataExtent();
                if (lyr_extent && lyr_extent[0] != Infinity) {
                    app.map.zoomToExtent(lyr_extent);
                    app.map.zoomOut();
                } else {
                    window.setTimeout(function() {
                        lyr_extent = self.drawing.layer().getDataExtent();
                        if (lyr_extent && lyr_extent[0] != Infinity) {
                            app.map.zoomToExtent(lyr_extent);
                            app.map.zoomOut();
                            app.map.drawingLayer = self.drawing.layer().layer;

                            $('#drawing-form').html(data);
                            ko.applyBindings(app.viewModel.scenarios.drawingFormModel, document.getElementById('drawing-form'));

                            app.viewModel.scenarios.drawingFormModel.showEdit(true);
                            app.viewModel.scenarios.drawingFormModel.hasShape(true);
                        } else {
                            window.alert("Couldn't load editing form. Try adding your shape to the map before editing");
                        }
                    }, 500);
                    return;
                }

                app.map.drawingLayer = self.drawing.layer().layer;

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
        app.viewModel.activeLayers.remove(drawing.layer());
        //remove from app.map
        app.wrapper.map.removeLayerByUID(drawing.uid)
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
    self.sketchMode = ko.observable(null);
    self.showEdit = ko.observable(false);
    self.isEditing = ko.observable(false);
    self.hasShape = ko.observable(false);

    app.addDrawingLayerToMap();

    self.startSketch = app.startSketch;
    self.startPolygonSketch = app.startPolygonSketch;
    self.startLineSketch = app.startLineSketch;
    self.startPointSketch = app.startPointSketch;
    self.startEdit = app.startEdit;
    self.completeEdit = app.completeEdit;
    self.cleanUp = app.cleanupDrawing;

    return self;
} // end polygonFormModel
