/**
 * 工具函数
 */

import * as THREE from 'three'

// 缓动函数
export const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: t => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }
}

// 角度转换
export const degToRad = THREE.MathUtils.degToRad
export const radToDeg = THREE.MathUtils.radToDeg

// 随机范围
export const randomRange = (min, max) => Math.random() * (max - min) + min

// 随机整数
export const randomInt = (min, max) => Math.floor(randomRange(min, max + 1))

// 钳制值
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// 线性插值
export const lerp = (start, end, t) => start + (end - start) * t

// 映射范围
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin))
}

// 检测是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 加载纹理
export const loadTexture = (url) => {
  const loader = new THREE.TextureLoader()
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}

// 加载模型（GLTF）
export const loadModel = async (url) => {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
  const loader = new GLTFLoader()
  
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf)
    }, undefined, reject)
  })
}
