// save the initial load hash so we can use it if set
app.hash = window.location.hash;
// if (!app.hasOwnProperty('onResize')) {
//   app.onResize = function(percent) {
//     app.map.render('map');
//   };
// }

// $(window).on('resize', function() {
//     app.onResize();
// });

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
  // app.onResize(); // RDH 20191119 - this was commented out for 2019 upgrades, but may be needed for cacheless.

  // trigger events that depend on the map
  $(document).trigger('map-ready');

  // if we have the hash state go ahead and load it now
  if (app.hash) {
    app.loadStateFromHash(app.hash);
  }

  $('[data-toggle="tooltip"]').tooltip();

  $('#toggleBaselayer').css({'background-image':"url(/static/visualize/img/baselayer-"+app.wrapper.map.getBasemap().name.split(' ').join('_')+".png)", "color":+app.wrapper.map.getBasemap().textColor});

  $(".nav-tabs li.disabled").on("click", function(e) {
      e.preventDefault();
      return false;
  });

  setTimeout(function() {
    app.viewModel.showSliderButtons(app.viewModel.checkShowSliderButtons());
  }, 10);
});

// initialize the map
app.init();

// TODO: Make map center a configuration value
// app.wrapper.map.setCenter(-73.24, 38.93);

$(document).ready(function() {
  // app.onResize();
  // $(window).resize(app.onResize);

  //Do not display any warning for missing tiles
  // Be sure to set your map tech accordingly.

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
        $('#SimpleLayerSwitcher').hide();
    }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher').mouseleave( function() {
    $('#SimpleLayerSwitcher').hide();
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher').mousedown( function() {
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher').mouseenter( function() {
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
  var isDragging = false;
  $('#map')
  .mousedown(function() {
    isDragging = false;
  })
  .mousemove(function() {
    isDragging = true;
  })
  .mouseup( function() {
    if ( !isDragging ) {
      app.wrapper.map.clickOutput.attributes = {};
      app.viewModel.closeAttribution();
    }
    isDragging = false;
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

  // Show Attribution if hidden:
  var attribution_state = app.wrapper.controls.getAttributionState();
  app.wrapper.controls.setAttributionState('show');
  // window.print();
  
  $(this).attr('disabled', 'disabled');
  document.body.style.cursor = 'progress';

  // const format = document.getElementById('format').value;
  const format = 'US Letter';
  // const resolution = document.getElementById('resolution').value;
  // const resolution = '300';
  // const scale = document.getElementById('scale').value;
  // const scale = '1:100000';
  // const dim = dims[format];
  const viewResolution = app.map.getView().getResolution();
  const width = Math.round(8.5 * viewResolution);
  const height = Math.round(11 * viewResolution);

  // const scaleResolution =
  //   scale /
  //     getPointResolution(
  //       map.getView().getProjection(),
  //       resolution / 25.4,
  //       map.getView().getCenter()
  //     );

  html2canvas(document.body, {
    // allowTaint: true,
    width: width,
    height: height
  }).then(function (canvas) {
    const exportImage = canvas.toDataURL('image/png');
    exportImage.save('map.png');
    document.body.appendChild(canvas);
    $(this).attr('disabled', '');
    app.wrapper.controls.setAttributionState(attribution_state);
    document.body.style.cursor = 'auto';
  });
  
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

  return;

});
