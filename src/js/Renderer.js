class Renderer {

    constructor(glOperator) {
        this.__glOperator = glOperator;

        this.__renderables = [];
        this.__rerenderQueued = true;

        this.__render = this.__render.bind(this);
    }

    signifyChange() {
        this.__rerenderQueued = true;
    }

    addRenderable(renderable) {
        this.__renderables.push(renderable);
    }

    removeRenderable(renderable) {
        this.__renderables.splice(this.__renderables.indexOf(renderable), 1);
    }

    requestRender() {
        if (this.__rerenderQueued) {
            this.__rerenderQueued = false;
            requestAnimationFrame(this.__render);
        }
    }

    __render() {
        // todo
        for (renderable of this.__renderables) {
            // todo
        }
    }
}
