// save the initial load hash so we can use it if set
app.hash = window.location.hash;
app.onResize = function(percent) {
    app.map.render('map');
};

$(window).on('resize', function() {
    app.onResize();
});

// add indexof for typeahead
if (!Array.prototype.indexOf) {

    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    };
 }


// state of the app
app.state = {
  //list of active layer ids in order they appear on the map
  activeLayers: [],
  totalLayers: 0,
  location: {}
};

// property to store the state of the map for restoring
app.restoreState = {};

ko.applyBindings(app.viewModel);
// app.viewModel.loadLayersFromServer().done(function() {
app.viewModel.initLeftNav().done(function() {
  app.onResize();

  // trigger events that depend on the map
  $(document).trigger('map-ready');

  // if we have the hash state go ahead and load it now
  if (app.hash) {
    app.loadStateFromHash(app.hash);
  }

  // autocomplete for filter
  // See bootstrap3-typeahead docs
  $('.main-search').typeahead({
    source: app.typeAheadSource,
    displayText: function(item) {
      return item.name;
    },
    matcher: function (item) {
      // custom search matching on object titles
      var it = item.name;
      return ~it.toLowerCase().indexOf(this.query.toLowerCase());
    },
    afterSelect: function() {
      // replace the search box contents with the user's actual input
      // otherwise it will be replaced by the display text of the chosen item
      $('#data-search-input').val(app.viewModel.searchTermInput());
    },
    autoSelect: true,
    items: 20,
    minLength: 2
  });

  $('[data-toggle="tooltip"]').tooltip();

  $('#toggleBaselayer').css({'background-image':"url(/static/visualize/img/baselayer-"+app.map.baseLayer.name.split(' ').join('_')+".png)", "color":+app.map.baseLayer.textColor});

  $(".nav-tabs li.disabled").on("click", function(e) {
    console.log("SDFA");
      e.preventDefault();
      return false;
  });

  setTimeout(function() {
    app.viewModel.showSliderButtons(app.viewModel.checkShowSliderButtons());
  }, 10);


});

// initialize the map
app.init();
// Google.v3 uses EPSG:900913 as projection, so we have to
// transform our coordinates
// TODO: Make map center a configuration value
app.map.setCenter(new OpenLayers.LonLat(-73.24, 38.93).transform(
new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), 7);

$(document).ready(function() {
  app.onResize();
  $(window).resize(app.onResize);

  //Do not display any warning for missing tiles
  OpenLayers.Util.onImageLoadError = function(){
    this.src = 'http://www.openlayers.org/api/img/blank.gif';
  };
  OpenLayers.Tile.Image.useBlankTile=false;

  // if we have the hash state go ahead and load it now
  /*if (app.hash && !app.loginHash) {
    console.log('document ready without #login hash');
    app.loadStateFromHash(app.hash);
  } */
  // handle coordinate indicator on pointer
  $('#map').bind('mouseleave mouseenter', function(e) {
    $('#pos').toggle();
  });
  $('#map').bind('mousemove', function(e) {
    $('#pos').css({
      left: e.pageX + 20,
      top: e.pageY + 20
    });
  });


  $('.form-search').find('.btn').on('click', function(event) {
     $(event.target).closest('form').find('input').val(null).focus();
  });

  $('#designsTab[data-toggle="tab"]').on('shown', function(e) {
    setTimeout(function() {$('.group-members-popover').popover({html: true, trigger: 'hover'});}, 2000);
  });

  //the following appears to handle the bookmark sharing, while the earlier popover activation handles the design sharing
  setTimeout(function() {$('.group-members-popover').popover({html: true, trigger: 'hover'});}, 2000);

  setTimeout(function() {
    $('.disabled').popover({
      delay: {'show': 200},
      trigger: 'hover',
      //template: '<div class="popover layer-popover"><div class="arrow"></div><div class="popover-inner layer-tooltip"><div class="popover-content"><p></p></div></div></div>'
    });
  }, 2000);

  // Basemaps button and drop-down behavior
  //hide basemaps drop-down on mouseout
  $('#basemaps').mouseleave( function(e) {
    if ( $(e.toElement).hasClass('basey') ) { //handler for chrome and ie
        $('#basemaps').addClass('open');
    } else if ( $(e.relatedTarget).hasClass('basey') ) { //handler for ff
        $('#basemaps').addClass('open');
    } else {
        $('#SimpleLayerSwitcher_29').hide();
    }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher_29').mouseleave( function() {
    $('#SimpleLayerSwitcher_29').hide();
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher_29').mousedown( function() {
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher_29').mouseenter( function() {
    //$('#basemaps').addClass('open');
  });

  $(document).on('click', 'a[name="start-default-tour"]', function() {
    app.viewModel.startDefaultTour();
  });

  $(document).on('click', '#continue-basic-tour', function() {
    app.viewModel.stepTwoOfBasicTour();
  });

  $(document).on('click', '#start-data-tour', function() {
    app.viewModel.startDataTour();
  });

  $(document).on('click', '#start-active-tour', function() {
    app.viewModel.startActiveTour();
  });

  $(document).on('click', '#share-option', function() {
    app.viewModel.scenarios.initSharingModal();
  });

  $(document).on('click', 'body', function(event) {
    var activeLayer = app.viewModel.activeLayer();
    var elm = '.layer.open.dropdown';
    if (activeLayer && typeof activeLayer.showSublayers == 'function') {
      if (activeLayer && (activeLayer.showSublayers() || $(elm).length)) {
        app.viewModel.outsideSubLayer(event, elm);
      }
    }
  });

  $(document).on('click', '#activeTab', function() {
    $('[data-toggle="tooltip"]').tooltip();
  })

  //typeahead autocomplete for mdat layers
  $(document).on('focusin', '.mdat-input', function(){
    var activeMDATParent = app.viewModel.activeLayer();

    function stringShortener(item) {
      var nlb = 'natural log biomass',
          intlb = 'interpolated natural log biomass',
          itName = item.name;

      if (itName.indexOf(nlb) > -1) {
        name = itName.replace(nlb, 'log biomass');
      } else if (itName.indexOf(intlb) > -1) {
        name = itName.replace(intlb, 'iterpolated biomass');
      } else {
        name = itName
      }
      return name
    };

    $(this).typeahead({
      source:  activeMDATParent.serviceLayers,
      matcher: function (item) {
        var it = stringShortener(item);
        // custom search matching on object titles
        if (it.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
            return true;
        }
      },
      displayText: function(item) {
        return stringShortener(item);
      },
      afterSelect: function(item) {
        item.url = activeMDATParent.url;
        app.viewModel.activateMDATLayer(item);
      },
      minLength: 2,
      items: 14,
    })
  });

  //typeahead autocomplete for VTR port layers
  $(document).on('focusin', '.port-input', function(){
    var activateVTRParent = app.viewModel.activeLayer();

    $(this).typeahead({
      source:  activateVTRParent.serviceLayers,
      matcher: function (item) {
        var it = item.name;
        // custom search matching on object titles
        if (it.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
            return true;
        }
      },
      afterSelect: function(item) {
        item.url = activateVTRParent.url;
        app.viewModel.activateVTRLayer(item);
      },
      minLength: 2,
      items: 12,
    })
  });

  // hiding feature attributes on new click events (but ignoring map pan events)
  app.map.events.register('move', app.map, function() {
    app.map.mousedrag = true;
  });
  $('#map').mouseup( function() {
    if ( !app.map.mousedrag ) {
      app.map.clickOutput.attributes = {};
      app.viewModel.closeAttribution();
    }
    app.map.mousedrag = false;
  });

  // $('a[data-toggle="tab"]').on('shown', function (e) {
  $('#myTab li').on('click', function(e) {
    setTimeout(function() {
      app.viewModel.showSliderButtons(app.viewModel.checkShowSliderButtons());
    }, 10);
    setTimeout(function() {
      app.updateUrl();
    }, 100);
  });

  $('[data-toggle="tooltip"]').tooltip();

});

$('#bookmark-form').on('submit', function(event) {
  var inputs = {},
    $form = $(this);
  event.preventDefault();
  $(this).find('input, textarea').each(function(i, input) {
    var $input = $(input);
    inputs[$input.attr('name')] = $input.val();
  });
  $.post('/feedback/bookmark', inputs, function() {
    $form.closest('.modal').modal('hide');
  });
});

$('#feedback-form').on('submit', function (event) {
   var feedback = {}, $form = $(this);
   event.preventDefault();
   $(this).find('input, textarea').each(function (i, input) {
      var $input = $(input);
      feedback[$input.attr('name')] = $input.val();
   });
   feedback.url = window.location.href;
   $.post('/feedback/send', feedback, function () {
      $form.closest('.modal').modal('hide');
      //$('#thankyou-modal').modal('show');
   });
   $form.closest('.modal').modal('hide');
});

// add panel class for printing
$('#map-wrapper').toggleClass('panel-open');
// toggle panel class for printing
// when map-wrapper has class panel-open the map is translated left by the width of left panel
// this allows the print area to match what the user sees in window
$('.collapse-button').click( function() {
  $('#map-wrapper').toggleClass('panel-open');
});

$('#left-panel .panel-heading h4 a.collapse-button').click(function(){
  $(this).find('i').toggleClass('fa-angle-double-left fa-angle-double-right');
  $("#left-minimized").toggle();
  $("#left-maximized").toggle();
  if( $("#left-minimized").is( ":visible" ) ){
    $('#left-panel').width('200px')
  }else{
    $('#left-panel').width('')
  }
});


var cloneForm = '.clone-wms-form';
//wms layer modal
$('#map-wrapper').on('click', '#wms-button', function() {
  var $mapModal = $('#map-wms-modal');

  $(cloneForm).show();
  //show only one form on load
  if ($('.wmsForm').length > 1) {
    $('.wmsForm').not(':first').remove();
  }
  //clear modal content
  $mapModal.on('hidden.bs.modal', function () {
      $(this).find("input,textarea").val('').end();
  });

  $mapModal.modal();
});

//clone wms form
$('#map-wms-modal').on('click', cloneForm, function() {
  var formCount = $('.wmsForm').length;
  var template = $('#wmsForms .wmsForm:first').clone();
  var elm = 'add';

  toggleFormClone(cloneForm, elm);

  formCount++;
  template.find('.modal-help-toggle').remove();
  template.find('.modal-form-help').remove();
  var form = template.clone().find(':input').val("").each(function(){
      //set id to store the updated form number
      var newId = this.id + formCount;
      //update for label
      $(this).prev().attr('for', newId);
      //update remove-wms class
      this.id = newId;
  }).end()

  //inject new form
  .appendTo('#wmsForms');

  //only show removal options on new forms
  form.children('.remove-wms').show();

  return false;
});

//remove wms forms
$('#map-wms-modal').on('click', '.remove-wms-form', function() {
  var elm = 'remove';
  $(this).parent().parent().remove();
  toggleFormClone(cloneForm, elm)
  return false;
});

function toggleFormClone(cloneForm, elm) {
  var formCount = $('.wmsForm').length;

  if (elm === 'add') {
    if (formCount >= 3) {
      $(cloneForm).hide();
    } else {
      $(cloneForm).show()
    }
  } else {
    if (formCount <= 4) {
      $(cloneForm).show();
    } else {
      $(cloneForm).hide();
    }
  }
}

function returnPxOver(pxOver) {
  var printWidthRatio = pxOver / 18;
  if (pxOver < 300) {
    printWidthRatio = pxOver / 13;
  } else if (pxOver < 400) {
    printWidthRatio = pxOver / 14;
  } else if (pxOver < 500) {
    printWidthRatio = pxOver / 15;
  } else if (pxOver < 625) {
    printWidthRatio = pxOver / 16;
  } else if (pxOver < 750) {
    printWidthRatio = pxOver / 17;
  }
  if (printWidthRatio > 0) {
    return printWidthRatio;
  } else {
    return 0;
  }
};

$('#btn-print').click(function() {
  var olimgs = document.getElementById('OpenLayers.Map_2_OpenLayers_Container'),
      $olsvgs = $('#map svg'),
      leftPanel = document.getElementById('left-panel'),
      $lpWidth = $('#left-panel:not(.collapsed)').width(),
      $mapWidth = $('#map-wrapper').width();

  /**
   * check to see if portrait then overwrite landscape px over
   */
  var pxOver = $mapWidth - 1056;
  if (window.innerHeight > window.innerWidth) {
    pxOver = $('#map-wrapper').height() - 812;
  }
  var printWidthRatio = returnPxOver(pxOver),
      olTilePrintWidth = 100 - printWidthRatio,
      printTileWidth = olTilePrintWidth + 'px';

  olimgs.style.width = printTileWidth;
  olimgs.style.height = printTileWidth;

  if ($lpWidth !== null) {
    var lpPrintWidth = $lpWidth - ($lpWidth * printWidthRatio / 100);
    leftPanel.style.width = lpPrintWidth + 'px';
  }

  $olsvgs.each(function(i,e) {
    var $svgWidth = $(this).width(),
      $svgHeight = $(this).height(),
      svgRatio = $svgHeight / $svgWidth;
    $(this).width($mapWidth - pxOver);
    $(this).height(($mapWidth - pxOver) * svgRatio);
  });

  window.setTimeout(function() {
    window.print();
    window.setTimeout(function() {
      olimgs.style.width = '100px';
      olimgs.style.height = '100px';
      if ($lpWidth !== null) {
        leftPanel.style.width = $lpWidth + 'px';
      }
      $olsvgs.each(function(i,e) {
        $(this).width($('#map').width());
        $(this).height($('#map').height());
      });
      app.map.updateSize();
    }, 1500);
  }, 1000);

});

$(document).mousedown(function(e) {

    // Process "outside" clicks
    if (app.viewModel._outsideClicks.length > 0) {
        var last = app.viewModel._outsideClicks[app.viewModel._outsideClicks.length - 1];
        if (!last.container.contains(e.target)) {
            app.viewModel._outsideClicks.pop();
            last.callback(e);
        }
    }

    return;

  //ensure layer switcher is removed
  $('#SimpleLayerSwitcher_29').hide();

  //removing layer tooltip popover from view
  var layer_pvr_event = $(e.target).closest(".layer-popover").length;
  if (!layer_pvr_event) {
    $("#layer-popover").hide();
  }

  //removing opacity popover from view
  var op_pvr_event = $(e.target).closest("#opacity-popover").length;
  var op_btn_event = $(e.target).closest(".opacity-button").length;
  if (!op_pvr_event && !op_btn_event) {
    //$('#opacity-popover').hide();
    app.viewModel.hideOpacity();
  }


});
