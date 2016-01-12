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
