var expect = chai.expect;
describe("./sprites/boempty.js", function() {
    "use strict";

    it("BoEmpty() - Expect that loading no data adds BoEmpty to the rendering stack", function() {
        var bopat = BoPattern("body");
        expect(bopat.internal).to.not.exist;
        bopat.debug = true;
        expect(bopat.internal).to.exist;
        expect(bopat.internal.objects.overlay).to.have.length.above(0);
        var hasBoEmpty = false;
        for (var i = 0; i < bopat.internal.objects.overlay.length; ++i) {
            if (bopat.internal.objects.overlay[i].type === "boempty") {
                hasBoEmpty = true;
                break;
            }
        }
        expect(hasBoEmpty).to.be.true;
        bopat.removeSelf();
    });
});
