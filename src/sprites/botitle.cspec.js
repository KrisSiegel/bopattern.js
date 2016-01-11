var expect = chai.expect;
describe("./sprites/botitle.js", function() {
    "use strict";

    it("BoTitle() - Expect that creating an instance of BoPattern adds BoTitle to the rendering stack", function() {
        var bopat = BoPattern("body");
        expect(bopat.internal).to.not.exist;
        bopat.debug = true;
        expect(bopat.internal).to.exist;
        expect(bopat.internal.objects.overlay).to.have.length.above(0);
        var hasBoTitle = false;
        for (var i = 0; i < bopat.internal.objects.overlay.length; ++i) {
            if (bopat.internal.objects.overlay[i].type === "botitle") {
                hasBoTitle = true;
                break;
            }
        }
        expect(hasBoTitle).to.be.true;
        bopat.removeSelf();
    });
});
