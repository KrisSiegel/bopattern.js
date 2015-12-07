BoPattern.extend(function(internal) {
    "use strict";

    // Update objects
    var updateZ = function(z, ctx) {
        var len = internal.objects[z].length;
        for (var i = 0; i < len; ++i) {
            if (internal.objects[z][i]) {
                internal.objects[z][i].update(ctx);
            }
        }
    };

    // Update mouse information
    internal.canvas.addEventListener("mousemove", function(e) {
        var bounding = internal.canvas.getBoundingClientRect();
        internal.user.mousePosition = {
            x: e.clientX - bounding.left,
            y: e.clientY - bounding.top
        };
    });

    var updateRequest;
    var update = function() {
        // Normally wouldn't need in an update but it's kinda needed to do measurements
        var ctx = internal.context2D;

        internal.canvas.width = internal.parent.getBoundingClientRect().width;
        internal.canvas.height = internal.parent.getBoundingClientRect().height;
        internal.screenWidth = internal.canvas.width;
        internal.screenHeight = internal.canvas.height;

        updateZ("background", ctx);
        updateZ("foreground", ctx);
        updateZ("overlay", ctx);

        updateRequest = window.requestAnimationFrame(update);
    };

    update();

    internal.startUpdating = function() {
        update();
    };

    internal.stopUpdating = function() {
        (window.cancelAnimationFrame || window.mozCancelAnimationFrame)(updateRequest);
    };
});
