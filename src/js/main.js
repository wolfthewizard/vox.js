let elementMediator;


function setup() {
    elementMediator = new ElementMediator();
    const camera = new Camera(
        new Orientation(new Vector3(0, 100, -100), new Vector3(0, 0, 0), 200),
        Math.PI / 4,
        CameraMode.FOCUSED
    );
    const glOperator = new GLOperator();
    const renderer = new Renderer(glOperator, camera, new Color(0.8, 0.2, 0.2, 1));
    const inputHandler = new InputHandler();
    coordinator = new Coordinator(renderer, inputHandler, camera);
    coordinator.run();
    inputHandler.prepareHandling();

    const loadModel = prepareModelLoader(renderer, coordinator);
    elementMediator.objModelInput.addEventListener("change", prepareReader(loadModel), false);

    elementMediator.modeSelect.onchange = (evt) => {
        camera.mode = evt.target.value == "free" ? CameraMode.FREE : CameraMode.FOCUSED;
        coordinator.queueRerender();
    };
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

        renderer.setCenter(model.center.copy());
        renderer.setDistance(model.biggestDimension * 1.5);
        renderer.clearRenderables();
        renderer.addRenderable(model);
        coordinator.translateMultiplier = Coordinator.translateMultiplier * model.biggestDimension;
        coordinator.queueRerender();

        elementMediator.swapYZButton.onclick = () => {
            model.swapYZ();
            coordinator.queueRerender();
        };

        elementMediator.resetPositionButton.onclick = () => {
            renderer.__camera.__orientationInfo.position = model.center.copy();
            renderer.__camera.__orientationInfo.rotation = new Vector3(0, 0, 0);
            coordinator.queueRerender();
        };
    };
}
