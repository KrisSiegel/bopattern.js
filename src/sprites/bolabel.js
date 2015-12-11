BoPattern.extend(function(internal) {
    "use strict";

    internal.BoLabel = function() {
        var zlayer = "overlay";
        var x = 0;
        var y = 0;

        var me = {
            type: "bolabel",
            render: function(ctx) {
                ctx.beginPath();
                ctx.font = "16pt sans-serif";
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 1;
                ctx.textAlign = "left";
                ctx.fillText(internal.label, x, y);
                ctx.closePath();
            },
            update: function(ctx) {
                var measure = ctx.measureText(internal.label);
                x = ((internal.screenWidth / 2) - (measure.width));
                y = (internal.boundedY1 / 2);
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
