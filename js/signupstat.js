(function() {

    // Get our config info (credentials)
    //var config = require('./config.js');
    // Storing these here is insecure for a public app. Done just for testing purpose
    var config = {
        user: 'USER',
        password: 'PASSWORD',
        apiUrl: 'API_URL'
    };

    function buildBaseAuth(username, password) {
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
            id: "clientId",
            alias: "clientId",
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
        // Create basicAuth token
        var basicAuth = buildBaseAuth(config.user, config.password);
        console.log("Basic auth token created.");

        var xhr = $.ajax({
            type: 'GET',
            url: config.apiUrl,
            dataType: 'json',
            headers: {'Authorization': basicAuth},
            success: function (resp, status, xhr) {
                if (resp.data) {
                    var feat = resp.features,
                        tableData = [];

                    // Iterate over the JSON object
                    for (var i = 0, len = feat.length; i < len; i++) {
                        tableData.push({
                            "clientId": feat[i].clientId,
                            "clientType": feat[i].properties.clientType,
                            "signupCountry": feat[i].properties.signupCountry,
                            "signupDate": feat[i].properties.signupDate,
                            "email": feat[i].properties.email
                        });
                    }

                    table.appendRows(tableData);
                    doneCallback();



                } else {
                    console.log("No results found.");
                    tableau.abortWithError("No results found.");
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Error while trying to connect to the data source.");
                tableau.log("Connection error: " + xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error while trying to connect to the data source.");
            }
        });
    };

    tableau.registerConnector(myConnector);
})();
