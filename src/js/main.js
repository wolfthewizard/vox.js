let elementMediator;


function setup() {
    elementMediator = new ElementMediator();
    document.getElementById("objModelInput").addEventListener("change", readFile, false);
}

function readFile(evt) {
    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function(event) {
        loadModel(event.target.result);            
    }
    reader.readAsText(file);
}

function loadModel(modelText) {
    const model = Model.fromOBJ(modelText);
    // console.log(model.pointsArray);
    // console.log(model.normalsArray);
    


    const glOperator = new GLOperator();
    glOperator.preRender(
        {
            position: new Vector3(0, 100, -100),
            rotation: new Vector3(-Math.PI / 4, 0, 0)
        }, 
        new Color(0.8, 0.2, 0.2, 1)
    );
    glOperator.setBuffer(glOperator.positionBuffer, model.pointsArray)
    glOperator.setBuffer(glOperator.normalsBuffer, model.normalsArray);
    glOperator.renderArray(model.pointsArray.length / 3);
}


function getNormalVector(triangle) {
    let first = [
        triangle[3] - triangle[0], 
        triangle[4] - triangle[1], 
        triangle[5] - triangle[2]
    ];
    let second = [
        triangle[6] - triangle[0], 
        triangle[7] - triangle[1], 
        triangle[8] - triangle[2]
    ];

    return [
        first[1] * second[2] - first[2] * second[1],
        first[2] * second[0] - first[0] * second[2],
        first[0] * second[1] - first[1] * second[0]
    ];
}