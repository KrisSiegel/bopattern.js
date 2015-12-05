BoPattern.extend(function(internal) {
    "use strict";

    internal.BoDebug = function() {
        return {
            render: function(ctx) {
                if (internal.debug) {
                    ctx.font = "16pt Calibri";
                    ctx.fillStyle = "black";
                    var txt = "X: " + Math.floor(internal.user.mousePosition.x) + " Y: " + Math.floor(internal.user.mousePosition.y);
                    var measurement = ctx.measureText(txt);
                    ctx.fillText(txt, (internal.canvas.width - measurement.width), 20);
                }
            },
            update: function() {
                // Do nothing; render reads from global mouse coordinates
            }
        };
    };

    return { };
});
