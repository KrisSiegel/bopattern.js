var expect = chai.expect;
describe("./sprites/bodebug.js", function() {
    "use strict";

    it("BoDebug() - Expect that setting debug mode adds BoDebug to the rendering stack", function() {
        var bopat = BoPattern("body");
        expect(bopat.internal).to.not.exist;
        bopat.debug = true;
        expect(bopat.internal).to.exist;
        expect(bopat.internal.objects.overlay).to.have.length.above(0);
        var hasBoDebug = false;
        for (var i = 0; i < bopat.internal.objects.overlay.length; ++i) {
            if (bopat.internal.objects.overlay[i].type === "bodebug") {
                hasBoDebug = true;
                break;
            }
        }
        expect(hasBoDebug).to.be.true;
        bopat.removeSelf();
    });
});
