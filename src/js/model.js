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

    add(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    timesScalar(scalar) {
        return new Vector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }

    isZero() {
        return this.x == 0 && this.y == 0 && this.z == 0;
    }

    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }
}


class Face {

    constructor(points, normals) {
        this.__points = points;
        this.__normals = normals;
    }

    get pointsArray() {
        if (!this.__pointsArray) {
            this.__pointsArray = [];
            for (let i = 2; i < this.__points.length; i++) {
                this.__pointsArray.push(...[
                    this.__points[0].x, this.__points[0].y, this.__points[0].z,
                    this.__points[i-1].x, this.__points[i-1].y, this.__points[i-1].z,
                    this.__points[i].x, this.__points[i].y, this.__points[i].z
                ]);
            }
        }
        return this.__pointsArray;
    }

    get normalsArray() {
        if (!this.__normalsArray) {
            this.__normalsArray = [];
            for (let i = 2; i < this.__normals.length; i++) {
                this.__normalsArray.push(...[
                    this.__normals[0].x, this.__normals[0].y, this.__normals[0].z,
                    this.__normals[i-1].x, this.__normals[i-1].y, this.__normals[i-1].z,
                    this.__normals[i].x, this.__normals[i].y, this.__normals[i].z
                ]);
            }
        }
        return this.__normalsArray;
    }
}


class Orientation {

    constructor(position, rotation) {
        this.position = position;
        this.rotation = rotation;
    }

    add(other) {
        return new Orientation(
            this.position.add(other.position),
            this.rotation.add(other.rotation)
        );
    }

    timesScalar(scalar) {
        return new Orientation(
            this.position.timesScalar(scalar),
            this.rotation.timesScalar(scalar)
        );
    }

    isZero() {
        return this.position.isZero() && this.rotation.isZero();
    }
}


class Camera {
    
    constructor(orientation, fov) {
        this.orientation = orientation;
        this.fov = fov;
    }

    move(orientationChange) {
        this.orientation = this.orientation.add(orientationChange);
    }
}
