var expect = chai.expect;
describe("./sprites/botile.js", function() {
    "use strict";

    it("BoTile() - Expect that loading data generates the correct amount of BoTiles in the render stack", function(done) {
        var bopat = BoPattern("body");
        bopat.debug = true;
        expect(bopat.internal.objects.background).to.have.length(0);
        bopat.load([
            [0, 10, 15],
            [45, 23, 42],
            [45, 56, 67]
        ]);
        setTimeout(function() {
            // Make sure it created the correct amount of BoTiles
            expect(bopat.internal.objects.background).to.have.length(9);

            bopat.load([]);

            setTimeout(function() {
                // Make sure all BoTiles eliminated themselves as expected
                expect(bopat.internal.objects.background).to.have.length(9);

                bopat.removeSelf();
                done();
            }, 25);
        }, 25);
    });
});
