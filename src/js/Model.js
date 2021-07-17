class Model {

    /*
        either:
        'num' - vertex number
        'num'/'num' - vertex number / texture number [unused]
        'num'/'num'/'num' - vertex number / texture number [unused] / normal number
        'num'//'num' - vertex number // normal number 

    */
    static faceSegmentRegex = /^-?\d+((\/-?\d+)|(\/-?\d*\/-?\d+))?$/i;

    // types
    static fsVreg = /^-?\d+$/i;
    static fsVTreg = /^-?\d+\/-?\d+$/i;
    static fsVTNreg = /^-?\d+\/-?\d+\/-?\d+$/i;
    static fsVNreg = /^-?\d+\/\/-?\d+$/i;

    constructor(faces, points, normals) {
        this.faces = faces;
        this.points = points;
        this.normals = normals;
        
        const bounds = this.bounds;
        this.size = bounds.size;
        this.center = bounds.minBound.add(this.size.timesScalar(0.5));
        this.biggestDimension = Math.max(this.size.x, this.size.y, this.size.z);
    }

    swapYZ() {
        for (const p of this.points) {
            const temp = p.y;
            p.y = p.z;
            p.z = temp;
        }
        for (const n of this.normals) {
            const temp = n.y;
            n.y = n.z;
            n.z = temp;
        }
        for (const f of this.faces) {
            f.preparePointsArray();
            f.prepareNormalsArray();
        }
        this.__preparePointsArray();
        this.__prepareNormalsArray();
        [this.bounds.minBound.y, this.bounds.minBound.z] = [this.bounds.minBound.z, this.bounds.minBound.y];
        [this.bounds.maxBound.y, this.bounds.maxBound.z] = [this.bounds.maxBound.z, this.bounds.maxBound.y];
        [this.size.y, this.size.z] = [this.size.z, this.size.y];
        [this.center.y, this.center.z] = [this.center.z, this.center.y];
    }

    get pointsArray() {
        if (!this.__pointsArray) {
            this.__preparePointsArray();
        }
        return this.__pointsArray;
    }

    get normalsArray() {
        if (!this.__normalsArray) {
            this.__prepareNormalsArray();
        }
        return this.__normalsArray;
    }

    get bounds() {
        const bounds = this.faces[0].bounds;
        for (let i = 1; i < this.faces.length; i++) {
            const viewedBounds = this.faces[i].bounds;
            if (viewedBounds.minBound.x < bounds.minBound.x) {
                bounds.minBound.x = viewedBounds.minBound.x;
            }
            if (viewedBounds.minBound.y < bounds.minBound.y) {
                bounds.minBound.y = viewedBounds.minBound.y;
            }
            if (viewedBounds.minBound.z < bounds.minBound.z) {
                bounds.minBound.z = viewedBounds.minBound.z;
            }
            if (viewedBounds.maxBound.x > bounds.maxBound.x) {
                bounds.maxBound.x = viewedBounds.maxBound.x;
            }
            if (viewedBounds.maxBound.y > bounds.maxBound.y) {
                bounds.maxBound.y = viewedBounds.maxBound.y;
            }
            if (viewedBounds.maxBound.z > bounds.maxBound.z) {
                bounds.maxBound.z = viewedBounds.maxBound.z;
            }
        }
        return bounds;
    }

    static fromOBJ(objText) {
        const editedObjText = objText.replaceAll("\r", "\n");
        const lines = editedObjText.split("\n");
        const points = [undefined];       // indexing in obj files starts from 1
        const normals = [undefined];
        const vertexNormals = [undefined];
        const faces = [];
        for (let line of lines) {
            line = line.trim();
            line = line.replaceAll(/\s+/g, " ");
            const segments = line.split(" ");
            if (segments[0] === "v") {
                const x = parseFloat(segments[1]);
                const y = parseFloat(segments[2]);
                const z = parseFloat(segments[3]);
                let insertedPoint = new Vector3(x, y, z);
                let insertedNormal = new Vector3(0, 0, 0);
                points.push(insertedPoint);
                vertexNormals.push(insertedNormal);
            } else if (segments[0] === "vn") {
                const x = parseFloat(segments[1]);
                const y = parseFloat(segments[2]);
                const z = parseFloat(segments[3]);
                normals.push(new Vector3(x, y, z));
            } else if (segments[0] === "f") {
                // it is assumed (as stated in .obj definition) that all face points match single regex
                if (!Model.faceSegmentRegex.test(segments[1])) {
                    console.error(`Line "${line}" is incorrect.`);
                    throw "Corrupted file";
                }

                if (Model.fsVreg.test(segments[1]) || Model.fsVTreg.test(segments[1])) {
                    // num OR num/num
                    const fPoints = [];
                    const indices = [];
                    for (let i = 1; i < segments.length; i++) {
                        const subsegments = segments[i].split("/");
                        let index = parseFloat(subsegments[0]);
                        index = index > 0 ? index : points.length + index;  // indices can be negative; if so, use abs(indice)'th element from the end
                        fPoints.push(points[index]);
                        indices.push(index);
                    }
                    const fFaceNormals = Model.__createFaceNormals(fPoints);
                    for (let i = 2; i < indices.length; i++) {
                        vertexNormals[indices[0]].addToSelf(fFaceNormals[i-2]);
                        vertexNormals[indices[i-1]].addToSelf(fFaceNormals[i-2]);
                        vertexNormals[indices[i]].addToSelf(fFaceNormals[i-2]);
                    }
                    const fNormals = indices.map(i => vertexNormals[i]);
                    faces.push(new Face(fPoints, fNormals));
                } else {
                    // num/num/num OR num//num
                    const fPoints = [];
                    const fNormals = [];
                    for (let i = 1; i < segments.length; i++) {
                        const subsegments = segments[i].split("/")
                        let pointIndex = parseFloat(subsegments[0]);
                        let normalIndex = parseFloat(subsegments[2]);
                        pointIndex = pointIndex > 0 ? pointIndex : points.length + pointIndex;
                        normalIndex = normalIndex > 0 ? normalIndex : normals.length + normalIndex;
                        fPoints.push(points[pointIndex]);
                        fNormals.push(normals[normalIndex]);
                    }
                    const newFace = new Face(fPoints, fNormals);
                    faces.push(newFace);
                }
            }
        }
        points.splice(0, 1);
        normals.splice(0, 1);
        vertexNormals.splice(0, 1);

        vertexNormals.forEach(vn => vn.normalizeSelf());

        // console.log("debug");
        // console.log(vertexNormals);

        return new Model(faces, points, normals);
    }

    __preparePointsArray() {
        this.__pointsArray = [];
        for (const face of this.faces) {
            this.__pointsArray.push(...face.pointsArray);
        }
    }

    __prepareNormalsArray() {
        this.__normalsArray = [];
        for (const face of this.faces) {
            this.__normalsArray.push(...face.normalsArray);
        }
    }

    static __createNormalsFromPoints(points) {
        const normals = [];
        for (let i = 2; i < points.length; i++) {
            const normal = Model.__getNormalVector([points[0], points[i-1], points[i]]);
            if (normals.length == 0) {
                normals.push(normal, normal, normal);
            } else {
                normals.push(normal);
            }
        }
        return normals;
    }

    static __createFaceNormals(points) {
        const normals = [];
        for (let i = 2; i < points.length; i++) {
            const normal = Model.__getNormalVector([points[0], points[i-1], points[i]]);
            normals.push(normal);
        }
        return normals;
    }

    static __getNormalVector(triangle) {
        let first = [
            triangle[1].x - triangle[0].x, 
            triangle[1].y - triangle[1].y, 
            triangle[1].z - triangle[2].z
        ];
        let second = [
            triangle[2].x - triangle[0].x, 
            triangle[2].y - triangle[1].y, 
            triangle[2].z - triangle[2].z
        ];

        return new Vector3(
            first[1] * second[2] - first[2] * second[1],
            first[2] * second[0] - first[0] * second[2],
            first[0] * second[1] - first[1] * second[0]
        );
    }
}
