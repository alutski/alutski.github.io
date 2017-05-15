(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "clientId",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "clientType",
            alias: "magnitude",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "signupCountry",
            alias: "signupCountry",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "signupDate",
            alias: "signupDate",
            dataType: tableau.dataTypeEnum.date
        }, {
            id: "email",
            alias: "email",
            dataType: tableau.dataTypeEnum.string
        }];

        var tableSchema = {
            id: "signupStat",
            alias: "signup Stat",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        $.getJSON("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", function(resp) {
            var feat = resp.features,
                tableData = [];

            // Iterate over the JSON object
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "clientId": feat[i].clientId,
                    "clientType": feat[i].properties.clientType,
                    "signupCountry": feat[i].properties.,
                    "signupDate": feat[i].properties.signupDate,
                    "email": feat[i].properties.email
                });
            }

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "Signup Stat"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();
