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
                    ctx.textAlign = "left";
                    ctx.fillStyle = internal.BoEmpty.properties.color;
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                txtMeasurement = ctx.measureText(txt);
                x = ((internal.screenWidth / 2) - (txtMeasurement.width / 2));
                y = ((internal.screenHeight / 2) - internal.BoEmpty.properties.heightMargin);
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
        font: "24px Gotham,Helvetica Neue,Helvetica,Arial,sans-serif",
        color: "#858585",
        heightMargin: 14
    };

    return { };
});
