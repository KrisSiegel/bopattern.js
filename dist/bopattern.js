var BoPattern = (function() {
    "use strict";
    var extenders = []; // holds all extensions to be applied to each new BoPattern instance

    // The main function that is executed when a developer calls BoPattern(); returns a new instance
    var bo = function(input, options) {
        // internal object for tracking ALL THE THINGS
        var internal = {
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
            data: {},
            eventHandlers: {},
            utils: {},
            config: msngr.merge({
                warnings: true,
                screen: {
                    ratio: undefined
                },
                tooltip: {
                    display: true
                }
            }, options)
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
                    internal.context2D.oBackingStorePixelRatio || 1;

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
            var clearqueue = [];
            for (var i = 0; i < internal.objects[zkey].length; ++i) {
                if (type === undefined || internal.objects[zkey][i].type === type) {
                    clearqueue.push(internal.objects[zkey][i]);
                }
            }
            var item = clearqueue.shift();
            while (item !== undefined) {
                item.unload();
                item = clearqueue.shift();
            }
        };

        var boObj = {};

        // Triggers an event
        internal.trigger = function(event, obj) {
            if (internal.eventHandlers[event] && internal.eventHandlers[event].length > 0) {
                for (var i = 0; i < internal.eventHandlers[event].length; ++i) {
                    internal.eventHandlers[event][i](obj);
                }
            }
        };

        // Registers an event handler
        internal.on = function(event, handler) {
            if (internal.eventHandlers[event] === undefined) {
                internal.eventHandlers[event] = [];
            }
            internal.eventHandlers[event].push(handler);
        };
        boObj.on = internal.on;

        // Unregisters an event handler
        internal.off = function(event, handler) {
            if (internal.eventHandlers[event] !== undefined) {
                internal.eventHandlers[event].splice(internal.eventHandlers[event].indexOf(handler), 1);
            }
        };
        boObj.off = internal.off;

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
                    internal.clearObjects("overlay", "bodebug"); // Make sure there is only one instance of BoDebug
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

        Object.defineProperty(boObj, "config", {
            get: function() {
                return internal.config;
            },
            set: function(input) {
                internal.config = msngr.merge(internal.config, input);
                internal.trigger("configChanged", internal.config);
            }
        });

        internal.addObject("overlay", internal.BoEmpty());
        internal.addObject("overlay", internal.BoTitle());

        boObj.removeSelf = function() {
            internal.clearObjects("background");
            internal.clearObjects("foreground");
            internal.clearObjects("overlay");

            internal.stopUpdating();
            internal.stopRendering();

            delete boObj.load;

            internal.parent.removeChild(internal.canvas);
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

    // Stop rendering if the user has unfocused the window
    document.addEventListener("visibilitychange", function(e) {
        if (document.hidden) {
            internal.stopRendering();
        } else {
            internal.startRendering();
        }
    });

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
        if (internal.config.screen.ratio !== undefined) {
            height = (width / internal.config.screen.ratio);
        }
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

            // This sets the absolute location of elements as per the whole window (not just the canvas)
            internal.absoluteLeft = internal.canvas.getBoundingClientRect().left;
            internal.absoluteTop = internal.canvas.getBoundingClientRect().top;
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
                    ctx.font = internal.BoEmpty.properties.font;
                    ctx.textAlign = "left";
                    ctx.fillStyle = internal.BoEmpty.properties.color;
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                txtMeasurement = ctx.measureText(txt);
                x = ((internal.screenWidth / 2) - (txtMeasurement.width / 2));
                y = ((internal.screenHeight / 2) - internal.BoEmpty.properties.heightMargin);
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

    internal.BoEmpty.properties = {
        font: "24px Gotham,Helvetica Neue,Helvetica,Arial,sans-serif",
        color: "#858585",
        heightMargin: 14
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
        var tooltip = internal.BoTooltip();

        // Basically a polyfill for ES6's Math.trunc()
        var truncate = function (val) {
        	return val < 0 ? Math.ceil(val) : Math.floor(val);
        };

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
                                    var eventData = {
                                        x: getProperty("x"),
                                        y: getProperty("y"),
                                        absX: internal.absoluteLeft + getProperty("x"),
                                        absY: internal.absoluteTop + getProperty("y"),
                                        width: getProperty("width"),
                                        height: getProperty("height"),
                                        label: getProperty("label")
                                    };
                                    internal.trigger("hover", eventData);
                                    tooltip.load(eventData);
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
                    tooltip.unload();
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
                properties.value = truncate(properties.value || 0);
                if (internal.data.maxValue === 0 || properties.value === 0) {
                    properties.tileAlpha = internal.BoTile.properties.emptyTileAlpha;
                    properties.tileColor = internal.BoTile.properties.emptyTileColor;
                } else {
                    properties.tileAlpha = (properties.value / internal.data.maxValue);
                    if (internal.BoTile.properties.tileAlphaMinimum > properties.tileAlpha) {
                        properties.tileAlpha = internal.BoTile.properties.tileAlphaMinimum;
                    }
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
        tileAlphaMinimum: 0.15,
        borderColor: "#FFFFFF",
        borderThickness: 10,
        borderAlpha: 1,
        borderHighlight: "#A3B3A3",
        emptyTileColor: "#888890",
        emptyTileAlpha: 0.356
    };

    return { };
});

BoPattern.extend(function(internal) {
    "use strict";

    // Static elements for BoTitle
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

    // Returns an instance of BoTitle
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
                ctx.textAlign = "left";
                ctx.fillText(internal.label, x, y);
                ctx.closePath();
            },
            update: function(ctx) {
                var measure = ctx.measureText(internal.label);
                x = ((internal.screenWidth / 2) - (measure.width / 2));
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

BoPattern.extend(function(internal) {
    "use strict";

    internal.BoXAxisLabel = function(text, position) {
        var zlayer = "overlay";

        var txt = text;
        var pos = position;
        var txtMeasurement;
        var x;
        var y;
        var font;

        var me = {
            type: "boxaxislabel",
            render: function(ctx) {
                if (x && y) {
                    ctx.font = font;
                    ctx.textAlign = "left";
                    ctx.fillStyle = internal.BoXAxisLabel.properties.color;
                    ctx.fillText(txt, x, y);
                }
            },
            update: function(ctx) {
                if (!msngr.isEmptyString(txt)) {
                    txtMeasurement = ctx.measureText(txt);
                    var txtWidth = txtMeasurement.width;
                    var perLabelWidth = (internal.boundedWidth / internal.data.xaxisLabelCount);

                    x = internal.boundedX1 + ((perLabelWidth * pos) + (perLabelWidth) / 2) - (txtWidth / 2);
                    x = x - (internal.BoTile.properties.borderThickness / 2);
                    y = internal.boundedY1 + internal.boundedHeight + internal.BoXAxisLabel.properties.heightMargin;

                    if (internal.data.xaxisLabelCount > 15) {
                        font = internal.BoXAxisLabel.properties.smallestFont;
                    } else {
                        font = internal.BoXAxisLabel.properties.font;
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

    internal.BoXAxisLabel.properties = {
        font: "16px sans-serif",
        smallestFont: "12px sans-serif",
        color: "#000000",
        heightMargin: 15
    };

    return { };
});

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
        var loaded = false;

        var me = {
            type: "botooltip",
            render: function(ctx) {
                ctx.beginPath();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = internal.BoTooltip.properties.backgroundStrokeColor;
                ctx.lineWidth = internal.BoTooltip.properties.backgroundStrokeThickness;
                ctx.fillStyle = internal.BoTooltip.properties.backgroundColor;
                internal.utils.fillRoundRect(ctx, overX - 6, overY, (txtWidth * 1.5) + 6, 25, 5);
                ctx.closePath();

                ctx.beginPath();
                ctx.font = internal.BoTooltip.properties.font;
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
                overY = tile.y - 25;
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
                // Ensures we only unload ourselves
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
        font: "13px sans-serif",
        color: "#FFFFEE",
        backgroundColor: "#232323",
        backgroundStrokeThickness: 1,
        backgroundStrokeColor: "#FFFFFF"
    };

    return { };
});

BoPattern.extend(function(internal) {
    "use strict";

    internal.utils.fillRoundRect = function(ctx, x, y, width, height, radius) {
        var rad = {
            tl: (radius || 0),
            tr: (radius || 0),
            br: (radius || 0),
            bl: (radius || 0)
        };

        ctx.beginPath();
        ctx.moveTo(x + rad.tl, y);
        ctx.lineTo(x + width - rad.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + rad.tr);
        ctx.lineTo(x + width, y + height - rad.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - rad.br, y + height);
        ctx.lineTo(x + rad.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - rad.bl);
        ctx.lineTo(x, y + rad.tl);
        ctx.quadraticCurveTo(x, y, x + rad.tl, y);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    }

    // We're not extending the instance
    return { };
});

BoPattern.extend(function(internal) {
    "use strict";

    return {
        load: function(data, meta) {
            if (!msngr.exist(data)) {
                return undefined;
            }

            var copy = data.slice(0); // This copies the array; msngr.copy() doesn't copy arrays :(
            var opts = msngr.copy(meta) || { }; // This copies the meta data options if any were provided
            if (opts.labels === undefined) {
                opts.labels = {
                    xaxis: [],
                    yaxis: []
                };
            }

            opts.labels.xaxis = opts.labels.xaxis || [];
            opts.labels.yaxis = opts.labels.yaxis || [];

            // Check the array dimensions
            if (msngr.isArray(copy) && (!msngr.isArray(copy[0]) && copy[0] !== undefined)) {
                // Array is one dimensional. Sigh. Let's just 'fix the glitch'
                copy = [copy];
                if (internal.config.warnings === true) {
                    console.warn("Single dimension array passed into <instance>.load(). It was autocorrected.");
                }
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
                    var maxFirstDimension = copy.length;
                    var maxSecondDimension = undefined;
                    var xaxisLabelCount = opts.labels.xaxis.length;
                    var yaxisLabelCount = opts.labels.yaxis.length;
                    var objects = [];

                    var dataLen = copy.length;
                    for (var i = 0; i < dataLen; ++i) {
                        var sLen = copy[i].length;
                        for (var j = 0; j < sLen; ++j) {
                            var datum = copy[i][j];
                            if (msngr.isObject(datum)) {
                                datum.value = (datum.value || datum.data) || 0;
                                datum.label = datum.label || datum.value.toFixed(2);
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
                    internal.clearObjects("overlay", "boempty");
                    internal.clearObjects("overlay", "boxaxislabel");
                    internal.clearObjects("overlay", "boyaxislabel");
                    if (maxSecondDimension === undefined) {
                        internal.addObject("overlay", internal.BoEmpty());
                    }

                    internal.data.raw = copy;

                    internal.stopRendering();

                    internal.data.minValue = minValue;
                    internal.data.maxValue = maxValue;
                    internal.data.maxFirstDimension = maxFirstDimension;
                    internal.data.maxSecondDimension = maxSecondDimension;
                    internal.data.xaxisLabelCount = xaxisLabelCount;
                    internal.data.yaxisLabelCount = yaxisLabelCount;
                    internal.objects.background = objects;

                    // x-axis labels
                    for (var i = 0; i < opts.labels.xaxis.length; ++i) {
                        (function(label, index) {
                            internal.addObject("overlay", internal.BoXAxisLabel(label, index));
                        }(opts.labels.xaxis[i], i));
                    }

                    // y-axis labels
                    for (var i = 0; i < opts.labels.yaxis.length; ++i) {
                        (function(label, index) {
                            internal.addObject("overlay", internal.BoYAxisLabel(label, index));
                        }(opts.labels.yaxis[i], i));
                    }

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
