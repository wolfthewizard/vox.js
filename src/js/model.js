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

    constructor(position, rotation, elevation=0) {
        this.position = position;
        this.rotation = rotation;
        this.elevation = elevation;
    }

    add(other) {
        return new Orientation(
            this.position.add(other.position),
            this.rotation.add(other.rotation),
            this.elevation + other.elevation
        );
    }

    timesScalar(scalar) {
        return new Orientation(
            this.position.timesScalar(scalar),
            this.rotation.timesScalar(scalar),
            this.elevation * scalar
        );
    }

    isZero() {
        return this.position.isZero() && this.rotation.isZero() && this.elevation == 0;
    }

    toString() {
        return `pos=${this.position}, rot=${this.rotation}`;
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


class FocusedCamera {

    constructor(orientationInfo, fov, distance) {
        this.__orientationInfo = orientationInfo;
        this.fov = fov;
        this.distance = distance;
    }

    move(orientationChange) {
        const quadfull = Math.PI / 2;
        const full = 2 * Math.PI;
        this.distance += orientationChange.elevation;
        this.distance = this.distance < 0 ? 0 : this.distance;
        this.__orientationInfo = this.__orientationInfo.add(orientationChange);
        this.__orientationInfo.rotation.x = (
            this.__orientationInfo.rotation.x < -quadfull 
                ? -quadfull 
                : this.__orientationInfo.rotation.x > quadfull 
                    ? quadfull 
                    : this.__orientationInfo.rotation.x
        );
        this.__orientationInfo.rotation.y = (
            this.__orientationInfo.rotation.y < 0 
                ? this.__orientationInfo.rotation.y + full
                : this.__orientationInfo.rotation.y > full
                    ? this.__orientationInfo.rotation.y - full
                    : this.__orientationInfo.rotation.y
        );
    }

    get orientation() {
        const elevatedDist = this.distance * Math.cos(this.__orientationInfo.rotation.x);
        return new Orientation(
            this.__orientationInfo.position.add(new Vector3(
                -elevatedDist * Math.sin(this.__orientationInfo.rotation.y),
                this.distance * Math.sin(this.__orientationInfo.rotation.x),
                -elevatedDist * Math.cos(this.__orientationInfo.rotation.y)
            )),
            new Vector3(
                -this.__orientationInfo.rotation.x,
                -this.__orientationInfo.rotation.y,
                0
            )
        );
    }
}
