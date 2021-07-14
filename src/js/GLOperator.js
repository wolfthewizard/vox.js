const vertexShaderCode = `
    attribute vec4 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uMatrix;
    uniform mat4 uPerspective;

    varying float vFogDepth;
    varying vec3 vNormal;
    // varying vec4 vDebugColor;

    void main() {
        gl_Position = uPerspective * uMatrix * aPosition;
        gl_PointSize = 4.0;

        vFogDepth = -(uMatrix * aPosition).z;
        vNormal = aNormal;
        // vDebugColor = vec4(max(0.2, 0.8 - abs(aPosition.z)), max(0.2, 0.8 - abs(aPosition.x)), max(0.2, 0.8 - abs(aPosition.y)), 1);
        // vDebugColor = vec4(max(0.2, min(0.8, aPosition.z)), 0.2, 0.2, 1);
    }
`;

const fragmentShaderCode = `
    precision mediump float;

    uniform vec3 uReverseLightDirection;
    uniform float uAmbient;
    uniform vec4 uColor;

    varying float vFogDepth;
    varying vec3 vNormal;
    // varying vec4 vDebugColor;

    void main() {
        float fogAmount = smoothstep(1000.0, 5000.0, vFogDepth);
        vec3 normal = normalize(vNormal);

        float light = dot(normal, uReverseLightDirection);

        gl_FragColor = uColor;
        // gl_FragColor = vDebugColor;
        gl_FragColor.rgb *= max(min(light + uAmbient, 1.5), uAmbient);
        gl_FragColor = mix(gl_FragColor, vec4(0, 0, 0, 1), fogAmount);
    }
`;

class GLOperator {

    constructor() {
        this.initialized = false;

        // obtaining webgl context
		const canvas = elementMediator.canvas;
		this.gl = canvas.getContext("webgl");

        if (!this.gl) {
			console.error("error initializing webgl");
			return;
		}

		// canvas setup
        this.gl.canvas.width = this.gl.canvas.clientWidth;
        this.gl.canvas.height = this.gl.canvas.clientHeight;
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

		// filling the background
		this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// enabling depth
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);

		// creating shaders
		const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

		// setting code for them
		this.gl.shaderSource(vertexShader, vertexShaderCode);
		this.gl.shaderSource(fragmentShader, fragmentShaderCode);

		// compiling both
		this.gl.compileShader(vertexShader);
		if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
			console.error("failed to compile vertex shader", this.gl.getShaderInfoLog(vertexShader));
			return;
		}

		this.gl.compileShader(fragmentShader);
		if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
			console.error("failed to compile fragment shader", this.gl.getShaderInfoLog(fragmentShader));
			return;
		}

		// creating main gl program
		this.program = this.gl.createProgram();
		this.gl.attachShader(this.program, vertexShader);
		this.gl.attachShader(this.program, fragmentShader);
		this.gl.linkProgram(this.program);

		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.error("failed to link program", this.gl.getProgramInfoLog(this.program));
			return;
		}

		// additional validation
		this.gl.validateProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
			console.error("validation for program failed", this.gl.getProgramInfoLog(this.program));
			return;
		}

        this.gl.useProgram(this.program);

        // saving locations
        this.uniforms = {
            uMatrix:                this.gl.getUniformLocation(this.program, 'uMatrix'),
            uPerspective:           this.gl.getUniformLocation(this.program, 'uPerspective'),
            uAmbient:               this.gl.getUniformLocation(this.program, 'uAmbient'),
            uReverseLightDirection: this.gl.getUniformLocation(this.program, 'uReverseLightDirection'),
            uColor:                 this.gl.getUniformLocation(this.program, 'uColor')
        };
        this.attribs = {
            aPosition:              this.gl.getAttribLocation(this.program, 'aPosition'),
            aNormal:                this.gl.getAttribLocation(this.program, 'aNormal')
        };

        // creating buffers
        this.positionBuffer =  this.gl.createBuffer();
        this.normalsBuffer =   this.gl.createBuffer();

		// defining data handling
        this.gl.enableVertexAttribArray(this.attribs.aPosition);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        this.gl.vertexAttribPointer(
            this.attribs.aPosition,         // location of the attribute
            3,                              // attribute's amount of elements
            this.gl.FLOAT,                  // the type of elements
            this.gl.FALSE,                  // normalization
            0,                              // vertex size
            0                               // offset
        );

        this.gl.enableVertexAttribArray(this.attribs.aNormal);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);

        this.gl.vertexAttribPointer(
            this.attribs.aNormal,           // location of the attribute
            3,                              // attribute's amount of elements
            this.gl.FLOAT,                  // the type of elements
            this.gl.FALSE,                  // normalization
            0,                              // vertex size
            0                               // offset
        );

        this.initialized = true;
    }

    preRender(camera, color) {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.clearColor(0, 0, 0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

        const perspective = matrix4.perspective(camera.fov, aspect, 0.01, 500);

        let matrix = matrix4.identity();
        matrix = matrix4.xRotation(-camera.orientation.rotation.x);
        matrix = matrix4.yRotate(matrix, -camera.orientation.rotation.y);
        matrix = matrix4.translate(
            matrix,
            -camera.orientation.position.x,
            -camera.orientation.position.y,
            -camera.orientation.position.z,
        );

        this.gl.uniformMatrix4fv(this.uniforms.uPerspective, false, perspective);
        this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);

        this.gl.uniform1f(this.uniforms.uAmbient, 0.5);
        this.gl.uniform4fv(this.uniforms.uColor, color.array);
        this.gl.uniform3fv(this.uniforms.uReverseLightDirection, matrix4.normalize([0.5, 0.5, 0.5]));
    }

    setBuffer(buffer, arr) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW);
    }

    renderArray(length) {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, length);
    }
}
