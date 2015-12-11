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
