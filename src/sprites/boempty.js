BoPattern.extend(function(internal) {
    "use strict";

    internal.BoEmpty = function() {
        var zlayer = "overlay";

        var txt = "I have no data to display :(";
        var txtMeasurement;
        var x;
        var y;

        var me = {
            type: "boempty",
            render: function(ctx) {
                if (x && y) {
                    ctx.font = internal.BoEmpty.properties.font;
                    ctx.fillStyle = internal.BoEmpty.properties.color;
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                txtMeasurement = ctx.measureText(txt);
                x = ((internal.screenWidth / 2) - txtMeasurement.width);
                y = ((internal.screenHeight / 2) - txtMeasurement.height);
            },
            load: function() {

            },
            unload: function() {
                internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(me), 1);
            }
        };

        Object.defineProperty(me, "z", {
            get: function() {
                return z;
            }
        });

        return me;
    };

    internal.BoEmpty.properties = {
        font: "16pt Calibri",
        color: "#000000"
    };

    return { };
});
