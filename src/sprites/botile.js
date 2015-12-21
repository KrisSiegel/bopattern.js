BoPattern.extend(function(internal) {
    "use strict";

    internal.BoTile = function(obj) {
        var zlayer = "background";
        if (!msngr.exist(obj) || !msngr.exists(obj.value, obj.label, obj.position)) {
            throw "[BoPattern.js] Invalid parameters supplied to BoTile";
        }
        var loaded = false;
        var properties = msngr.copy(obj);
        var transitionProperties = { };
        var state;
        var mouseOver;
        var cachedScreenWidth;
        var cachedScreenHeight;

        var calcTileDimensions = function() {
            var tileWidth = (internal.boundedWidth / internal.data.maxFirstDimension);
            var tileHeight = (internal.boundedHeight / (internal.data.maxSecondDimension + 1));
            var x = internal.boundedX1 + (tileWidth * properties.position[0]);
            var y = internal.boundedY1 + (tileHeight * properties.position[1]);

            return {
                x: x,
                y: y,
                width: tileWidth,
                height: tileHeight
            };
        };

        var getProperty = function(str) {
            if (transitionProperties[str] !== undefined) {
                return transitionProperties[str];
            }

            if (properties[str] !== undefined) {
                return properties[str];
            }
            return internal.BoTile.properties[str];
        };

        var tile = {
            type: "tile",
            render: function(ctx) {
                if (loaded) {
                    // Set the boarders
                    ctx.beginPath();
                    ctx.strokeStyle = getProperty("borderColor");
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
                }
            },
            update: function() {
                var hitInThisIteration = false;
                if (internal.user.mousePosition.x >= properties.x) {
                    if (internal.user.mousePosition.x <= (properties.x + properties.width)) {
                        // It's in our horizontal!
                        if (internal.user.mousePosition.y >= properties.y) {
                            if (internal.user.mousePosition.y <= (properties.y + properties.height)) {
                                // IT'S IN ME!
                                if (mouseOver === false) {
                                    // State just changed; trigger intensifying!
                                    internal.trigger("hover", {
                                        x: getProperty("x"),
                                        y: getProperty("y"),
                                        absX: internal.absoluteLeft + getProperty("x"),
                                        absY: internal.absoluteTop + getProperty("y"),
                                        width: getProperty("width"),
                                        height: getProperty("height"),
                                        label: getProperty("label")
                                    });
                                }
                                mouseOver = true;
                                hitInThisIteration = true;
                            }
                        }
                    }
                }

                // Do this so I'm not setting mouseOver = false 4 freaking times
                if (hitInThisIteration !== true) {
                    mouseOver = false;
                }

                if (cachedScreenWidth !== internal.screenWidth || cachedScreenHeight !== internal.screenHeight) {
                    // Screen size changed; on noes!
                    var dimensions = calcTileDimensions();
                    properties.x = (dimensions.x);
                    properties.y = (dimensions.y);
                    properties.width = dimensions.width;
                    properties.height = dimensions.height;

                    // Are we in transition?
                    if (state !== undefined) {
                        transitionProperties.x = properties.x;
                        transitionProperties.y = properties.y;
                        transitionProperties.width = properties.width;
                        transitionProperties.height = properties.height;
                    }

                    cachedScreenWidth = internal.screenWidth;
                    cachedScreenHeight = internal.screenHeight;
                }

                if (state === undefined) {
                    // Default state
                    return undefined;
                }

                if (state === "loading") {
                    if (transitionProperties.tileAlpha >= properties.tileAlpha) {
                        state = undefined;
                        transitionProperties = { };
                        return undefined;
                    }
                    transitionProperties.tileAlpha = transitionProperties.tileAlpha + internal.random(0.02, 0.04);
                }

                if (state === "unloading") {
                    if (transitionProperties.tileAlpha <= 0.0) {
                        state = undefined;
                        transitionProperties = { };
                        internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(tile), 1);
                        return undefined;
                    }
                    transitionProperties.tileAlpha = transitionProperties.tileAlpha - internal.random(0.08, 0.12);
                }
            },
            load: function() {
                state = "loading";

                cachedScreenWidth = internal.screenWidth;
                cachedScreenHeight = internal.screenHeight;

                // Set tile properties
                var dimensions = calcTileDimensions();
                properties.x = (dimensions.x);
                properties.y = (dimensions.y);
                properties.width = (dimensions.width);
                properties.height = (dimensions.height);
                if (internal.data.maxValue === 0) {
                    properties.tileAlpha = 0.0;
                } else {
                    properties.tileAlpha = (properties.value / internal.data.maxValue);
                }

                transitionProperties = msngr.copy(properties);
                transitionProperties.tileAlpha = 0.0;

                loaded = true;
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
        borderColor: "#FFFFFF",
        borderThickness: 10,
        borderAlpha: 1,
        borderHighlight: "#A3B3A3"
    };

    return { };
});
