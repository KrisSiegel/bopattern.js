var expect = chai.expect;
describe("./main.js", function() {
    "use strict";

    it("BoPattern() - Verify that BoPattern exists", function() {
        expect(window.BoPattern).to.exist;
    });

    it("BoPattern(selector) - Finds or creates a canvas element based on a selector", function() {
        var bopat = BoPattern("body");
        expect(bopat).to.exist;
        bopat.debug = true;
        expect(bopat.internal.canvas).to.exist;
        bopat.debug = false;

        bopat.removeSelf();
    });

    it("BoPattern(invalid) - Throws an exception when bad input is supplied", function() {
        expect(BoPattern.bind(12)).to.throw;
        expect(BoPattern.bind(null)).to.throw;
        expect(BoPattern.bind(undefined)).to.throw;
        expect(BoPattern.bind(new Date())).to.throw;
    });
});
