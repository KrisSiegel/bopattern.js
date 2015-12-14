BoPattern.extend(function(internal) {
    "use strict";

    internal.BoDebug = function() {
        var zlayer = "overlay";
        var texts = { mouse: { }, tiles: { }, data: { } };
        var updatedAtLeastOnce = false;

        var me = {
            type: "bodebug",
            render: function(ctx) {

                // Display text showing mouse's X and Y coordinates
                if (updatedAtLeastOnce) {
                    ctx.beginPath();
                    ctx.font = internal.BoDebug.properties.font;
                    ctx.fillStyle = internal.BoDebug.properties.color;
                    ctx.globalAlpha = internal.BoDebug.properties.textAlpha;

                    ctx.textAlign = "left";
                    ctx.fillText(texts.tiles.txt, texts.tiles.x, texts.tiles.y);
                    ctx.fillText(texts.data.txt, texts.data.x, texts.data.y);

                    ctx.textAlign = "center";
                    ctx.fillText(texts.mouse.txt, texts.mouse.x, texts.mouse.y);
                    ctx.closePath();
                }

                // Display the bounded area where the graph should be contained within
                ctx.beginPath();
                ctx.strokeStyle = internal.BoDebug.properties.borderColor;
                ctx.globalAlpha = internal.BoDebug.properties.borderAlpha;
                ctx.lineWidth = internal.BoDebug.properties.borderThickness;
                ctx.strokeRect(internal.boundedX1, internal.boundedY1, internal.boundedWidth, internal.boundedHeight);
                ctx.closePath();
            },
            update: function(ctx) {
                texts.mouse.txt = ("X: " + Math.floor(internal.user.mousePosition.x) + " Y: " + Math.floor(internal.user.mousePosition.y));
                var measure = ctx.measureText(texts.mouse.txt);
                texts.mouse.x = (internal.screenWidth - measure.width);
                texts.mouse.y = 15;

                texts.tiles.txt = "Tile count: " + internal.objects.background.length;
                texts.tiles.x = 2;
                texts.tiles.y = 15;

                texts.data.txt = "min value: " + Math.round(internal.data.minValue) + " / max value: " + Math.round(internal.data.maxValue);
                texts.data.x = 2;
                texts.data.y = 30;
                updatedAtLeastOnce = true;
            },
            load: function() {

            },
            unload: function() {
                internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(me), 1);
            }
        };

        return me;
    };

    internal.BoDebug.properties = {
        font: "10pt Sans-serif",
        color: "#000000",
        textAlpha: 1,
        borderColor: "#000000",
        borderAlpha: 1,
        borderThickness: 1
    };

    return { };
});
