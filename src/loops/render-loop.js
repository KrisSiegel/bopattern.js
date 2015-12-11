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
