(function() {
    var generateRandomData = function(rows, columns) {
        var datas = [];
        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < columns; ++j) {
                if (datas[i] === undefined) {
                    datas[i] = [];
                }
                datas[i][j] = {
                    value: (Math.random() * (100 - 0) + 0)
                };
            }
        }

        return datas;
    };

    window.addEventListener("load", function(e) {

        window.bopat = BoPattern("#container");

        document.querySelector("button#randomBtn").addEventListener("click", function(e) {
            window.bopat.load(generateRandomData(12, 12), 15000);
        }, false);

        if (location.search.indexOf("autoload") !== -1) {
            window.bopat.load(generateRandomData(12, 12));
        }

    }, false);
}());
