$("document").ready(function () {
    //display vars
    var trainDis = $(".train-display");
    var destDis = $(".destination-display");
    var freqDis = $(".frequency-display");
    var arrvDis = $(".arrival-display");
    var minsDis = $(".minsaway-display");

    //input capturers
    var trainName = "";
    var destination = "";
    var time = "";
    var freq = "";

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


    $("body").on("click", "#submit", function () {

        //Capture the data from the text input areas
        trainName = $("#form-train-name").val().trim();
        destination = $("#form-destination").val().trim();
        firstDepart = $("#form-time").val().trim();
        freq = $("#form-frequency").val().trim();

        //Give the database these key value pairs
        database.ref().push({
            trainName:trainName,
            destination:destination,
            firstDepart:firstDepart,
            freq:freq,
            dateAdded:firebase.database.ServerValue.TIMESTAMP
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
            "<tr><td>" + childSnapshot.val().trainName + "</td>" +
            "<td>" + childSnapshot.val().destination + "</td>" +
            "<td>" + childSnapshot.val().freq + "</td>" +
            "<td>" + timeTillTrain + " minutes" + "</td>" +
            "<td>" + arrivalTime + "</td></tr>"
        );
    });
})