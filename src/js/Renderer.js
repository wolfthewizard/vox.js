class Renderer {

    constructor(glOperator, camera, color) {
        this.__glOperator = glOperator;
        this.__camera = camera;
        this.__color = color;

        this.__renderables = [];

        this.__render = this.__render.bind(this);
    }

    addRenderable(renderable) {
        this.__renderables.push(renderable);
    }

    removeRenderable(renderable) {
        this.__renderables.splice(this.__renderables.indexOf(renderable), 1);
    }

    clearRenderables() {
        this.__renderables = [];
    }

    requestRender() {
        requestAnimationFrame(this.__render);
    }

    setCenter(center) {
        this.__camera.__orientationInfo.position = center;
    }

    setDistance(distance) {
        this.__camera.__orientationInfo.elevation = distance;
    }

    setColor(color) {
        this.__color = color;
    }

    __render() {
        this.__glOperator.preRender(this.__camera, this.__color);
        for (const renderable of this.__renderables) {
            this.__glOperator.setBuffer(this.__glOperator.positionBuffer, renderable.pointsArray);
            this.__glOperator.setBuffer(this.__glOperator.normalsBuffer, renderable.normalsArray);
            this.__glOperator.renderArray(renderable.pointsArray.length / 3);
        }
    }
}
