

function loadClasses() {
    var user = firebase.auth().currentUser;

    firebase.database().ref('/userProfile/' + user.uid).once('value').then(function(snapshot) {
        
        if(snapshot !== null) {
            var snapshotVal = snapshot.val();
    
            document.getElementById('select_school').value = snapshotVal.schoolName;
            document.getElementById('select_school').disabled = true;

            document.getElementById('clearformbutton').className = "pure-button pure-button-active button_clear";
        
            var periods = snapshotVal.classes;
        
            for(var i = 0; i < 8; i++) {
                var period = periods[i];
                
                if(period != null)
                {
                    document.getElementById('pd' + period.pd + '_firstname').value = period.fn;
                    document.getElementById('pd' + period.pd + '_lastname').value = period.ln;
    
                    document.getElementById('pd' + period.pd + '_firstname').disabled = true;
                    document.getElementById('pd' + period.pd + '_lastname').disabled = true;
    
                    document.getElementById('pd' + period.pd + '_changebutton').className = "pure-button pure-button-active button_delete";
                }
                
            }

            document.getElementById('editclassheader').innerHTML += "<br/>Warning: Changing your school will clear your saved schedule";
    
            toast("check", "green", "Loaded class data from database");

        }
            
    });
}

function toNameFormat(str) {
    str = str.trim();
    str = str.toLowerCase();
    str = str.replace(/[^a-zA-Z]+/g, "");
    
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function saveChanges() {
    var teachers = [];
    var school = document.getElementById('select_school').value;

    var user = firebase.auth().currentUser;

    var schoolDataUpdates = {};

    for(var i = 1; i <= 8; i++) {
        var firstNameBox = document.getElementById('pd' + i + '_firstname');
        var lastNameBox = document.getElementById('pd' + i + '_lastname');

        var firstName = toNameFormat(firstNameBox.value);
        var lastName = toNameFormat(lastNameBox.value);

        //replace non-alphabetic characters entered in the box so they can see
        firstNameBox.value = firstName;
        lastNameBox.value = lastName;

        teachers.push({pd: i, fn: firstName, ln: lastName});   

        var teacherRefStr = 'schoolData/' + school + '/teachers/' + firstName + '_' + lastName + '/pd' + i + '/';
        
        var newClassmateData = {
            x: "x"
        };

        schoolDataUpdates[teacherRefStr + user.uid] = newClassmateData;

    }

    firebase.database().ref().update(schoolDataUpdates);

    console.log(teachers);
    
    firebase.database().ref('userProfile/' + user.uid).set(
        {
            schoolName: school,
            classes: teachers
        },
        function(error) {
            if (error) {
              toast("times", "red", "Couldn't write to database: " + error);
            } else {
              toast("check", "green", "Updated successfully");
            }
        }
    );

    

    setTimeout(
        function() {
            location.reload();
        }, 
        1000
    );
    
}

function clearForm() {

    console.log("did it even work");

    var user = firebase.auth().currentUser;

    var userProfileRef = firebase.database().ref('userProfile/' + user.uid);
    userProfileRef.remove().then(function() {
        console.log("Removed userProfile data")
    })
    .catch(function(error) {
        toast("times", "red", "Couldn't delete data. Try refreshing. " + error.message);
        return;
    });

    document.getElementById('select_school').disabled = false;

    document.getElementById('clearformbutton').disabled = true;

    for(var i = 1; i <= 8; i++) {

        document.getElementById('pd' + i + '_firstname').disabled = false;
        document.getElementById('pd' + i + '_lastname').disabled = false;

        document.getElementById('pd' + i + '_firstname').value = "";
        document.getElementById('pd' + i + '_lastname').value = "";

        document.getElementById('pd' + i + '_changebutton').disabled = true;
    }
}

function changeTeacher(num) {

    var previousTeacher = document.getElementById('pd' + num + '_firstname').value + "_" + document.getElementById('pd' + num + '_lastname').value;

    var user = firebase.auth().currentUser;
    var school = document.getElementById('select_school').value;

    //Remove the user from the class
    var userInClassRef = firebase.database().ref('school_data/' + school + '/teachers/' + previousTeacher + '/pd' + num + '/' + user.uid);
    userInClassRef.remove().then(function() {
        console.log("Removed user from class")
    })
    .catch(function(error) {
        toast("times", "red", "Couldn't remove you from the class. " + error.message);
        return;
    });

    //Remove the class data from the user profile
    var classInUserProfileRef = firebase.database().ref('userProfile/' + user.uid + '/classes/' + (num-1));
    classInUserProfileRef.remove().then(function() {
        console.log("Removed class from userProfile")
    })
    .catch(function(error) {
        toast("times", "red", "Couldn't remove the class from your profile. " + error.message);
        return;
    });

    document.getElementById('pd' + num + '_firstname').disabled = false;
    document.getElementById('pd' + num + '_lastname').disabled = false;

    document.getElementById('pd' + num + '_firstname').value = "";
    document.getElementById('pd' + num + '_lastname').value = "";
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        loadClasses();
    } else {
        alert("You aren't signed in. Please go back to the home page and don't try to access this URL directly");
    }
});