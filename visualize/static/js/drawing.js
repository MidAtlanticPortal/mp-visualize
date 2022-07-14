
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

                app.map.zoomToExtent(self.drawing.layer().getDataExtent());
                app.map.zoomOut();

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

// GIS File Import Logic

const validate_input_file = function() {
    let is_valid = false;
    let input_file_name = $('#gisfile').val();
    let name_length = input_file_name.length;
    let type_valid = false;
    if (
        name_length > 0 &&
        (
            input_file_name.toLowerCase().indexOf('.shp') > 0 ||
            input_file_name.toLowerCase().indexOf('.zip') > 0 ||
            input_file_name.toLowerCase().indexOf('.csv') > 0 ||
            input_file_name.toLowerCase().indexOf('.json') > 0 ||
            input_file_name.toLowerCase().indexOf('.geojson') > 0
        )
    ) {
        is_valid = true;
        type_valid = true;
    }
    return {
        'is_valid': is_valid,
        'length': name_length,
        'type_valid': type_valid
    }
}

const add_geojson_to_map = function(geojson) {
    app.wrapper.map.addFeaturesToDrawingLayer(geojson);
}

const interpret_json = function(field) {
    let file = field.prop('files')[0];
    let file_url = URL.createObjectURL(file);
    $.get(file_url, (data) => {
            let geojson_object = JSON.parse(data);
            add_geojson_to_map(geojson_object);
        }, "text");
}

const interpret_zip = function(field) {
    let file = field.prop('files')[0];
    loadshp({url: file, encoding: 'utf-8'}, function(geojson) { add_geojson_to_map(geojson)});
}

const interpret_file = function() {
    let field = $('#gisfile');
    let filename = field.val();
    let filename_parts = filename.split('.');
    let filename_type = filename_parts[filename_parts.length-1].toLowerCase();
    switch (filename_type) {
        case 'json':
            interpret_json(field);
            break;
        case 'geojson':
            interpret_json(field);
            break;
        case 'zip':
            interpret_zip(field);
            break;
        case 'shp':
            interpret_shp(field);
            break;
        case 'csv':
            interpret_csv(field);
            break;
        default:
            window.alert('Unsupported file type "' + filename_type + '"');
    }
}