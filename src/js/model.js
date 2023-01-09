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

    static fromHexString(hexStr) {
        return new Color(
            parseInt(hexStr.slice(1, 3), 16) / 255,
            parseInt(hexStr.slice(3, 5), 16) / 255,
            parseInt(hexStr.slice(5, 7), 16) / 255,
            1.0
        );
    }
    
    toString() {
        return `(${this.__r}, ${this.__g}, ${this.__b}, ${this.__a})`;
    }
}


class Vector3 {

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    add(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    addToSelf(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    }

    sub(other) {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    subFromSelf(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
    }

    cross(other) {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    normalize() {
        const l = this.length;
        if (l > 0) {
            return this.timesScalar(1 / l);
        } else {
            return new Vector3(Infinity, Infinity, Infinity);
        }
    }

    normalizeSelf() {
        const l = this.length;
        this.timesScalarSelf(1 / l);
    }

    timesScalar(scalar) {
        return new Vector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }

    timesScalarSelf(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    negative() {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    negativeSelf() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
    }

    isZero() {
        return this.x == 0 && this.y == 0 && this.z == 0;
    }

    equal(other) {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    }

    copy() {
        return new Vector3(this.x, this.y, this.z);
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
            this.preparePointsArray();
        }
        return this.__pointsArray;
    }

    get normalsArray() {
        if (!this.__normalsArray) {
            this.prepareNormalsArray();
        }
        return this.__normalsArray;
    }

    get bounds() {
        const minBound = this.__points[0].copy();
        const maxBound = this.__points[0].copy();
        for (let i = 1; i < this.__points.length; i++) {
            const p = this.__points[i];
            if (p.x < minBound.x) {
                minBound.x = p.x;
            } else if (p.x > maxBound.x) {
                maxBound.x = p.x;
            }

            if (p.y < minBound.y) {
                minBound.y = p.y;
            } else if (p.y > maxBound.y) {
                maxBound.y = p.y;
            }

            if (p.z < minBound.z) {
                minBound.z = p.z;
            } else if (p.z > maxBound.z) {
                maxBound.z = p.z;
            }
        }
        return new Bounds(minBound, maxBound);
    }

    preparePointsArray() {
        this.__pointsArray = [];
        for (let i = 2; i < this.__points.length; i++) {
            this.__pointsArray.push(...[
                this.__points[0].x, this.__points[0].y, this.__points[0].z,
                this.__points[i-1].x, this.__points[i-1].y, this.__points[i-1].z,
                this.__points[i].x, this.__points[i].y, this.__points[i].z
            ]);
        }
    }

    prepareNormalsArray() {
        this.__normalsArray = [];
        for (let i = 2; i < this.__normals.length; i++) {
            this.__normalsArray.push(...[
                this.__normals[0].x, this.__normals[0].y, this.__normals[0].z,
                this.__normals[i-1].x, this.__normals[i-1].y, this.__normals[i-1].z,
                this.__normals[i].x, this.__normals[i].y, this.__normals[i].z
            ]);
        }
    }
}


class Bounds {
    constructor(minBound, maxBound) {
        this.minBound = minBound;
        this.maxBound = maxBound;
    }

    get size() {
        return new Vector3(
            this.maxBound.x - this.minBound.x,
            this.maxBound.y - this.minBound.y,
            this.maxBound.z - this.minBound.z
        );
    }

    toString() {
        return `minB=${this.minBound}, maxB=${this.maxBound}`;
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
    
    copy() {
        return new Orientation(this.position.copy(), this.rotation.copy(), this.elevation);
    }

    toString() {
        return `pos=${this.position}, rot=${this.rotation}, el=${this.elevation}`;
    }
}


class InputAxes {

    constructor(tAxis1, dAxis1, dAxis2=new Vector3(0, 0, 0), sAxis1=0) {
        this.tAxis1 = tAxis1;
        this.dAxis1 = dAxis1;
        this.dAxis2 = dAxis2;
        this.sAxis1 = sAxis1;
    }

    add(other) {
        return new InputAxes(
            this.tAxis1.add(other.tAxis1),
            this.dAxis1.add(other.dAxis1),
            this.dAxis2.add(other.dAxis2),
            this.sAxis1 + other.sAxis1
        );
    }

    timesScalar(scalar) {
        return new InputAxes(
            this.tAxis1.timesScalar(scalar),
            this.dAxis1.timesScalar(scalar),
            this.dAxis2.timesScalar(scalar),
            this.sAxis1 * scalar
        );
    }

    isZero() {
        return this.tAxis1.isZero() && this.dAxis1.isZero() && this.dAxis2.isZero() && this.sAxis1 == 0;
    }
    
    copy() {
        return new InputAxes(this.tAxis1.copy(), this.dAxis1.copy(), this.dAxis2.copy(), this.sAxis1);
    }

    toString() {
        return `ta1=${this.tAxis1}, da1=${this.dAxis1}, da2=${this.dAxis2}, sa1=${this.sAxis1}`;
    }
}


class CameraMode {
    static FREE = 0;
    static FOCUSED = 1;
}


class Camera {
    
    constructor(orientationInfo, fov, mode) {
        this.__orientationInfo = orientationInfo;
        this.fov = fov;
        this.__mode = mode;
    }

    move(orientationChange) {
        const quadfull = Math.PI / 2;
        const full = 2 * Math.PI;
        if (this.__mode == CameraMode.FREE) {
            this.__orientationInfo.position = this.__orientationInfo.position.add(orientationChange.position);
            this.__orientationInfo.rotation = this.__orientationInfo.rotation.add(orientationChange.rotation);
        } else {
            this.__orientationInfo.position = this.__orientationInfo.position.add(orientationChange.position.negative());
            this.__orientationInfo.rotation = this.__orientationInfo.rotation.add(orientationChange.rotation);
            this.__orientationInfo.elevation += orientationChange.elevation;
            this.__orientationInfo.elevation = Math.max(0, this.__orientationInfo.elevation);
        }
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
        if (this.__mode == CameraMode.FREE) {
            return this.__orientationInfo;
        } else {
            const elevatedDist = this.__orientationInfo.elevation * Math.cos(this.__orientationInfo.rotation.x);
            return new Orientation(
                this.__orientationInfo.position.add(
                    new Vector3(
                        elevatedDist * Math.sin(this.__orientationInfo.rotation.y),
                        -this.__orientationInfo.elevation * Math.sin(this.__orientationInfo.rotation.x),
                        elevatedDist * Math.cos(this.__orientationInfo.rotation.y)
                    )
                ),
                new Vector3(
                    this.__orientationInfo.rotation.x,
                    this.__orientationInfo.rotation.y,
                    0
                )
            );
        }
    }

    get mode() {
        return this.__mode;
    }

    set mode(newMode) {
        if (newMode != this.__mode) {
            this.__mode = newMode;

            const elevatedDist = this.__orientationInfo.elevation * Math.cos(this.__orientationInfo.rotation.x);
            const positionDeltaVector = new Vector3(
                elevatedDist * Math.sin(this.__orientationInfo.rotation.y),
                -this.__orientationInfo.elevation * Math.sin(this.__orientationInfo.rotation.x),
                elevatedDist * Math.cos(this.__orientationInfo.rotation.y)
            );

            if (newMode == CameraMode.FREE) {
                // fixed -> free
                this.__orientationInfo.position = this.__orientationInfo.position.add(positionDeltaVector);
            } else {
                // free -> fixed
                this.__orientationInfo.position = this.__orientationInfo.position.add(positionDeltaVector.negative());
            }
        }
    }
}
