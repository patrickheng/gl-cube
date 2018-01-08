import { mat4, vec3 } from 'gl-matrix';

import cubeData from 'primitives/cube'

import cubeVertex from './shaders/cube.vert'
import cubeFragment from './shaders/cube.frag'

class WebGL {
  constructor() {

    this._canvas = document.querySelector('canvas')
    this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl')


    this._vertexShader = cubeVertex
    this._fragmentShader = cubeFragment
  
    this._projectionMatrix = mat4.create()
    this._modelMatrix = mat4.create()

    this.rotation = vec3.fromValues(0.01, 0.01, 0.01)

    mat4.translate(this._modelMatrix, this._modelMatrix, [ 0, 0, -8 ])

    this._program = this._createProgram(this._vertexShader, this._fragmentShader)
    this._gl.useProgram(this._program)

    // Camera config
    this._fov = Math.PI / 4
    this._near = 0.01
    this._far = 100

    // Colors
    this._color = [ 0, 1, 1 ]

    window.addEventListener('resize', this._handleResize.bind(this), false)

    this._setSize()
    this._setBuffers()
    this._setPositionAttributes()
    this._setUniforms()
    this._render()
  }

  _setBuffers() {

    this._buffer = this._gl.createBuffer()
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer)
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(cubeData.positions), this._gl.STATIC_DRAW)

    this._indicesBuffer = this._gl.createBuffer()
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer)
    this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeData.indices), this._gl.STATIC_DRAW)
  }

  _setPositionAttributes() {
    const vertexPosition = this._gl.getAttribLocation(this._program, 'aPosition')
    this._gl.enableVertexAttribArray(vertexPosition)
    this._gl.vertexAttribPointer(vertexPosition, 3, this._gl.FLOAT, false, 0, 0)
  }

  _setProjectionMatrix(fov, near, far) {

    mat4.perspective(
      this._projectionMatrix, this._fov,
      this._aspect, this._near, this._far
    )

    this._setUniforms()
  }

  _setUniforms() {
    this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._program, 'uProjectionMatrix'), false, this._projectionMatrix)
    this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._program, 'uModelMatrix'), false, this._modelMatrix)
    this._gl.uniform3f(this._gl.getUniformLocation(this._program, 'uColor'), this._color[0], this._color[1], this._color[2])
    this._gl.uniform1f(this._gl.getUniformLocation(this._program, 'uAlpha'), 1.)
  }

  _createProgram (vertexShaderSource, fragmentShaderSource) {
    const program = this._gl.createProgram()

    const vertexShader = this._createShader(vertexShaderSource, this._gl.VERTEX_SHADER)
    const fragmentShader = this._createShader('#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragmentShaderSource, this._gl.FRAGMENT_SHADER)

    if (vertexShader == null || fragmentShader == null) {
      return null
    }

    this._gl.attachShader(program, vertexShader)
    this._gl.attachShader(program, fragmentShader)

    this._gl.linkProgram(program)

    if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
       const programError =
            'WebGL program error:\n' +
            'VALIDATE_STATUS: ' + this._gl.getProgramParameter(program, this._gl.VALIDATE_STATUS) + '\n' +
            'ERROR: ' + this._gl.getError() + '\n\n' +
            '--- Vertex Shader ---\n' + vertexShader + '\n\n' +
            '--- Fragment Shader ---\n' + fragmentShader
      throw programError
    }

    return program
  }

  _createShader (source, type) {
    const shader = this._gl.createShader(type)

    this._gl.shaderSource(shader, source)
    this._gl.compileShader(shader)

    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
      const shader_error =
            'WebGL shader error:\n' +
            (type == this._gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT') + ' SHADER:\n' +
            this._gl.getShaderInfoLog(shader)
      throw shader_error
    }

    return shader
  }
  
  _setSize() {
    this._width = window.innerWidth
    this._height = window.innerHeight
    this._aspect = this._width / this._height
    this._gl.viewport(0, 0, this._width, this._height)

    this._canvas.width = this._width
    this._canvas.height = this._height

    this._setProjectionMatrix()
  }

  _handleResize() {
    this._setSize()
  }

  _render() {
    requestAnimationFrame(this._render.bind(this))

    mat4.rotateY(this._modelMatrix, this._modelMatrix, this.rotation[1])
    mat4.rotateZ(this._modelMatrix, this._modelMatrix, this.rotation[2])
    
    this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._program, 'uModelMatrix'), false, this._modelMatrix)

    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT)
    this._gl.clearColor(1, .5, 1, 1)
    this._gl.drawElements(this._gl.TRIANGLES, 36, this._gl.UNSIGNED_SHORT, 0)
  }
}

export default WebGL


const webGL = new WebGL()

