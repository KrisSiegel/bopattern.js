BoPattern.extend(function(internal) {
    "use strict";

    // Returns an instance of BoTooltip
    internal.BoTooltip = function() {
        var zlayer = "foreground";
        var alpha = 0;
        var txtWidth;
        var txtX;
        var txtY;
        var overX;
        var overY;
        var tile;
        var fontSize = parseInt(internal.BoTooltip.properties.font); // Plucks the size out of the font property
        var loaded = false;

        var me = {
            type: "botooltip",
            render: function(ctx) {
                ctx.beginPath();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = internal.BoTooltip.properties.backgroundStrokeColor;
                ctx.lineWidth = internal.BoTooltip.properties.backgroundStrokeThickness;
                ctx.fillStyle = internal.BoTooltip.properties.backgroundColor;
                internal.utils.fillRoundRect(ctx, overX - 6, overY, (txtWidth * 1.5) + 6, 55, 5);
                ctx.closePath();

                ctx.beginPath();
                ctx.font = internal.BoTitle.properties.font;
                ctx.fillStyle = internal.BoTooltip.properties.color;
                ctx.globalAlpha = alpha;
                ctx.fillText(tile.label, txtX, txtY);
                ctx.closePath();
            },
            update: function(ctx) {
                var measure = ctx.measureText(tile.label);
                txtWidth = measure.width;
                txtX = ((tile.x + (tile.width / 2) - (txtWidth / 2)) - (internal.BoTile.properties.borderThickness / 2));
                txtY = tile.y - internal.BoTile.properties.borderThickness;
                overX = txtX;
                overY = tile.y - 45;
                if (alpha < 1) {
                    alpha += .10;
                }
            },
            load: function(tileProps) {
                alpha = 1;
                internal.addObject(zlayer, me);
                loaded = true;
                tile = tileProps;
            },
            unload: function() {
                if (loaded === true) {
                    loaded = false;
                    alpha = 0;
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
        font: "11px sans-serif",
        color: "#FFFFEE",
        backgroundColor: "#232323",
        backgroundStrokeThickness: 1,
        backgroundStrokeColor: "#FFFFFF"
    };

    return { };
});
