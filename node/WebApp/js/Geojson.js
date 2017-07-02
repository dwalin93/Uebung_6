var logger = JL();
var consoleAppender = JL.createConsoleAppender('consoleAppender');
logger.setOptions({"appenders": [consoleAppender]});

// Init Geojson
var lineGeojsonFeature = null;

/**
 * @desc main function;
 *      reads txt input into a string (filecontent) and extracts the coordinates
 * @see Learnweb
 * @param event OpenFile event
 */
var ReadFile = function(event) {

    var input = event.target;
    var reader = new FileReader();
    const output = [];
    var array;

    // Empty List after new fileupload to avoid very long lists without refresh


    reader.onload = function () {

        var fileContent = reader.result;
        var fileContent = fileContent.split('\n'); // split into single lines

        for (i = 0; i < fileContent.length; i++) {
            String(array).replace(/ /g,"");
            array = fileContent[i].split(" ");

            for (j = 0; j < array.length; j++) {
                var coordinates = parseFloat(array[j]);
                if (!isNaN(coordinates)) {
                    output.push(coordinates);



                }
            }
        }

        if(output.length===0){
            JL("noCoordinatesInFile").fatal("No coordinates in file given. Please choose another one.");
            alert("The file does not include coordinates.");
        }

        //Call Geojson build function
         geoJson(output);




        // Changes the results paragraph in the HTML doc to display the calculated length
        // document.getElementById("results").innerHTML ="The length of the polyline is is: " + myPolyLine.sum + "km";
        //  lengthArray.length = 0; // resets the lengthArray to allow multiple computations without refresh

        JL("full_check").warn("works completely!"); //logs whether the whole script runs
    };


    reader.readAsText(input.files[0]);
};

/**
 * The function produces the Geojson from coordinates
 * @param coord_array array of coordinates
 * @returns {*} the Geojson Feature
 */
function geoJson(coord_array) {
    lineGeojsonFeature = '{ "type": "FeatureCollection", "features":[ ';
    for (i = 0; i < coord_array.length - 3; i += 4) {
        var tiles = '{"type": "Feature", ' +
            '"properties": {}, ' +
            '"geometry": { ' +
            '"type": "LineString", ' +
            '"coordinates": [ ['
            + coord_array[i+1] + ',' + coord_array[i] + '],' +
            ' [' + coord_array[i + 3] + ',' + coord_array[i + 2] + '] ] ' +
            '} ' +
            '},';

        lineGeojsonFeature += tiles;

        // Use Jquery to show the Lines when clicked on the Link
        $('#links').append("<li><a href=# data-zoom=20 line=" + (i / 4) + " position=" + coord_array[i] + "," + coord_array[i + 1] + ">Line number " + (i / 4 + 1) + ":  Please click on Link</a></li>");

    }
    lineGeojsonFeature = lineGeojsonFeature.substring(0, lineGeojsonFeature.length - 1);
    lineGeojsonFeature += ']}';


    // Creating the geojson object with the built string
    lineGeojsonFeature = JSON.parse(lineGeojsonFeature);



    JL().info("Built Geojson");

    if(lineGeojsonFeature === null) {
        alert("Please choose a file with valid WGS 84 coordinates");
        JL("wrong_file_check").fatalException("There are wrong coordinates in the uploaded file!");
    } else {
        L.geoJson(lineGeojsonFeature).addTo(myLayer);


    }
};

/**
 * Gets the url and retreives a geojson from it
 */
var getJson = function() {
    // get the url from the textfield
    var url = $('#urlTextfield').val();

    //get geoJson with ajax
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        timeout: 5000,
        success: function(content, textStatus ){
           var file = JSON.parse(JSON.stringify(content));
           L.geoJSON(file).addTo(map);
            JL('ajax').info("file was retrieved from " + url);
        },
        error: function(xhr, textStatus, errorThrown){
            JL('ajax').error("unable to get the file (" + errorThrown + ")");
        }
    });
};
