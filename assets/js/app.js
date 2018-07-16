$("document").ready(function () {
    //display vars
    var modal = $(".modal");
    var modalText = $(".modal-text");

    //input capturers
    var trainName = "";
    var destination = "";

    //database information
    var config = {
        apiKey: "AIzaSyAOwPk3EaiNkQGfu1zhS83ctnkHP5C5QXw",
        authDomain: "trainscheduler-9560b.firebaseapp.com",
        databaseURL: "https://trainscheduler-9560b.firebaseio.com",
        projectId: "trainscheduler-9560b",
        storageBucket: "",
        messagingSenderId: "86869382557"
    };

    //Initialize firebase
    firebase.initializeApp(config);

    //store the database into an array
    var database = firebase.database();

    //close the modal if the x is clicked on
    $("body").on("click", ".close", function () {
        modal.hide();
    });
    //close the modal if the anywhere but the modal is clicked on
    $("body").on("click", function (event) {
        modal.hide();
    })

    $("body").on("click", "#submit", function () {

        //Capture the data from the text input areas    
        trainName = $("#form-train-name").val().trim();
        destination = $("#form-destination").val().trim();
        var firstDepart = parseInt($("#form-time").val().trim());
        console.log(firstDepart.toString().length);
        var freq = parseInt($("#form-frequency").val().trim());
        
        if(firstDepart.toString().length > 4 ) {
            modal.show();
            modalText.text("Your initial depart number must be less than 5 numbers");
            return false;
        }
        // if(!(freq == false)){
        //     modal.show();
        //     modalText.text("The frequency must be a number");
        // }

        if(!(firstDepart == false) || !(freq == false)){
            modal.show();
            modalText.text("Your numbers must be numbers!");
        }

        //Was an area left blank?
        if (trainName === "") {
            //Show the modal
            modal.show();
            //Fill in relevant text
            modalText.text("Train Name was left blank");
            //Return false to break and not continue
            return false;
        } else if (destination === "") {
            modal.show();
            modalText.text("Destination was left blank");
            return false;
        } else if (firstDepart === "") {
            modal.show();
            modalText.text("Initial Departure Time was left blank");
            return false;
        } else if (freq === "") {
            modal.show();
            modalText.text("Train frequency was left blank");
            return false;
        }



        //Give the database these key value pairs
        database.ref().push({
            trainName: trainName,
            destination: destination,
            firstDepart: firstDepart,
            freq: freq,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        //Clear the text input areas
        $("#form-train-name").val("");
        $("#form-destination").val("");
        $("#form-time").val("");
        $("#form-frequency").val("");

    });

    //Getting data from the database
    database.ref().on("child_added", function (childSnapshot) {

        //Snapshot of the frequency from the database
        var trainFreq = childSnapshot.val().freq;

        //Setting the first departing time into hours:minutes (military-time);
        var trainTime = moment(childSnapshot.val().firstDepart, "HH:mm").subtract(1, "years");

        //Difference in time from this moment till the first departing train time
        var timeDiff = moment().diff(moment(trainTime), "minutes");

        //Getting the time apart. Difference in time / how often train comes
        var timeApart = timeDiff % trainFreq;

        //This is getting the minutes until the next train
        var timeTillTrain = trainFreq - timeApart;

        //This is giving the hour and minute of the next train arrival
        var placeholderTime = moment().add(timeTillTrain, "minutes");
        var arrivalTime = moment(placeholderTime).format("hh:mm");

        //Display the information into the table
        $(".table-data").prepend(
            //Add a row then table data
            "<tr><td>" + childSnapshot.val().trainName + "</td>" +
            "<td>" + childSnapshot.val().destination + "</td>" +
            "<td>" + childSnapshot.val().freq + "</td>" +
            "<td>" + timeTillTrain + " minutes" + "</td>" +
            "<td>" + arrivalTime + "</td></tr>"
        );
    });
})