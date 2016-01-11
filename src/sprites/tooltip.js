BoPattern.extend(function(internal) {
    "use strict";

    // Returns an instance of BoTooltip
    internal.BoTooltip = function() {
        var zlayer = "overlay";
        var x = 0;
        var y = 0;
        var alpha = 0;
        var tile;
        var loaded = false;

        var me = {
            type: "botooltip",
            render: function(ctx) {
                ctx.beginPath();
                ctx.font = internal.BoTitle.properties.font;
                ctx.fillStyle = internal.BoTitle.properties.color;
                ctx.globalAlpha = 1;
                ctx.fillText(tile.label, tile.x, tile.y);
                ctx.closePath();
            },
            update: function(ctx) {

            },
            load: function(tileProps) {
                internal.addObject(zlayer, me);
                loaded = true;
                alpha = 0;
                tile = tileProps;
            },
            unload: function() {
                if (loaded === true) {
                    loaded = false;
                    internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(me), 1);
                }
            }
        };

        Object.defineProperty(me, "z", {
            get: function() {
                return zlayer;
            }
        });

        return me;
    };

    internal.BoTooltip.properties = {
        font: "16pt sans-serif",
        color: "#000000"
    };

    return { };
});
