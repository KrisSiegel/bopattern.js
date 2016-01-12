BoPattern.extend(function(internal) {
    "use strict";

    internal.BoXAxisLabel = function(text, position) {
        var zlayer = "overlay";

        var txt = text;
        var pos = position;
        var txtMeasurement;
        var x;
        var y;

        var me = {
            type: "boxaxislabel",
            render: function(ctx) {
                if (x && y) {
                    ctx.font = internal.BoXAxisLabel.properties.font;
                    ctx.textAlign = "left";
                    ctx.fillStyle = internal.BoXAxisLabel.properties.color;
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                if (!msngr.isEmptyString(txt)) {
                    txtMeasurement = ctx.measureText(txt);
                    var txtWidth = txtMeasurement.width;
                    var perLabelWidth = (internal.boundedWidth / internal.data.xaxisLabelCount);

                    x = internal.boundedX1 + ((perLabelWidth * pos) + (perLabelWidth) / 2) - (txtWidth / 2);
                    x = x - (internal.BoTile.properties.borderThickness / 2);
                    y = internal.boundedY1 + internal.boundedHeight + internal.BoXAxisLabel.properties.heightMargin;
                }
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

    internal.BoXAxisLabel.properties = {
        font: "12pt sans-serif",
        color: "#000000",
        heightMargin: 20
    };

    return { };
});
