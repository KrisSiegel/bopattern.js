BoPattern.extend(function(internal) {
    "use strict";

    internal.BoTile = function(obj) {
        var zlayer = "background";
        if (!msngr.exist(obj) || !msngr.exists(obj.value, obj.label, obj.position)) {
            throw "[BoPattern.js] Invalid parameters supplied to BoTile";
        }
        var properties = msngr.copy(obj);
        var transitionProperties = { };
        var state;
        var mouseOver;

        var calcTileDimensions = function() {
            var tileWidth = (internal.canvas.width / internal.data.maxFirstDimension);
            var tileHeight = (internal.canvas.height / internal.data.maxSecondDimension);

            return {
                x: (tileWidth * properties.position[0]),
                y: (tileHeight * properties.position[1]),
                width: tileWidth,
                height: tileHeight
            };
        };

        var getProperty = function(str) {
            return (transitionProperties[str] || properties[str] || internal.BoTile.properties[str]);
        };

        var tile = {
            render: function(ctx) {
                // Set the boarders
                ctx.beginPath();
                ctx.fillStyle = getProperty("borderColor");
                ctx.lineWidth = getProperty("borderThickness");
                ctx.globalAlpha = getProperty("borderAlpha");
                ctx.strokeRect(getProperty("x"), getProperty("y"), getProperty("width"), getProperty("height"));
                ctx.closePath();

                // Set the fills
                ctx.beginPath();
                ctx.fillStyle = getProperty("tileColor");
                ctx.globalAlpha = getProperty("tileAlpha");
                ctx.fillRect(getProperty("x"), getProperty("y"), getProperty("width"), getProperty("height"));
                ctx.closePath();
            },
            update: function() {
                if (internal.user.mousePosition.x >= properties.x) {
                    if (internal.user.mousePosition.x <= (properties.x + 1 * properties.width)) {
                        // It's in our horizontal!
                        if (internal.user.mousePosition.y >= properties.y) {
                            if (internal.user.mousePosition.y <= (properties.y + 1 * properties.height)) {
                                // IT'S IN ME!
                                mouseOver = true;
                            } else {
                                mouseOver = false;
                            }
                        }
                    }
                }

                if (state === undefined) {
                    // Default state
                }

                if (state === "loading") {
                    if (transitionProperties.tileAlpha >= properties.tileAlpha) {
                        // We're done here
                        state = undefined;
                        transitionProperties = { };
                    } else {
                        transitionProperties.tileAlpha += internal.random(.01, .03);
                    }
                }

                if (state === "unloading") {
                    if (transitionProperties.tileAlpha <= 0.0) {
                        // We're done here
                        state = undefined;
                        transitionProperties = { };
                        internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(tile), 1);
                    } else {
                        transitionProperties.tileAlpha -= internal.random(.01, .03);
                    }
                }
            },
            load: function() {
                state = "loading";

                var dimensions = calcTileDimensions();
                properties.x = (dimensions.x + 1);
                properties.y = (dimensions.y + 1);
                properties.width = (dimensions.width);
                properties.height = (dimensions.height);
                properties.tileAlpha = (properties.value / internal.data.maxValue)

                transitionProperties = msngr.copy(properties);
                transitionProperties.tileAlpha = 0.0;
            },
            unload: function() {
                state = "unloading";

                transitionProperties = msngr.copy(properties);
            }
        };

        Object.defineProperty(tile, "z", {
            get: function() {
                return zlayer;
            }
        });

        Object.defineProperty(tile, "properties", {
            get: function() {
                return properties;
            }
        });

        return tile;
    };

    internal.BoTile.properties = {
        tileColor: "#4DD2FF",
        tileAlpha: 1,
        borderColor: "#323232",
        borderThickness: 1,
        borderAlpha: 0.7,
        borderHighlight: "#A3B3A3"
    };

    return { };
});
