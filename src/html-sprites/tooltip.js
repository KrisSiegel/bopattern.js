BoPattern.extend(function(internal) {
    "use strict";

    var tooltip;
    var label;
    var applyConfig = function() {
        if (internal.config.tooltip.display === true) {
            if (tooltip === undefined) {
                tooltip = document.createElement("div");
                label = document.createElement("label");
                tooltip.appendChild(label);
            }
            tooltip.className = "polTooltip";
            if (tooltip.parentNode !== document.body) {
                document.body.appendChild(tooltip);
            }
        } else {
            document.body.removeChild(tooltip);
        }
    };

    internal.on("configChanged", function() {
        applyConfig();
    });

    var clear = function() {
        while (label && label.firstChild) {
            label.removeChild(label.firstChild);
        }
    };

    var timeout;
    internal.on("hover", function(e) {
        if (tooltip && internal.config.tooltip.display === true) {
            clearTimeout(timeout);
            clear();
            label.appendChild(document.createTextNode(e.label));
            tooltip.style.left = (((e.width / 2) + e.absX) - (tooltip.getBoundingClientRect().width / 2)) + "px";
            tooltip.style.top = (e.absY - e.height) + "px";
            tooltip.style.display = "block";
            timeout = setTimeout(function() {
                tooltip.style.display = "none";
                tooltip.style.left = 0;
                tooltip.style.top = 0;
            }, 3500);
        }
    });

    applyConfig(); // Initial application of it
});
