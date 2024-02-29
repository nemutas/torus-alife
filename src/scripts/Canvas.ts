import * as THREE from 'three'
import { Three } from './core/Three'
import vertexShader from './shader/torus.vs'
import fragmentShader from './shader/torus.fs'
import { Simulator } from './scene/Simulator'
import { mouse2d } from './Mouse2D'

export class Canvas extends Three {
  private torus: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  private simulator: Simulator
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private lights = new THREE.Group()

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    this.init()
    this.createLights()

    this.simulator = new Simulator(this.renderer, [512, 64])

    this.torus = this.createTorus()
    this.renderer.setAnimationLoop(this.anime.bind(this))
  }

  private init() {
    this.scene.background = new THREE.Color('#f0f0f0')

    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.15
  }

  private createLights() {
    this.scene.add(this.lights)

    const amb = new THREE.AmbientLight('#fff', 0.5)
    this.lights.add(amb)

    const dir = new THREE.DirectionalLight('#fff', 1.0)
    dir.position.set(3, 3, 3)
    dir.castShadow = true
    dir.shadow.mapSize.set(1024, 1024)
    dir.shadow.camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.01, 10)
    this.lights.add(dir)
    // this.scene.add(new THREE.CameraHelper(dir.shadow.camera))
  }

  private createTorus() {
    const geometry = new THREE.TorusKnotGeometry(1, 0.35, 256, 32)
    const material = new THREE.MeshStandardMaterial({ color: '#fff', metalness: 0.2, roughness: 0.3, emissive: '#aaa' })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { tSim: { value: null } })
      shader.fragmentShader = fragmentShader
      shader.vertexShader = vertexShader

      material.userData.uniforms = shader.uniforms
    }

    return mesh
  }

  private getIntersectUv(): [number, number] | null {
    this.pointer.set(...mouse2d.position)
    this.raycaster.setFromCamera(this.pointer, this.camera)

    const intersects = this.raycaster.intersectObject(this.torus)

    if (0 < intersects.length) {
      const io = intersects[0]
      if (io.uv) return [io.uv.x, io.uv.y]
    }
    return null
  }

  private anime() {
    this.updateTime()
    this.controls.update()
    this.lights.quaternion.copy(this.camera.quaternion)

    this.simulator.render(this.getIntersectUv(), this.time.delta)

    if (this.torus.material.userData.uniforms) {
      this.torus.material.userData.uniforms.tSim.value = this.simulator.texture
    }

    this.render()
  }
}
