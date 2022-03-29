function userLayerModel(options) {
    var self = this;

    scenarioModel.apply(this, arguments);

    self.uid = options.uid;
    self.name = options.name;
    self.description = options.description;

    self.layer_type = options.layer_type;
    self.url = options.url;
    self.arcgis_layers = options.arcgis_layers || null;

    if (
            (
                self.layer_type == 'ArcRest' || 
                self.layer_type == 'ArcFeatureServer'
            ) &&
            self.arcgis_layers == null
    ) {
        // Default to id 0 (often appropriate)
        self.arcgis_layers = 0;
    }

    self.shared = ko.observable();
    self.sharedByName = options.sharedByName || null;
    self.sharedByUser = options.sharedByUser;
    self.sharedByWho = self.sharedByName;
    self.sharedBy = ko.observable();
    // The groups that this object is shared with that we are a member of
    self.sharedToGroups = ko.observableArray(options.sharedToGroups);

    if (options.shared) {
        self.shared(true);
        var s = ['Shared By',
                 self.sharedByWho,
                 'to group' + (self.sharedToGroups().length == 1 ? '' : 's'),
                 self.sharedToGroups().join(", ")];
        self.sharedBy(s.join(" "));
    }
    else {
        self.shared(false);
        self.sharedBy(false);
    }

    self.selectedGroups = ko.observableArray();
    self.sharedGroupsList = [];
    if (options.sharingGroups && options.sharingGroups.length) {
        self.selectedGroups(options.sharingGroups);
    }
    self.temporarilySelectedGroups = ko.observableArray();

    self.loadUserLayer = function() {
        app.viewModel.displayUserLayer(self);
    }

    self.showSharingModal = function() {
        app.viewModel.userlayers.sharingUserLayer(self);
        self.temporarilySelectedGroups.removeAll();
        for (var i = 0; i < self.selectedGroups().length; i++) {
            self.temporarilySelectedGroups.push(self.selectedGroups()[i]);
        }
        $('#user-layer-share-modal').modal('show');
    };

    /** Return true if this user layer is shared with the specified groupName
     */
    self.sharedWithGroup = function(groupName) {
        return self.selectedGroups.indexOf(groupName) != -1;
    }

    // get the url from a bookmark
    self.getBookmarkUrl = function() {
        var host = window.location.href.split('#')[0];
        return host + "#userlayer=" + self.id.replace(/\D/g,''); //We just want the integer ID, this strips away all non-numeric text
    };

    return self;

}   // end of userLayerModel

function userLayersModel(options) {
    var self = this;

    self.userLayersList = ko.observableArray();

    self.activeUserLayer = ko.observable();

    self.sharingUserLayer = ko.observable();

    self.sharingGroups = ko.observableArray();

    // name of newly created user layer
    self.newUserLayerName = ko.observable();

    // description of newly created user layer
    self.newUserLayerDescription = ko.observable();

    self.newUserLayerUrl = ko.observable();
    self.newUserLayerLayerType = ko.observable();
    self.newUserLayerArcGISLayers = ko.observable();
    self.layerTypes = ko.observableArray(['ArcRest', 'ArcFeatureServer']);

    // check for duplicate naming
    self.duplicateUserLayer = ko.observable(false);

    self.toggleGroup = function(obj) {
        var groupName = obj.group_name,
            indexOf = self.sharingUserLayer().temporarilySelectedGroups.indexOf(groupName);

        if ( indexOf === -1 ) {  //add group to list
            self.sharingUserLayer().temporarilySelectedGroups.push(groupName);
        } else { //remove group from list
            self.sharingUserLayer().temporarilySelectedGroups.splice(indexOf, 1);
        }
    };

    self.groupIsSelected = function(groupName) {
        if (!self.sharingUserLayer()) {
            return false;
        }
        var indexOf = self.sharingUserLayer().temporarilySelectedGroups.indexOf(groupName);
        return indexOf !== -1;
    };

    self.groupMembers = function(groupName) {
        var memberList = "";
        for (var i=0; i<self.sharingGroups().length; i++) {
            var group = self.sharingGroups()[i];
            if (group.group_name === groupName) {
                for (var m=0; m<group.members.length; m++) {
                    var member = group.members[m];
                    memberList += member + '<br>';
                }
            }
        }
        return memberList;
    };

    self.shareBookmark = function(){
        self.sharingUserLayer(app.viewModel.userLayers.activeUserLayer);
        $('#user-layer-share-modal').modal('show');

    }

    self.removeUserLayer = function(userLayer, event) {
        $.jsonrpc('remove_user_layer', [userLayer.uid],
                  {complete: self.getUserLayers});
    };

    self.addUserLayer = function(name, description, layer_type, url, arcgis_layers) {
        $.jsonrpc('add_user_layer', 
            [
                name,
                description,
                layer_type,
                url,
                arcgis_layers
            ],
            {complete: self.getUserLayers}
        );
    }

    // get user layer sharing groups for this user
    self.getSharingGroups = function() {
        // borrow groups from the scenarios model instead of fetching them again
        self.sharingGroups(app.viewModel.scenarios.sharingGroups());
    }

    // store the user layers to local storage
    self.storeUserLayers = function() {
        var ownedUserLayers = [];
        for (var i=0; i<self.userLayersList().length; i++) {
            var userLayer = self.userLayersList()[i];
            if ( ! userLayer.shared() ) {
                ownedUserLayers.push(userLayer);
            }
        }
        amplify.store("user-layers", ownedUserLayers);
    };

    // method for loading existing user layers
    self.getUserLayers = function() {
        var existingUserLayers = [];
        var local_user_layers = [];
        if (existingUserLayers) {
            for (var i = 0; i < existingUserLayers.length; i++) {
                local_user_layers.push({
                    'name': existingUserLayers[i].name,
                    'description': existingUserLayers[i].description,
                    'layer_type': existingUserLayers[i].layer_type,
                    'url': existingUserLayers[i].url,
                    'arcgis_layers': existingUserLayers[i].arcgis_layers,
                    'sharing_groups': existingUserLayers[i].sharingGroups
                });
            }
        }

        $.jsonrpc('get_user_layers', [], {
            success: function(result) {
                var user_layers = result || [];
                var ullist = [];
                for (var i=0; i < user_layers.length; i++) {
                    var user_layer = new userLayerModel( {
                        name: user_layers[i].name,
                        description: user_layers[i].description,
                        url: user_layers[i].url,
                        layer_type: user_layers[i].layer_type,
                        arcgis_layers: user_layers[i].arcgis_layers,
                        uid: user_layers[i].uid,
                        shared: user_layers[i].shared,
                        sharedByUser: user_layers[i].shared_by_user,
                        sharedByName: user_layers[i].shared_by_name,
                        sharingGroups: user_layers[i].sharing_groups,
                        sharedToGroups: user_layers[i].shared_to_groups
                    });
                    ullist.push(user_layer);
                }

                if (ullist.length > 0) {
                    ullist.sort(function (a, b) {
                      // for all false values null, false, '', 0
                      if (!a.name) return 1;
                      if (!b.name) return 0;

                      a = (a.name || '').toLowerCase();
                      b = (b.name || '').toLowerCase();

                      return (a > b) ? 1 : ((a < b) ? -1 : 0);
                    });
                }
                self.userLayersList(ullist);
            },
            error: function(result) {

            }
        });

        self.getSharingGroups();
    };

    self.submitShare = function() {
        self.sharingUserLayer().selectedGroups(self.sharingUserLayer().temporarilySelectedGroups());
        var data = { 
            'user_layer': self.sharingUserLayer().uid,
            'groups': self.sharingUserLayer().selectedGroups() };

        $.jsonrpc('share_user_layer',
                  [self.sharingUserLayer().uid,
                   self.sharingUserLayer().selectedGroups()],
                  {complete: self.getUserLayers});
    };

    return self;
}   // end of userLayersModel

userLayersModel.prototype.showSharingModal = function(userLayer) {
    app.viewModel.userLayers.activeUserLayer(userLayer);
    userLayer.showSharingModal();
}