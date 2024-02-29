import { BackBuffer } from '../core/BackBuffer'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import fragmentShader from '../shader/sim.fs'
import vertexShader from '../shader/quad.vs'

export class Simulator extends BackBuffer {
  private fpsLog: number[] = []

  constructor(renderer: THREE.WebGLRenderer, cell: [number, number]) {
    const material = new RawShaderMaterial({
      uniforms: {
        uCell: { value: cell },
        tBackBuffer: { value: null },
        uFrame: { value: 0 },
        uIntersectUv: { value: [0, 0] },
        uSpeed: { value: 5 },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material, { size: [1024, 1024] })
  }

  private avgFps(dt: number) {
    const fps = Math.max(60, Math.min(1 / dt, 144))
    if (this.fpsLog.length < 50) this.fpsLog.push(fps)
    else this.fpsLog.shift()
    return this.fpsLog.reduce((p, c) => p + c) / this.fpsLog.length
  }

  private map(value: number, min1: number, max1: number, min2: number, max2: number) {
    return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1)
  }

  render(intersectUv: [number, number], dt: number) {
    const speed = this.map(this.avgFps(dt), 60, 144, 4, 9.6) // 75fps: 5, 60 / 75 * 5 = 4, 144 / 75 * 5 = 9.6

    this.uniforms.uFrame.value += 1
    this.uniforms.tBackBuffer.value = this.backBuffer
    this.uniforms.uIntersectUv.value = intersectUv
    this.uniforms.uSpeed.value = Math.round(speed)

    super.render()
  }
}
