var BoPattern = (function() {
    "use strict";
    var extenders = []; // holds all extensions to be applied to each new BoPattern instance

    // The main function that is executed when a developer calls BoPattern(); returns a new instance
    var bo = function(input) {
        // internal object for tracking ALL THE THINGS
        var internal = {
            default: {
                fillColor: "#042037",
                borderColor: "#323232",
                borderAlpha: 0.7,
                borderHighlight: "#A3B3A3"
            },
            objects: {
                background: [],
                foreground: [],
                overlay: []
            },
            debug: false,
            user: {
                mousePosition: {
                    x: 0,
                    y: 0
                }
            },
            data: {},
            grid: [[]]
        };

        // Validate input
        if (typeof window === "undefined" || typeof window.HTMLCanvasElement === "undefined") {
            throw "[BoPattern.js] Sorry but your browser doesn't support the canvas element!";
        }

        if (!msngr.exist(input) || msngr.isEmptyString(input)) {
            throw "[BoPattern.js] Sorry but you supplied me with invalid input! What do you expect me to do with that!?";
        }

        // Okay we got an input; let's handle it appropriately depending on what it is
        switch (msngr.getType(input)) {
            case "[object String]":
                // User supplied a selector
                var elm = msngr.findElement(input);
                if (msngr.getType(elm) !== "[object HTMLCanvasElement]") {
                    // We're not in....CANVAS ANYMORE. GET IT!? HAHAHAHAHAHA
                    internal.canvas = document.createElement("canvas");
                    elm.appendChild(internal.canvas);
                } else {
                    internal.canvas = elm;
                }
                break;
            case "[object HTMLCanvasElement]":
                internal.canvas = input;
                break;
            default:
                if (msngr.isHtmlElement(input)) {
                    // Should be some sort of HTML element
                    internal.canvas = document.createElement("canvas");
                    input.appendChild(internal.canvas);
                } else {
                    throw "[BoPattern.js] Sorry but you supplied me with invalid input! What do you expect me to do with that!?";
                }
        };

        internal.context2D = internal.canvas.getContext("2d");

        // Verify setup since it should be theoretically done
        if (!msngr.exist(internal.canvas) || !msngr.exist(internal.context2D)) {
            throw "[BoPattern.js] Welp you passed the first set of validators but I still failed to get the canvas :(";
        }

        // Set parent
        internal.parent = internal.canvas.parentNode;

        var boObj = {};

        // Apply all extensions to the new instance
        for (var i = 0; i < extenders.length; ++i) {
            var obj = extenders[i];
            if (Object.prototype.toString.call(obj) === "[object Function]") {
                obj = obj(internal);
            }
            boObj = msngr.merge(obj, boObj);
        }

        // Add a way to display debug data if necessary
        Object.defineProperty(boObj, "debug", {
            set: function(input) {
                internal.debug = input;
                if (input === true) {
                    internal.clearObjects("overlay");
                    internal.addObject("overlay", internal.BoDebug());
                }
                if (input === false) {
                    internal.clearObjects("overlay");
                }
            },
            get: function() {
                return internal.debug;
            }
        });

        // Simple random range
        internal.random = function(min, max) {
            return (Math.random() * (max - min) + min);
        };

        // Add the ability to add items to be rendered
        internal.addObject = function(zkey, obj) {
            if (msngr.exist(obj) && msngr.exist(obj.render)) {
                internal.objects[zkey].push(obj);
            }
        };

        // Clear the array
        internal.clearObjects = function(zkey) {
            // Note: we need to make sure any existing references to this array
            // are affected which means we MUST modify the original.
            // This is faster than I initially expected http://jsperf.com/array-destroy/151
            (internal.objects[zkey] || []).splice(0, (internal.objects[zkey] || []).length);
        };

        // Return our brand new instance of BoPattern.js!!! Aww yiss!
        return boObj;
    };

    // This "extends" BoPattern; essentially it queues up all extensions which are then
    // executed when a new BoPattern instance is created giving it access to that instance's
    // internal structure
    bo.extend = function(obj) {
        extenders.push(obj);
    };

    return bo;
}());

BoPattern.extend(function(internal) {
    "use strict";
    var rendering = true;

    var renderZ = function(z, ctx) {
        var len = internal.objects[z].length;
        for (var i = 0; i < len; ++i) {
            ctx.beginPath();
            internal.objects[z][i].render(ctx);
            ctx.closePath();
        }
    };

    var renderRequest;
    var render = function() {
        var ctx = internal.context2D;
        ctx.clearRect(0, 0, internal.canvas.width, internal.canvas.height);

        renderZ("background", ctx);
        renderZ("foreground", ctx);
        renderZ("overlay", ctx);

        if (rendering) {
            renderRequest = window.requestAnimationFrame(render);
        }
    };

    internal.startRendering = function() {
        rendering = true;
        render();
    };

    internal.stopRendering = function() {
        rendering = false;
        (window.cancelAnimationFrame || window.mozCancelAnimationFrame)(renderRequest);
    };
});

BoPattern.extend(function(internal) {
    "use strict";
    var updating = true;

    // Update objects
    var updateZ = function(z, ctx) {
        var len = internal.objects[z].length;
        for (var i = 0; i < len; ++i) {
            internal.objects[z][i].update();
        }
    };

    // Update canvas size upon resize
    var resize = function() {
        if (updating) {
            internal.canvas.width = internal.parent.getBoundingClientRect().width;
            internal.canvas.height = internal.parent.getBoundingClientRect().height;
            updateZ("background");
            updateZ("foreground");
            updateZ("overlay");
        }
    };

    // Update mouse information
    internal.canvas.addEventListener("mousemove", function(e) {
        if (updating) {
            var bounding = internal.canvas.getBoundingClientRect();
            internal.user.mousePosition = {
                x: e.clientX - bounding.left,
                y: e.clientY - bounding.top
            };
            updateZ("background");
            updateZ("foreground");
            updateZ("overlay");
        }
    });

    // Set canvas size on initialization
    resize();

    // Setup event listener for when the window is resized
    window.addEventListener("resize", resize, false);

    internal.startUpdating = function() {
        updating = true;
    };

    internal.stopUpdating = function() {
        updating = false;
    };
});

BoPattern.extend(function(internal) {
    "use strict";

    internal.BoDebug = function() {
        return {
            render: function(ctx) {
                if (internal.debug) {
                    ctx.font = "16pt Calibri";
                    ctx.fillStyle = "black";
                    var txt = "X: " + Math.floor(internal.user.mousePosition.x) + " Y: " + Math.floor(internal.user.mousePosition.y);
                    var measurement = ctx.measureText(txt);
                    ctx.fillText(txt, (internal.canvas.width - measurement.width), 20);
                }
            },
            update: function() {
                // Do nothing; render reads from global mouse coordinates
            }
        };
    };

    return { };
});

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

BoPattern.extend(function(internal) {
    "use strict";

    return {
        load: function(data, delay) {
            delay = delay || 0;
            if (!msngr.exist(data)) {
                return undefined;
            }

            // Alright we're repopulating the grid; let's tell the existing
            // tiles to go away
            var objLen = internal.objects.background.length;
            for (var i = 0; i < objLen; ++i) {
                internal.objects.background[i].state = internal.BoTile.States.unloading;
            }

            var finish = function() {
                if (internal.objects.background.length > 0) {
                    setTimeout(finish, 5);
                } else {
                    var minValue = undefined;
                    var maxValue = undefined;
                    var maxFirstDimension = data.length;
                    var maxSecondDimension = undefined;
                    var objects = [];

                    var dataLen = data.length;
                    for (var i = 0; i < dataLen; ++i) {
                        var sLen = data[i].length;
                        for (var j = 0; j < sLen; ++j) {
                            var datum = data[i][j];
                            // Create tile
                            var tile = internal.BoTile(msngr.merge(datum, { position: [i, j] }));
                            objects.push(tile);

                            // Do calculations
                            if (minValue === undefined || datum.value < minValue) {
                                minValue = datum.value
                            }

                            if (maxValue === undefined || datum.value > maxValue) {
                                maxValue = datum.value;
                            }

                            if (maxSecondDimension === undefined || j > maxSecondDimension) {
                                maxSecondDimension = j;
                            }
                        }
                    }

                    // Clear the original array of objects if any still exist and create new ones
                    internal.clearObjects("background");

                    internal.data.raw = data;

                    internal.stopUpdating();
                    internal.stopRendering();

                    internal.data.minValue = minValue;
                    internal.data.maxValue = maxValue;
                    internal.data.maxFirstDimension = maxFirstDimension;
                    internal.data.maxSecondDimension = maxSecondDimension;
                    internal.objects.background = objects;

                    internal.startUpdating();
                    internal.startRendering();

                    var objLen = internal.objects.background.length;
                    for (var i = 0; i < objLen; ++i) {
                        internal.objects.background[i].state = internal.BoTile.States.loading;
                    }
                }
            };

            finish();
        }
    };
});
