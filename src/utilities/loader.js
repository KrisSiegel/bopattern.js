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
                    if (maxSecondDimension === undefined || maxSecondDimension === 0) {
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
