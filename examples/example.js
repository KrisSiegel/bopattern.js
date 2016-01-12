(function() {
    var generateRandomData = function(rows, columns) {
        var datas = [];
        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < columns; ++j) {
                if (datas[i] === undefined) {
                    datas[i] = [];
                }
                datas[i][j] = {
                    value: Math.floor(Math.random() * (100 - 0) + 0)
                };
            }
        }

        return datas;
    };

    var loadData = function() {
        window.bopat.load(generateRandomData(6, 6), {
            labels: {
                title: "Random Data",
                xaxis: ["frogs", "chicken", "whatever", "4", "nine", "6"],
                yaxis: ["1", "2", "3", "4", "5", "6"]
            }
        });
    };

    window.addEventListener("load", function(e) {

        window.bopat = BoPattern("#container");

        document.querySelector("button#randomBtn").addEventListener("click", loadData, false);

        if (location.search.indexOf("autoload") !== -1) {
            loadData();
        }

    }, false);
}());
