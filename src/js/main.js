let elementMediator;


function setup() {
    elementMediator = new ElementMediator();
    const camera = new FocusedCamera(
        new Orientation(new Vector3(0, 100, -100), new Vector3(-Math.PI / 4, 0, 0)),
        Math.PI / 4,
        200
    );
    const glOperator = new GLOperator();
    const renderer = new Renderer(glOperator, camera, new Color(0.8, 0.2, 0.2, 1));
    const inputHandler = new InputHandler();
    coordinator = new Coordinator(renderer, inputHandler, camera);
    coordinator.run();
    inputHandler.prepareHandling();

    const loadModel = prepareModelLoader(renderer, coordinator);
    elementMediator.objModelInput.addEventListener("change", prepareReader(loadModel), false);
}

function prepareReader(onloadFunction) {
    return (evt) => {
        var files = evt.target.files;
        var file = files[0];           
        var reader = new FileReader();
        reader.onload = function(event) {
            onloadFunction(event.target.result);            
        }
        reader.readAsText(file);
    };
}

function prepareModelLoader(renderer, coordinator) {
    return (modelText) => {
        const model = Model.fromOBJ(modelText);
        renderer.clearRenderables();
        renderer.addRenderable(model);
        coordinator.queueRerender();
    };
}
