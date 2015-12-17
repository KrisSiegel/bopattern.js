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
        var ratio = internal.pxRatio;

        // Set canvas size to the container's size
        var width = internal.parent.getBoundingClientRect().width;
        var height = internal.parent.getBoundingClientRect().height;
        if (internal.screenWidth !== width || internal.screenHeight !== height) {
            internal.canvas.width = (width * ratio);
            internal.canvas.style.width = (width + "px");
            internal.screenWidth = width;

            internal.canvas.height = (height * ratio);
            internal.canvas.style.height = (height + "px");
            internal.screenHeight = height;

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

            // This sets the bounding area's size for rendering the graph tiles
            internal.boundedWidth = (internal.screenWidth - (internal.screenWidth * .15));
            internal.boundedHeight = (internal.screenHeight - (internal.screenHeight * .20));

            // This sets the location of the bounded area
            internal.boundedX1 = ((internal.screenWidth - internal.boundedWidth) / 2);
            internal.boundedY1 = (((internal.screenHeight - internal.boundedHeight) / 2) + (((internal.screenHeight - internal.boundedHeight) / 2) / 2));

            // This sets the absolute location of elements as per the whole window (not just the cancas)
            internal.absoluteLeft = internal.canvas.offsetLeft;
            internal.absoluteTop = internal.canvas.offsetTop;
        }

        updateZ("background", ctx);
        updateZ("foreground", ctx);
        updateZ("overlay", ctx);

        updateRequest = window.requestAnimationFrame(update);
    };


    internal.startUpdating = function() {
        update();
    };

    internal.stopUpdating = function() {
        (window.cancelAnimationFrame || window.mozCancelAnimationFrame)(updateRequest);
    };

    internal.startUpdating();
});
