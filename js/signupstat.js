(function() {

    // Get our config info (credentials)
    //var config = require('./config.js');
    // Storing these here is insecure for a public app. Done just for testing purpose
    var config = {
        user: 'USER',
        password: 'PASSWORD',
        apiUrl: 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'
    };

    function buildBaseAuth(account, username, password) {
        var token = username + ':' + password;
        var hash = btoa(token);

        basicAuth = "Basic " + hash;
        console.log(basicAuth);

        return basicAuth;
    }

    // Called when web page first loads
    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        console.log(config.user);
        console.log(config.password);
        console.log(config.apiUrl);

        $("#submitButton").click(function() {
            tableau.connectionName = "Signup Stat"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });

    //------------- Tableau WDC code -------------//
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Init function for connector, called during every phase but
    // only called when running inside the simulator or tableau
    myConnector.init = function(initCallback) {
        tableau.authType = tableau.authTypeEnum.basic;
        initCallback();
    }

// Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "mag",
            alias: "magnitude",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "title",
            alias: "title",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "lat",
            alias: "latitude",
            columnRole: "dimension",
            // Do not aggregate values as measures in Tableau--makes it easier to add to a map
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "lon",
            alias: "longitude",
            columnRole: "dimension",
            // Do not aggregate values as measures in Tableau--makes it easier to add to a map
            dataType: tableau.dataTypeEnum.float
        }];

        var tableSchema = {
            id: "earthquakeFeed",
            alias: "Earthquakes with magnitude greater than 4.5 in the last seven days",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        $.getJSON(apiUrl, function(resp) {
            var feat = resp.features,
                tableData = [];

            // Iterate over the JSON object
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "id": feat[i].id,
                    "mag": feat[i].properties.mag,
                    "title": feat[i].properties.title,
                    "lon": feat[i].geometry.coordinates[0],
                    "lat": feat[i].geometry.coordinates[1]
                });
            }

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);
})();
