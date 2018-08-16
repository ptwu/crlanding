//TODO: REPLACE DOCUMENT.GETELEMENTBYID AND ELEMENT 
//MANIPULATION STUFF WITH JQUERY

var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
 });

var firebaseUser = null;
var activePage = "";
var loadedClasses = false;

function checkInvalidAccount() {
    var user = firebase.auth().currentUser;

    if(!user.email.endsWith("@wwprsd.org")) {
        
        console.log('email: ' + user.email);
                
        toast("times", "red", "You must sign in with your school (wwprsd.org) Google account.");
        firebaseUser = null;

        firebase.auth().signOut().then(function() {
            console.log("Signed out of non-wwprsd.org account successfully");
        }).catch(function(error) {
            console.log("Failed to sign out of non-wwprsd.org account -> " + error);
        });

        setTimeout(
            function() {    
                location.reload();
            },
            2000
        );

        return true;
    }
    return false;
}



function googleSignIn() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        firebaseUser = result.user;
        
        if(checkInvalidAccount()) {
            return;
        }

        console.log(firebaseUser.email);
        toast("check", "green", "Success! Logged in as " + firebaseUser.email);
        
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}    

//Initialization: Showing login button (or not)
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("Already signed in as " + user.email + "... removing sign in div");
        var signInDiv = document.getElementById("google_signindiv");
        signInDiv.parentNode.removeChild(signInDiv);

      

        if(checkInvalidAccount()) {
            return;
        }

        toast("check", "green", "Signed in as " + user.email);

        setTimeout(
            function() {
                window.location.href="view.html";
            },
            1000
        )
        
    } else {
        console.log("Not signed in yet. Allowing sign in div to show");
    }
});