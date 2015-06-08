// load layers from fixture or the server
app.viewModel.loadLayers = function(data) {
	var self = app.viewModel;
	// load layers
	$.each(data.layers, function(i, layer) {
		var layerViewModel = new layerModel(layer);

		self.layerIndex[layer.id] = layerViewModel;
		// add sublayers if they exist
		if (layer.subLayers) {
			$.each(layer.subLayers, function(i, layer_options) {
				var subLayer = new layerModel(layer_options, layerViewModel);
				app.viewModel.layerIndex[subLayer.id] = subLayer;
				layerViewModel.subLayers.push(subLayer);
			});
		}
	});

	// load themes
    $.each(data.themes, function(i, themeFixture) {
        var layers = [],
            theme = new themeModel(themeFixture);
        if (theme.is_visible) {
            $.each(themeFixture.layers, function(j, layer_id) {
                // create a layerModel and add it to the list of layers
                var layer = self.layerIndex[layer_id];

                // Construct the text document to be searched
                var searchText = layer.name + ' ' + 
                        themeFixture.display_name + ' ' +
                        themeFixture.description + ' ' +
                        layer.description + ' ' + 
                        layer.overview;
                var searchKey = layer.name;

                layer.themes.push(theme);
                theme.layers.push(layer);
                
                if (!layer.subLayers.length) { //if the layer does not have sublayers
                    self.layerSearchIndex[searchKey] = {
                        layer: layer,
                        searchText: searchText,
                        theme: theme
                    };
                } else { 
                    //if the layer has sublayers
                    $.each(layer.subLayers, function(i, subLayer) {
                        // Construct the text document to be searched
                        var searchText = subLayer.name + ' ' + 
                                themeFixture.display_name + ' / ' +
                                themeFixture.description + ' ' +
                                subLayer.parent.name + ' ' +
                                subLayer.parent.overview + ' ' +
                                subLayer.parent.description;
                        var searchKey = subLayer.name; 

                        if (subLayer.name !== 'Data Under Development') {
                            self.layerSearchIndex[searchKey] = {
                                layer: subLayer,
                                searchText: searchText,
                                theme: theme
                            };
                        }
                    });  
                    layer.subLayers.sort( function(a,b) { 
                        return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
                    });
                } 

            });
            //sort by name
            theme.layers.sort( function(a,b) { 
                return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
            });
            
            self.themes.push(theme);
        } else {
            $.each(themeFixture.layers, function(j, layer_id) {
                var layer = self.layerIndex[layer_id];
                layer.themes.push(theme);
                // if (layer.name === 'Canyon Labels' && $.browser.msie && $.browser.version < 9.0) {
                //     //skip it
                // } else {
                     theme.layers.push(layer);
                // }
            });
            //sort by name
            theme.layers.sort( function(a,b) { return a.name.toUpperCase().localeCompare(b.name.toUpperCase()); } );
            
            self.hiddenThemes.push(theme);
        }
    });
    
	app.typeAheadSource = (function () {
            var items = [];
            for (var searchTerm in app.viewModel.layerSearchIndex) {
                items.push({
                    'name': searchTerm
                });
            }
            return items;
    })();
    
};
app.viewModel.loadLayersFromFixture = function() {
	app.viewModel.loadLayers(app.fixture);
};


app.viewModel.loadLayersFromServer = function() {
	return $.getJSON('/data_manager/get_json', function(data) {
		app.viewModel.loadLayers(data);
	});
};
