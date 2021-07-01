class Color {

    constructor(r, g, b, a) {
        this.__r = r;
        this.__g = g;
        this.__b = b;
        this.__a = a;

        this.__array = [r, g, b, a];
    }

    set r(newR) {
        this.__r = newR;
        __resetArray();
    }

    set g(newG) {
        this.__g = newG;
        __resetArray();
    }

    set b(newB) {
        this.__b = newB;
        __resetArray();
    }

    set a(newA) {
        this.__a = newA;
        __resetArray();
    }

    get array() {
        return this.__array;
    }

    __resetArray() {
        this.__array = [this.__r, this.__g, this.__b, this.__a];
    }
}

class Vector3 {

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}