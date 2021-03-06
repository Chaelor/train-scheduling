$("document").ready(function () {
    //display vars
    var modal = $(".modal");
    var modalText = $(".modal-text");

    //input capturers
    var trainName;
    var destination;
    var firstDepart;
    var freq;
    var keyArray = [];

    //database information
    var config = {
        apiKey: "AIzaSyAOwPk3EaiNkQGfu1zhS83ctnkHP5C5QXw",
        authDomain: "trainscheduler-9560b.firebaseapp.com",
        databaseURL: "https://trainscheduler-9560b.firebaseio.com",
        projectId: "trainscheduler-9560b",
        storageBucket: "",
        messagingSenderId: "86869382557"
    };

    //I should really, really come back and fix this all types of up lol.
    $("body").on("focus", "#form-train-name", function () {
        $(".label-train").removeClass("positioningReverse");
        $(".label-train").addClass("positioning");
    })
    $("body").on("focusout", "#form-train-name", function () {
        if (!$.trim($("#form-train-name").val())) {
            $(".label-train").addClass("positioningReverse");
            $(".label-train").removeClass("positioning");
        }
    })
    $("body").on("focus", "#form-destination", function () {
        $(".label-destination").removeClass("positioningReverse");
        $(".label-destination").addClass("positioning");
    })
    $("body").on("focusout", "#form-destination", function () {
        if (!$.trim($("#form-destination").val())) {
            $(".label-destination").addClass("positioningReverse");
            $(".label-destination").removeClass("positioning");
        }
    })
    $("body").on("focus", "#form-time", function () {
        $(".label-time").removeClass("positioningReverse");
        $(".label-time").addClass("positioning");
    })
    $("body").on("focusout", "#form-time", function () {
        if (!$.trim($("#form-time").val())) {
            $(".label-time").addClass("positioningReverse");
            $(".label-time").removeClass("positioning");
        }
    })
    $("body").on("focus", "#form-frequency", function () {
        $(".label-frequency").removeClass("positioningReverse");
        $(".label-frequency").addClass("positioning");
    })

    $("body").on("focusout", "#form-frequency", function () {
        if (!$.trim($("#form-frequency").val())) {
            $(".label-frequency").addClass("positioningReverse");
            $(".label-frequency").removeClass("positioning");
        }
    })

    //Initialize firebase
    firebase.initializeApp(config);

    //store the database into an array
    var database = firebase.database();
    var ref =  database.ref();



    //close the modal if the x is clicked on
    $("body").on("click", ".close", function () {
        modal.hide();
    });
    //close the modal if the anywhere but the modal is clicked on
    $("body").on("click", function (event) {
        modal.hide();
    })

    $("body").on("click", ".red-x", function() {
        console.log(this);
        var id = $(this).attr('id');
        database.ref.remove(id);
        //ref.child(key).remove();
    })

    $("body").on("click", "#submit", function () {
        //Capture the data from the text input areas    
        trainName = $("#form-train-name").val().trim();
        destination = $("#form-destination").val().trim();
        firstDepart = $("#form-time").val().trim();
        freq = $("#form-frequency").val().trim();

        // //Check to see if the firstDepart is more than 4
        // // if(firstDepart.toString().length != 4 ) {
        // //     modal.show();
        // //     modalText.text("Your initial depart number must be 4 numbers");
        // //     return false;
        // // }
        // // if(!(freq == false)){
        // //     modal.show();
        // //     modalText.text("The frequency must be a number");
        // // }

        // if (!(firstDepart == false)) {
        //     modal.show();
        //     modalText.text("Your Initial Departure must be a number!");
        // }
        // if (!(freq == false)) {
        //     modal.show();
        //     modalText.text("The Frequency must be a number!");
        // }

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
        //Remove positioning class
        $(".label-frequency").removeClass("positioning");
        $(".label-train").removeClass("positioning");
        $(".label-destination").removeClass("positioning");
        $(".label-time").removeClass("positioning");

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
        console.log(childSnapshot.key);
        keyArray.push(childSnapshot.key);
        console.log(keyArray);


        //Display the information into the table
        $(".table-data").prepend(   
            //Add a row then table data
            "<tr><td>" + "<div class='red-x' id='" + childSnapshot.key + "'>x</div>" + "</td>" +
            "<td>" + childSnapshot.val().trainName + "</td>" +
            "<td>" + childSnapshot.val().destination + "</td>" +
            "<td>" + childSnapshot.val().freq + "</td>" +
            "<td>" + timeTillTrain + " minutes" + "</td>" +
            "<td>" + arrivalTime + "</td></tr>"
        );
    });
})