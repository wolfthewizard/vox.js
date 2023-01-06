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
        const points = [undefined];       // indexing in obj files starts from 1, so one redundant element is added at the beginning
        const normals = [undefined];
        const vertexNormals = [undefined];
        const faces = [];
        let normalsProvided = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const collapsedLine = trimmedLine.replaceAll(/\s+/g, " ");
            const args = collapsedLine.split(" ");
            const commandType = args[0];
            if (commandType === "v") {
                // adding new vertex (point)
                const x = parseFloat(args[1]);
                const y = parseFloat(args[2]);
                const z = parseFloat(args[3]);
                const insertedPoint = new Vector3(x, y, z);
                const vertexNormal = new Vector3(0, 0, 0);
                points.push(insertedPoint);
                vertexNormals.push(vertexNormal);
            } else if (commandType === "vn") {
                // adding new normal
                const x = parseFloat(args[1]);
                const y = parseFloat(args[2]);
                const z = parseFloat(args[3]);
                const insertedNormal = new Vector3(x, y, z);
                normals.push(insertedNormal);
            } else if (commandType === "f") {
                // defining new face, according to one of regexes above (with/without normals and with/without textures)

                // it is assumed (as stated in .obj definition) that all face points match single regex
                if (!Model.faceSegmentRegex.test(args[1])) {
                    console.error(`Line "${line}" is incorrect.`);
                    throw "Corrupted file";
                }

                if (Model.fsVreg.test(args[1]) || Model.fsVTreg.test(args[1])) {
                    // num OR num/num
                    // normals not defined and should be calculated
                    normalsProvided = false;
                    const facePoints = [];
                    const indices = [];
                    for (let i = 1; i < args.length; i++) {
                        const subargs = args[i].split("/");
                        const definedIndex = parseFloat(subargs[0]);
                        const index = definedIndex > 0 ? definedIndex : points.length + definedIndex;  // indices can be negative; if so, use abs(indice)'th element from the end
                        facePoints.push(points[index]);
                        indices.push(index);
                    }
                    const calculatedFaceNormals = Model.__createFaceNormals(facePoints);
                    for (let i = 2; i < indices.length; i++) {
                        // indices of first and last two vertices forming a face (3 of n points forming triangle fan)
                        const firstIndex = indices[0];
                        const penultimateIndex = indices[i-1];
                        const lastIndex = indices[i];
                        const matchingFaceNormal = calculatedFaceNormals[i-2];    // normal for triangle of the face created by those points
                        vertexNormals[firstIndex].addToSelf(matchingFaceNormal);
                        vertexNormals[penultimateIndex].addToSelf(matchingFaceNormal);
                        vertexNormals[lastIndex].addToSelf(matchingFaceNormal);
                    }
                    const faceNormals = indices.map(index => vertexNormals[index]);                                                             // phong shading
                    // const faceNormals = facePoints.map((_, i) => i > 2 ? calculatedFaceNormals[i-2] : calculatedFaceNormals[0]);     // flat shading
                    const newFace = new Face(facePoints, faceNormals);
                    faces.push(newFace);
                } else {
                    // num/num/num OR num//num
                    // normals defined
                    normalsProvided = true;
                    const facePoints = [];
                    const faceNormals = [];
                    for (let i = 1; i < args.length; i++) {
                        const subargs = args[i].split("/")
                        const definedPointIndex = parseFloat(subargs[0]);
                        const definedNormalIndex = parseFloat(subargs[2]);
                        const pointIndex = definedPointIndex > 0 ? definedPointIndex : points.length + definedPointIndex;
                        const normalIndex = definedNormalIndex > 0 ? definedNormalIndex : normals.length + definedNormalIndex;
                        facePoints.push(points[pointIndex]);
                        faceNormals.push(normals[normalIndex]);
                    }
                    const newFace = new Face(facePoints, faceNormals);
                    faces.push(newFace);
                }
            }
        }

        // removing unnecessary first entry after being done with working with .obj indexing scheme
        points.splice(0, 1);
        normals.splice(0, 1);
        vertexNormals.splice(0, 1);

        // normals should be normalized so thanks to shallow copying we can now normalize all of vectors passed as normals
        vertexNormals.forEach(vn => vn.normalizeSelf());

        // console.log("debug");
        // console.log(normalsProvided ? normals : vertexNormals);

        return new Model(faces, points, normalsProvided ? normals : vertexNormals);
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
        const first = triangle[1].sub(triangle[0]);
        const second = triangle[2].sub(triangle[1]);
        return first.cross(second).normalize();
    }
}
