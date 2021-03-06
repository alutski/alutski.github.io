(function() {

    // Get our config info (credentials)
    // var config = require('./config.json');
	var config = {
		apiUrl : 'https://web.dev.pritle.com/backend/pritle-wdc/api/V1/data/signup' 
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
			tableau.username = $('#username').val().trim(); 
			tableau.password = $('#password').val().trim()
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
            id: "clientID",
            alias: "clientID",
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
            columns: cols,
			incrementColumnId: "clientID"
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        // Create basicAuth token
        var basicAuth = buildBaseAuth(tableau.username, tableau.password);
        console.log("Basic auth token created.");
		var url = config.apiUrl;
		if (table.incrementValue) {
			url = url + "?latestKnownClientId=" + table.incrementValue;
		}

        var xhr = $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            headers: {'Authorization': basicAuth},
            success: function (resp, status, xhr) {
                if (resp) {
                    var tableData = [];

                    // Iterate over the JSON object
                    for (var i = 0, len = resp.length; i < len; i++) {
                        tableData.push({
                            "clientID": resp[i].clientID,
                            "signupDate": resp[i].signupDate,
                            "email": resp[i].email
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
