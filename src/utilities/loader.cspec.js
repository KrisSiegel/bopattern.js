var expect = chai.expect;
describe("./utilities/loader.js", function() {
    "use strict";

    it("instance.load(data) - loads a dataset into the graph as BoTiles", function(done) {
        var bopat = BoPattern("body");
        bopat.load([
            [5, 17, 34, 12, 5],
            [9, 85, 43, 64, 34],
            [5, 0, 0, 12, 43]
        ]);

        setTimeout(function() {
            bopat.debug = true;
            expect(bopat.internal.objects.background.length).to.equal(15);
            bopat.removeSelf();
            done();
        }, 25);
    });

    it("instance.load(data) - loads a single-dimension array and warns the user of such", function(done) {
        var bopat = BoPattern("body", { warnings: false });
        bopat.load([5, 17, 34, 12, 5]);

        setTimeout(function() {
            bopat.debug = true;
            expect(bopat.internal.objects.background.length).to.equal(5);
            bopat.removeSelf();
            done();
        }, 25);
    });
});
