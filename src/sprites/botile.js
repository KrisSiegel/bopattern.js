BoPattern.extend(function(internal) {
    "use strict";

    internal.BoTile = function(obj) {
        if (!msngr.exist(obj) || !msngr.exists(obj.value, obj.label, obj.position)) {
            throw "[BoPattern.js] Invalid parameters supplied to BoTile";
        }
        var properties = msngr.copy(obj);
        var mystate;
        var myTargetState = undefined;
        var stateTransitionCount = undefined;
        var transitionProperties = { };

        var tile = {
            render: function(ctx) {
                if (mystate !== internal.BoTile.States.initializing || myTargetState !== undefined) {
                    // Set the boarders
                    ctx.beginPath();
                    ctx.fillStyle = properties.borderHighlight || internal.default.borderColor;
                    ctx.lineWidth = properties.borderThickness || 1;
                    ctx.globalAlpha = properties.borderAlpha;
                    ctx.strokeRect(properties.x, properties.y, properties.width, properties.height);
                    ctx.closePath();

                    // Set the fills
                    ctx.beginPath();
                    ctx.fillStyle = internal.default.fillColor;
                    ctx.globalAlpha = properties.alpha;
                    ctx.fillRect(properties.x, properties.y, properties.width, properties.height);
                    ctx.closePath();
                }
            },
            update: function() {
                if (mystate !== internal.BoTile.States.initializing || myTargetState !== undefined) {
                    var tileWidth = (internal.canvas.width / internal.data.maxFirstDimension);
                    var tileHeight = (internal.canvas.height / internal.data.maxSecondDimension);

                    properties.x = (tileWidth * properties.position[0]);
                    properties.y = (tileHeight * properties.position[1]);
                    properties.width = tileWidth;
                    properties.height = tileHeight;

                    var hit = false;
                    if (internal.user.mousePosition.x >= properties.x) {
                        if (internal.user.mousePosition.x <= (properties.x + 1 * properties.width)) {
                            // It's in our horizontal!
                            if (internal.user.mousePosition.y >= properties.y) {
                                if (internal.user.mousePosition.y <= (properties.y + 1 * properties.height)) {
                                    // IT'S IN ME!
                                    hit = true;
                                } else {
                                    hit = false;
                                }
                            }
                        }
                    }

                    if (hit) {
                        properties.borderThickness = 5;
                        properties.borderHighlight = internal.default.borderHighlight;
                    } else {
                        properties.borderThickness = undefined;
                        properties.borderHighlight = undefined;
                    }

                    if (myTargetState === internal.BoTile.States.loading) {
                        if (stateTransitionCount === undefined) {
                            stateTransitionCount = 0;
                            transitionProperties.alpha = properties.alpha;
                            transitionProperties.borderAlpha = properties.borderAlpha;
                        }

                        if (stateTransitionCount >= 100) {
                            tile.state = internal.BoTile.States.shown;

                            properties.alpha = transitionProperties.alpha;
                            delete transitionProperties.alpha;

                            properties.borderAlpha = transitionProperties.borderAlpha;
                            delete transitionProperties.borderAlpha;
                            stateTransitionCount = undefined;
                        } else {
                            stateTransitionCount = stateTransitionCount + 10;
                            properties.alpha = ((stateTransitionCount / 100) * transitionProperties.alpha);
                            properties.borderAlpha = ((stateTransitionCount / 100) * transitionProperties.borderAlpha);
                            setTimeout(tile.update, internal.random(10, 75));
                        }
                    }

                    if (myTargetState === internal.BoTile.States.unloading) {
                        if (stateTransitionCount === undefined) {
                            stateTransitionCount = 100;
                        }

                        if (stateTransitionCount <= 0) {
                            tile.state = internal.BoTile.States.unloaded;
                            stateTransitionCount = undefined;
                        } else {
                            stateTransitionCount = stateTransitionCount - 10;
                            properties.alpha = ((stateTransitionCount / 100) * properties.alpha);
                            properties.borderAlpha = ((stateTransitionCount / 100) * properties.borderAlpha);
                            setTimeout(tile.update, internal.random(10, 75));
                        }
                    }
                }
            }
        };

        Object.defineProperty(tile, "state", {
            get: function() {
                return mystate;
            },
            set: function(input) {
                switch (input) {
                    case internal.BoTile.States.initializing:
                        // We're initializing; nothing will be rendered or updated
                        // Don't do anything
                        mystate = internal.BoTile.States.initializing;
                        properties.borderAlpha = internal.default.borderAlpha;
                        myTargetState = undefined;
                        break;
                    case internal.BoTile.States.loading:
                        // This means stuff should be initialized; let's set the target
                        // Also grab values and get ready!
                        myTargetState = internal.BoTile.States.loading;
                        properties.alpha = (properties.value / internal.data.maxValue);
                        tile.update();
                        break;
                    case internal.BoTile.States.shown:
                        // Nothing to do here but some setting of state. Good times
                        mystate = internal.BoTile.States.shown;
                        myTargetState = undefined;
                        tile.update();
                        break;
                    case internal.BoTile.States.unloading:
                        // Alright unloading time; let's animate away
                        myTargetState = internal.BoTile.States.unloading;
                        tile.update();
                        break;
                    case internal.BoTile.States.unloaded:
                        // And.....we're dead. Good night everybody!
                        mystate = internal.BoTile.States.unloaded;
                        myTargetState = undefined;
                        internal.objects.background.splice(internal.objects.background.indexOf(tile), 1);
                        break;
                    default:
                        // How the hell did we hit this?
                        break;
                };
            }
        });

        tile.state = internal.BoTile.States.initializing;

        return tile;
    };

    internal.BoTile.States = {
        initializing: "initializing",
        loading: "loading",
        shown: "shown",
        unloading: "unloading",
        unloaded: "unloaded"
    };

    return { };
});
