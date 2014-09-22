/*! https://github.com/grisendo/jquery-gradpick by @grisendo */
;(function(window, document, $) {
  $.fn.gradientPicker = function(options) {
    var settings = $.extend(
      {
        initial: "#FFF",
        end: "#000",
        width: 300,
        height: 50,
        horizontal: true,
        rotable: false,
        previewFirst: false,
        previewRatio: 0.1,
        picker: 'red'
      },
      options
    );

    if (settings.width < settings.height) {
      var tmp = settings.width;
      settings.width = settings.height;
      settings.height = tmp;
    }

    return this.each(
      function() {
        var $this = $(this);
        if ($this.hasClass('gradient-picker-processed')) {
          return $this;
        }
        $this.addClass('gradient-picker-processed');
        var $that = $this;
        var fullcontainerDiv = $('<div></div>');
        var containerDiv = $('<div></div>');
        var canvasDiv = $('<canvas></canvas>');
        var markerDiv = $('<div></div>');
        var transparentDiv = $('<div></div>');
        var resultDiv = $('<div></div>');

        var rotator = $('<a></a>');
        rotator.addClass('rotate');
        rotator.attr('href', '#');
        rotator.css('text-decoration', 'none');
        if (!settings.rotable) {
          rotator.hide();
        }

        fullcontainerDiv.addClass('gradientpicker-wrapper').css({position: 'relative', clear: 'both'});
        containerDiv.addClass('gradientpicker-inn').css('position', 'relative');
        containerDiv.append(canvasDiv);
        containerDiv.append(markerDiv);
        containerDiv.append(transparentDiv);
        fullcontainerDiv.append(rotator);
        if (settings.previewFirst) {
          fullcontainerDiv.append(resultDiv);
        }
        fullcontainerDiv.append(containerDiv);
        if (!settings.previewFirst) {
          fullcontainerDiv.append(resultDiv);
        }
        $(this).append(fullcontainerDiv);
        var app = {};
        app.$colors = canvasDiv;
        app.colorctx = app.$colors[0].getContext('2d');
        app.$marker = markerDiv;
        app.$mouseevents = transparentDiv;
        app.$result = resultDiv;

        app.horizontal = settings.horizontal;

        app.$colors.addClass('color-palette').css({position: 'relative'});
        app.$marker.addClass('marker').css({border: '1px solid ' + settings.picker, top: 0, left: 0, position: 'absolute'});
        app.$mouseevents.addClass('transparent').css({cursor: 'crosshair', position: 'absolute', top: 0, left: 0, background: 'transparent'});
        app.$result.addClass('selected-color');

        rotator.click(
          function() {
            app.rotate();
            return false;
          }
        );

        app.__draw = function() {
          var gradient = null;
          var mleft = parseInt(app.$marker.css('left').split('px')[0]);
          var mtop = parseInt(app.$marker.css('top').split('px')[0]);
          if (app.horizontal) {
            $that.addClass('horizontal');
            $that.removeClass('vertical');
            app.$colors.attr('width', settings.width);
            app.$colors.attr('height', settings.height);
            containerDiv.css({width: settings.width, height: settings.height, float: 'none'});
            gradient = app.colorctx.createLinearGradient(0, 0, settings.width, 0);
            app.$mouseevents.css({width: settings.width, height: settings.height});
            app.$marker.css({width: '1px', height: settings.height - 2, left: mtop, top: 0});
            app.$result.css({width: settings.width, height: ~~(settings.height * settings.previewRatio), float: 'none'});
            rotator.html('&#8631;');
          }
          else {
            $that.addClass('vertical');
            $that.removeClass('horizontal');
            app.$colors.attr('width', settings.height);
            app.$colors.attr('height', settings.width);
            containerDiv.css({width: settings.height, height: settings.width, float: 'left'});
            gradient = app.colorctx.createLinearGradient(0, 0, 0, settings.width);
            app.$mouseevents.css({width: settings.height, height: settings.width});
            app.$marker.css({width: settings.height - 2, height: '1px', left: 0, top: mleft});
            app.$result.css({width: ~~(settings.height * settings.previewRatio), height: settings.width, float: 'left'});
            rotator.html('&#8630;');
          }
          gradient.addColorStop(0, settings.initial);
          gradient.addColorStop(1, settings.end);
          app.colorctx.fillStyle = gradient;
          app.colorctx.fillRect(0, 0, app.colorctx.canvas.width, app.colorctx.canvas.height);
        };

        app.dragging = false;

        app.__draw();

        var imageData = app.colorctx.getImageData(0, 0, 1, 1);
        app.selectedR = imageData.data[0];
        app.selectedG = imageData.data[1];
        app.selectedB = imageData.data[2];
        app.selectedColor = 'rgb(' + imageData.data[0] + ', ' + imageData.data[1] + ', ' + imageData.data[2] + ')';
        app.$result.css('background', app.selectedColor);

        app.rotate = function() {
          app.horizontal = !app.horizontal;
          app.__draw();
        };
        app.getRgb = function() {
          return [app.selectedR, app.selectedG, app.selectedB];
        }

        app.__calculateColor = function(e) {
          app.colorEventX = e.pageX - app.$colors.offset().left;
          app.colorEventY = e.pageY - app.$colors.offset().top;
          if (app.horizontal) {
            app.$marker.css({left: app.colorEventX - 2, top: 0});
          }
          else {
            app.$marker.css({left: 0, top: app.colorEventY - 2});
          }
          var imageData = app.colorctx.getImageData(app.colorEventX, app.colorEventY, 1, 1);
          app.selectedR = imageData.data[0];
          app.selectedG = imageData.data[1];
          app.selectedB = imageData.data[2];
          app.selectedColor = 'rgb(' + imageData.data[0] + ', ' + imageData.data[1] + ', ' + imageData.data[2] + ')';
          app.$result.css('background', app.selectedColor);
        };
        app.$mouseevents.mouseup(function(e) {
          e.preventDefault();
          app.dragging = false;
          app.__calculateColor(e);
          $that.trigger('gradientPicker', app.getRgb());
        });
        app.$mouseevents.mouseleave(function(e) {
          e.preventDefault();
          if (app.dragging) {
            app.dragging = false;
            $that.trigger('gradientPicker', app.getRgb());
          }
        });
        app.$mouseevents.mousemove(function(e) {
          e.preventDefault();
          if (app.dragging) {
            app.__calculateColor(e);
          }
        });
        app.$mouseevents.mousedown(function(e) {
          e.preventDefault();
          app.dragging = true;
          app.__calculateColor(e);
        });
        $(this).data('gradientPicker', app);
      }
    );
  };
}(this, document, jQuery));
