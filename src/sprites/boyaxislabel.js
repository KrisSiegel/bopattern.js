BoPattern.extend(function(internal) {
    "use strict";

    internal.BoYAxisLabel = function(text, position) {
        var zlayer = "overlay";

        var txt = text;
        var pos = position;
        var txtMeasurement;
        var x;
        var y;
        var font;

        var me = {
            type: "boyaxislabel",
            render: function(ctx) {
                if (x && y) {
                    ctx.font = font;
                    ctx.textAlign = "left";
                    ctx.fillStyle = internal.BoYAxisLabel.properties.color;
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                if (!msngr.isEmptyString(txt)) {
                    txtMeasurement = ctx.measureText(txt);
                    var txtWidth = txtMeasurement.width;
                    var perLabelHeight = (internal.boundedHeight / internal.data.yaxisLabelCount);
                    var ylabelWidth = (internal.screenWidth - internal.boundedWidth) / 2;
                    x = (ylabelWidth / 2) - (txtWidth / 2);
                    y = internal.boundedY1 + (perLabelHeight * pos) + (perLabelHeight / 2);

                    if (internal.data.yaxisLabelCount > 15) {
                        font = internal.BoYAxisLabel.properties.smallestFont;
                    } else {
                        font = internal.BoYAxisLabel.properties.font;
                    }
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

    internal.BoYAxisLabel.properties = {
        font: "16px sans-serif",
        smallestFont: "12px sans-serif",
        color: "#000000"
    };

    return { };
});
