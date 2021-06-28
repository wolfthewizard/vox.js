class ElementMediator {

    constructor() {
        this.__canvas = document.getElementById("canvas");
    }

    get canvas() {
        return this.__canvas;
    }
}
