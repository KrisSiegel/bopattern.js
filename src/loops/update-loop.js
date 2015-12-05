BoPattern.extend(function(internal) {
    "use strict";
    var updating = true;

    // Update objects
    var updateZ = function(z, ctx) {
        var len = internal.objects[z].length;
        for (var i = 0; i < len; ++i) {
            internal.objects[z][i].update();
        }
    };

    // Update canvas size upon resize
    var resize = function() {
        if (updating) {
            internal.canvas.width = internal.parent.getBoundingClientRect().width;
            internal.canvas.height = internal.parent.getBoundingClientRect().height;
            updateZ("background");
            updateZ("foreground");
            updateZ("overlay");
        }
    };

    // Update mouse information
    internal.canvas.addEventListener("mousemove", function(e) {
        if (updating) {
            var bounding = internal.canvas.getBoundingClientRect();
            internal.user.mousePosition = {
                x: e.clientX - bounding.left,
                y: e.clientY - bounding.top
            };
            updateZ("background");
            updateZ("foreground");
            updateZ("overlay");
        }
    });

    // Set canvas size on initialization
    resize();

    // Setup event listener for when the window is resized
    window.addEventListener("resize", resize, false);

    internal.startUpdating = function() {
        updating = true;
    };

    internal.stopUpdating = function() {
        updating = false;
    };
});
