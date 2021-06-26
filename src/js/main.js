function setup() {
    document.getElementById("objModelInput").addEventListener("change", readFile, false)
}

function readFile(evt) {
    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function(event) {
        loadModel(event.target.result);            
    }
    reader.readAsText(file)
}

function loadModel(modelText) {
    console.log(modelText);
    console.log("henlo");
}