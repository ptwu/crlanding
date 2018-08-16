function toast(icon, color, message) {
    var toastDiv = document.getElementById("toast")

    document.getElementById("toast_img_icon").className = "fa fa-" + icon;
    document.getElementById("toast_desc").innerHTML = message;

    toastDiv.className = "toast-" + color + " show";
    
    setTimeout(
        function() 
        { 
            toastDiv.className = "";
        }, 
        5000
    );
}

function signOut() {

    toast("sign-out-alt", "gray", "Attempting to sign out...");

    setTimeout(
        function() { 
            firebase.auth().signOut().then(function() {      
                location.reload();
            }).catch(function(error) {
                toast("times", "red", "Failed to sign out");
            });
        },
        1000
    );
    
}