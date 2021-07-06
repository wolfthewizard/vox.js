class Model {

    /*
        either:
        'num' - vertex number
        'num'/'num' - vertex number / texture number [unused]
        'num'/'num'/'num' - vertex number / texture number [unused] / normal number
        'num'//'num' - vertex number // normal number 

    */
    static faceSegmentRegex = /^\d+(\/\d+|\/\d*\/\d+)?$/i;

    // types
    static fsVreg = /^\d+$/i;
    static fsVTreg = /^\d+\/\d+$/i;
    static fsVTNreg = /^\d+\/d+\/d+$/i;
    static fsVNreg = /^\d+\/\/d+$/i;

    constructor(faces) {
        this.faces = faces;
    }

    get pointsArray() {
        if (!this.__pointsArray) {
            this.__pointsArray = [];
            for (const face of this.faces) {
                this.__pointsArray.push(...face.pointsArray);
            }
        }
        return this.__pointsArray;
    }

    get normalsArray() {
        if (!this.__normalsArray) {
            this.__normalsArray = [];
            for (const face of this.faces) {
                this.__normalsArray.push(...face.normalsArray);
            }
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
        const lines = objText.split("\n");
        const vertices = [undefined];       // indexing in obj files starts from 1
        const normals = [undefined];
        const faces = [];
        for (const line of lines) {
            const segments = line.split(" ");
            if (segments[0] === "v") {
                vertices.push(
                    new Vector3(
                        parseFloat(segments[1]), 
                        parseFloat(segments[2]), 
                        parseFloat(segments[3])
                    )
                );
            } else if (segments[0] === "vn") {
                normals.push(
                    new Vector3(
                        parseFloat(segments[1]), 
                        parseFloat(segments[2]), 
                        parseFloat(segments[3])
                    )
                );
            } else if (segments[0] === "f") {
                // it is assumed (as stated in .obj definition) that all face points match single regex
                if (!Model.faceSegmentRegex.test(segments[1])) {
                    console.error(`Line "${line}" is incorrect.`);
                    throw "Corrupted file";
                }

                if (Model.fsVreg.test(segments[1]) || Model.fsVTreg.test(segments[1])) {
                    // num OR num/num
                    const points = [];
                    for (let i = 1; i < segments.length; i++) {
                        points.push(vertices[parseFloat(segments[i].split("/")[0])]);
                    }
                    faces.push(new Face(points, Model.__createNormalsFromPoints(points)));
                } else {
                    // num/num/num OR num//num
                    const fPoints = [];
                    const fNormals = [];
                    for (let i = 1; i < segments.length; i++) {
                        const subsegments = segments[i].split("/")
                        fPoints.push(vertices[parseFloat(subsegments[0])]);
                        fNormals.push(normals[parseFloat(subsegments[2])]);
                    }
                    const newFace = new Face(fPoints, fNormals);
                    faces.push(newFace);
                }
            }
        }
        return new Model(faces);
    }

    static __createNormalsFromPoints(points) {
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
            triangle[4] - triangle[1].y, 
            triangle[5] - triangle[2].z
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
