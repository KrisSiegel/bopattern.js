BoPattern.extend(function(internal) {
    "use strict";

    // Static elements for BoLabel
    var external = { };
    Object.defineProperty(external, "title", {
        get: function() {
            return internal.title;
        },
        set: function(input) {
            if (msngr.isString(input)) {
                internal.title = input;
            }
        }
    })

    // Returns an instance of BoLabel
    internal.BoTitle = function() {
        var zlayer = "overlay";
        var x = 0;
        var y = 0;

        var me = {
            type: "botitle",
            render: function(ctx) {
                ctx.beginPath();
                ctx.font = internal.BoTitle.properties.font;
                ctx.fillStyle = internal.BoTitle.properties.color;
                ctx.globalAlpha = 1;
                ctx.textAlign = "left"; // This isn't exposed as it's more related to rendering than anything stylish
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

    internal.BoTitle.properties = {
        font: "16pt sans-serif",
        color: "#000000",
        alpha: 1
    };

    return external;
});
