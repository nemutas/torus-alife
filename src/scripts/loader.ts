import * as THREE from 'three'

function getFileName(path: string) {
  return path.split('/').at(-1)!.split('.')[0]
}

async function genTexture(loader: THREE.TextureLoader, path: string) {
  const texture = await loader.loadAsync(path)
  texture.name = getFileName(path)
  texture.userData.aspect = texture.source.data.width / texture.source.data.height
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  return texture
}

export async function loadTexture(pathFromPublic: string) {
  const loader = new THREE.TextureLoader()
  loader.setPath(import.meta.env.BASE_URL)
  return genTexture(loader, pathFromPublic)
}

export async function loadTextures(...pathsFromPublic: string[]) {
  const loader = new THREE.TextureLoader()
  loader.setPath(import.meta.env.BASE_URL)
  return Promise.all(pathsFromPublic.map(async (path) => genTexture(loader, path)))
}
