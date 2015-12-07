BoPattern.extend(function(internal) {
    "use strict";

    internal.BoDebug = function() {
        var zlayer = "overlay";
        var txt;
        var txtMeasurement;
        var x;
        var y = 20;

        var me = {
            render: function(ctx) {
                if (internal.debug && txt && x && y) {
                    ctx.font = "16pt Calibri";
                    ctx.fillStyle = "black";
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                txt = "X: " + Math.floor(internal.user.mousePosition.x) + " Y: " + Math.floor(internal.user.mousePosition.y);
                txtMeasurement = ctx.measureText(txt);
                x = (internal.canvas.width - txtMeasurement.width);
            },
            load: function() {

            },
            unload: function() {
                internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(me), 1);
            }
        };

        Object.defineProperty(me, "z", {
            get: function() {
                return zlayer;
            }
        });

        return me;
    };

    return { };
});
