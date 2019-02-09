/*

Sky Engineering Academy - Unattended Test
Content Recommendations Application

Developed by Cameron Barber (2019)

*/

/*
###############

MARK: The code for moving sliders and displaying films

###############
*/

var sliders = document.getElementsByClassName("slider");
var slidersParent = document.getElementsByClassName("slider-parent");

// Add event listener for each slider
for (i = 0; i < sliders.length; i++) {
    sliders.item(i).addEventListener("input", sliderMoved);
}


// Event listener will trigger this when a slider is moved. This determines which moods the user has selected
function sliderMoved() {
    // Check if any content has been uploaded yet.
    console.log("Triggered");
    if (contentUploaded) {
        // Clone object so can use to remove duplicates
        tempMoods = jQuery.extend(true, {}, moods);
        var moodsPicked = []
        for (i = 0; i < slidersParent.length; i++) {
            // Get the position of the slider
            var sliderVal = slidersParent.item(i).children[1].children[0].children[0].value;
            if (sliderVal == 3) {
                // Get the mood the slider is at
                moodsPicked.push(slidersParent.item(i).children[2].innerHTML);
            } else if (sliderVal == 1) {
                moodsPicked.push(slidersParent.item(i).children[0].innerHTML);
            }
        }
        // List will never equal 5 moods, this makes the list always 5 moods to display on the front-end (includes repeated moods).
        for (i = 0; i < 5; i++) { 
            if (moodsPicked.length < 5) {
                moodsPicked.push(moodsPicked[i]);
            } else {
                break;
            }
        }
        pickFilms(moodsPicked);
    } else {
        // If content has not been uploaded then reset sliders and display warning
        // This should never occur as the sliders should be disabled, but just incase of older browsers breaking anything
        window.alert("Please upload your content in the top right before you use the sliders.");
        for (i = 0; i < slidersParent.length; i++) {
            // Reset slider position
            slidersParent.item(i).children[1].children[0].children[0].value = 2;
        }
    }
}

// Pick random films based on moods
// INPUT: takes the 5 moods picked (as array) for each content tile
function pickFilms(moodsPicked) {
    for (i = 0; i < moodsPicked.length; i++) {
        var pickedMood = tempMoods[moodsPicked[i]];
        // Check if there isn't enough films or sliders are at 0, if so, display: No content
        if ((pickedMood == null) || (pickedMood.length == 0)) {
            filmToHTML(["No content", "img/no_content.png"], i + 1);
        } else {
            var randIdx = Math.floor(Math.random() * pickedMood.length);
            var film = pickedMood[randIdx];
            // Remove film from list so it can't be picked again
            pickedMood.splice(randIdx, 1);  
            filmToHTML(film, i + 1);
        }
    }  
}

// Write film to HTML
// INPUT: takes film (array with name [0] & image [1] location) AND which tile location (1-5)
function filmToHTML(film, loc) {
    var card = document.getElementById("card" + loc);
    card.children[1].children[0].innerHTML = film[0];
    card.children[0].src = film[1];
}


/*
###############

MARK: The code for choosing files

###############
*/
var fileChooser = document.getElementById("fileChooser");
var moods = {};
var tempMoods = {};
var contentUploaded;
contentUpload(false); // Initial on page load to set contentUploaded to false

// Performs actions based on whether content has been uploaded or not yet. 
// Such as disabling/enabling sliders
// INPUT: bool of whether content has been uploaded yet, true/false
function contentUpload(b) {
    contentUploaded = b;
    for (i = 0; i < slidersParent.length; i++) {
        // Disable/enable the slider based on bool's opposite
        slidersParent.item(i).children[1].children[0].children[0].disabled = !b;  
    }
    // Hidden/appear alert about uploading content based on bool
    document.getElementById("alert").hidden = b;
}

// Loop around each item in the XML and add it to an object
// INPUT: takes entire file contents (XML DOM)
function xmlToArray(xmlDom) {
    try {
        // Reset moods object to wipe the content history before adding more
        moods = {};
        var x = xmlDom.documentElement.children;
        for (i = 0; i < x.length ;i++) {
            var cName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            var cImage = x[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;
            var cMood = x[i].getElementsByTagName("mood")[0].childNodes[0].nodeValue;
            var cCombined = [cName, cImage];
            // If the mood is not an array (has no content yet), then make it one to push values to it
            if (!Array.isArray(moods[cMood])) {
                moods[cMood] = []
            }
            moods[cMood].push(cCombined);
        }
        contentUpload(true);
    } catch(err) {
        // Catch any errors such as bad XML or not including proper tag names
        window.alert("Looks like there is some errors with your XML, please fix them and try again.");
    }
}

// Convert the string of XML to an XML DOM
// INPUT: takes entire file contents (string)
function textToXml(text) {
    var parser = new DOMParser();
    var xmlDom = parser.parseFromString(text, "text/xml");
    xmlToArray(xmlDom);
}


// Wait for text to load from file
// INPUT: takes the File Reader
function waitForText(reader) {
    reader.onloadend = function(event) {
        var text = event.target.result;
        textToXml(text);
    }
}

// When file is selected, find which it is
function fileSelection() {
    var file = fileChooser.files[0];
    var reader = new FileReader();
    if (file != null) {
        waitForText(reader);
        reader.readAsText(file);
    }
}

// Listening for the file to be selected, then trigger fileSelection function
fileChooser.addEventListener("change", fileSelection, false);