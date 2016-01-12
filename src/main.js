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
            for (var i = 0; i < internal.objects[zkey].length; ++i) {
                if (type === undefined || internal.objects[zkey][i].type === type) {
                    internal.objects[zkey][i].unload();
                }
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
