var BoPattern = (function() {
    "use strict";
    var extenders = []; // holds all extensions to be applied to each new BoPattern instance

    // The main function that is executed when a developer calls BoPattern(); returns a new instance
    var bo = function(input) {
        // internal object for tracking ALL THE THINGS
        var internal = {
            UpdatesPerSecond: 60,
            label: "Pattern of Life",
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
            data: {}
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

        // Gets the pixel ratio for high definition monitors
        Object.defineProperty(internal, "pxRatio", {
            get: function() {
                var dpr = window.devicePixelRatio || 1;
                var bsr = internal.context2D.backingStorePixelRatio ||
                    internal.context2D.webkitBackingStorePixelRatio ||
                    internal.context2D.mozBackingStorePixelRatio ||
                    internal.context2D.msBackingStorePixelRatio ||
                    internal.context2D.backingStorePixelRatio || 1;

                return (dpr / bsr);
            }
        });

        // Verify setup since it should be theoretically done
        if (!msngr.exist(internal.canvas) || !msngr.exist(internal.context2D)) {
            throw "[BoPattern.js] Welp you passed the first set of validators but I still failed to get the canvas :(";
        }

        // Set parent
        internal.parent = internal.canvas.parentNode;

        Object.defineProperty(internal, "zlevels", {
            get: function() {
                return Object.keys(internal.objects);
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
        internal.clearObjects = function(zkey, type) {
            for (var i = 0; i < internal.objects[zkey].length; ++i) {
                if (type !== undefined && internal.objects[zkey][i].type === type) {
                    internal.objects[zkey][i].unload();
                }
            }
        };

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
                    Object.defineProperty(boObj, "internal", {
                        configurable: true,
                        get: function() {
                            return internal;
                        }
                    });
                }
                if (input === false) {
                    internal.clearObjects("overlay", "bodebug");
                    delete boObj.internal;
                }
            },
            get: function() {
                return internal.debug;
            }
        });

        Object.defineProperty(boObj, "label", {
            get: function() {
                return internal.label;
            },
            set: function(txt) {
                internal.label = txt;
            }
        });

        internal.addObject("overlay", internal.BoEmpty());
        internal.addObject("overlay", internal.BoLabel());

        // Stop rendering if the user has unfocused the window
        document.addEventListener("visibilitychange", function(e) {
            if (document.hidden) {
                internal.stopRendering();
            } else {
                internal.startRendering();
            }
        });

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

    var renderZ = function(z, ctx) {
        var len = internal.objects[z].length;
        for (var i = 0; i < len; ++i) {
            if (internal.objects[z][i]) {
                ctx.beginPath();
                internal.objects[z][i].render(ctx);
                ctx.closePath();
            }
        }
    };

    var renderRequest;
    var render = function() {
        var ctx = internal.context2D;

        ctx.clearRect(0, 0, internal.canvas.width, internal.canvas.height);

        renderZ("background", ctx);
        renderZ("foreground", ctx);
        renderZ("overlay", ctx);

        renderRequest = window.requestAnimationFrame(render);
    };

    internal.startRendering = function() {
        render();
    };

    internal.stopRendering = function() {
        (window.cancelAnimationFrame || window.mozCancelAnimationFrame)(renderRequest);
    };

    internal.startRendering();
});

BoPattern.extend(function(internal) {
    "use strict";

    // Update objects
    var updateZ = function(z, ctx) {
        var len = internal.objects[z].length;
        for (var i = 0; i < len; ++i) {
            if (internal.objects[z][i]) {
                internal.objects[z][i].update(ctx);
            }
        }
    };

    // Update mouse information
    internal.canvas.addEventListener("mousemove", function(e) {
        var bounding = internal.canvas.getBoundingClientRect();
        internal.user.mousePosition = {
            x: e.clientX - bounding.left,
            y: e.clientY - bounding.top
        };
    });

    var updateRequest;
    var update = function() {
        // Normally wouldn't need in an update but it's kinda needed to do measurements
        var ctx = internal.context2D;
        var ratio = internal.pxRatio;

        // Set canvas size to the container's size
        var width = internal.parent.getBoundingClientRect().width;
        var height = internal.parent.getBoundingClientRect().height;
        if (internal.screenWidth !== width || internal.screenHeight !== height) {
            internal.canvas.width = (width * ratio);
            internal.canvas.style.width = (width + "px");
            internal.screenWidth = width;

            internal.canvas.height = (height * ratio);
            internal.canvas.style.height = (height + "px");
            internal.screenHeight = height;

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

            // This sets the bounding area's size for rendering the graph tiles
            internal.boundedWidth = (internal.screenWidth - (internal.screenWidth * .15));
            internal.boundedHeight = (internal.screenHeight - (internal.screenHeight * .20));

            // This sets the location of the bounded area
            internal.boundedX1 = ((internal.screenWidth - internal.boundedWidth) / 2);
            internal.boundedY1 = (((internal.screenHeight - internal.boundedHeight) / 2) + (((internal.screenHeight - internal.boundedHeight) / 2) / 2));
        }

        updateZ("background", ctx);
        updateZ("foreground", ctx);
        updateZ("overlay", ctx);

        updateRequest = window.requestAnimationFrame(update);
    };


    internal.startUpdating = function() {
        update();
    };

    internal.stopUpdating = function() {
        (window.cancelAnimationFrame || window.mozCancelAnimationFrame)(updateRequest);
    };

    internal.startUpdating();
});

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
                    ctx.font = "10pt Sans-serif";
                    ctx.fillStyle = "black";
                    ctx.globalAlpha = 1;

                    ctx.textAlign = "left";
                    ctx.fillText(texts.tiles.txt, texts.tiles.x, texts.tiles.y);
                    ctx.fillText(texts.data.txt, texts.data.x, texts.data.y);

                    ctx.textAlign = "center";
                    ctx.fillText(texts.mouse.txt, texts.mouse.x, texts.mouse.y);
                    ctx.closePath();
                }

                // Display the bounded area where the graph should be contained within
                ctx.beginPath();
                ctx.strokeStyle = "#000000";
                ctx.globalAlpha = 1;
                ctx.lineWidth = 1;
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

        Object.defineProperty(me, "z", {
            get: function() {
                return zlayer;
            }
        });

        return me;
    };

    return { };
});

BoPattern.extend(function(internal) {
    "use strict";

    internal.BoEmpty = function() {
        var zlayer = "overlay";

        var txt = "I have no data to display :(";
        var txtMeasurement;
        var x;
        var y;

        var me = {
            type: "boempty",
            render: function(ctx) {
                if (x && y) {
                    ctx.font = "16pt Calibri";
                    ctx.fillStyle = "black";
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                txtMeasurement = ctx.measureText(txt);
                x = ((internal.screenWidth / 2) - txtMeasurement.width);
                y = ((internal.screenHeight / 2) - txtMeasurement.height);
            },
            load: function() {

            },
            unload: function() {
                internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(tile), 1);
            }
        };

        Object.defineProperty(me, "z", {
            get: function() {
                return z;
            }
        });

        return me;
    };

    return { };
});

BoPattern.extend(function(internal) {
    "use strict";

    internal.BoLabel = function() {
        var zlayer = "overlay";
        var x = 0;
        var y = 0;

        var me = {
            type: "bolabel",
            render: function(ctx) {
                ctx.beginPath();
                ctx.font = "16pt sans-serif";
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 1;
                ctx.textAlign = "left";
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

    return { };
});

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

            return {
                x: internal.boundedX1 + (tileWidth * properties.position[0]),
                y: internal.boundedY1 + (tileHeight * properties.position[1]),
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
                }

                if (state === "loading") {
                    state = undefined;
                    transitionProperties = { };
                }

                if (state === "unloading") {
                    state = undefined;
                    transitionProperties = { };
                    internal.objects[zlayer].splice(internal.objects[zlayer].indexOf(tile), 1);
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
                    properties.tileAlpha = 0;
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
                internal.objects.background[i].unload();
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
                            if (msngr.isObject(datum)) {
                                datum.value = datum.value || datum.data;
                                datum.label = datum.label || datum.value;
                                delete datum.data;
                            } else {
                                datum = {
                                    value: datum,
                                    label: String(datum)
                                };
                            }

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
                        internal.objects.background[i].load();
                    }
                }
            };

            finish();
        }
    };
});
