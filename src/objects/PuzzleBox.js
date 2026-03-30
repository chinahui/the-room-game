/**
 * 解谜盒子
 * The Room 风格的可旋转解谜盒子
 */

import * as THREE from 'three'
import { InteractableObject } from './InteractableObject.js'

export class PuzzleBox extends InteractableObject {
  constructor(game, config = {}) {
    super(game, config)
    this.rotationState = { x: 0, y: 0 }
    this.targetRotation = { x: 0, y: 0 }
    this.isRotating = false
    
    this.createMesh()
  }

  createMesh() {
    // 创建主盒子
    const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4)
    const material = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      roughness: 0.3,
      metalness: 0.7
    })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    
    // 设置用户数据
    this.mesh.userData = {
      name: this.name,
      interactive: true,
      type: 'puzzle_box',
      hint: '一个神秘的金属盒子，可以旋转观察',
      object: this
    }
    
    // 添加装饰纹理（面片）
    this.addDecorations()
    
    return this.mesh
  }

  addDecorations() {
    // 在每个面添加装饰
    const decorationGeom = new THREE.CircleGeometry(0.1, 32)
    const decorationMat = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.5,
      metalness: 0.8
    })
    
    const positions = [
      { pos: [0, 0, 0.201], rot: [0, 0, 0] },
      { pos: [0, 0, -0.201], rot: [0, Math.PI, 0] },
      { pos: [0.201, 0, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-0.201, 0, 0], rot: [0, -Math.PI / 2, 0] },
      { pos: [0, 0.201, 0], rot: [-Math.PI / 2, 0, 0] },
      { pos: [0, -0.201, 0], rot: [Math.PI / 2, 0, 0] }
    ]
    
    positions.forEach(({ pos, rot }) => {
      const decoration = new THREE.Mesh(decorationGeom, decorationMat)
      decoration.position.set(...pos)
      decoration.rotation.set(...rot)
      this.mesh.add(decoration)
    })
  }

  onClick() {
    // 进入细节视图
    console.log('Opening puzzle box detail view')
    this.game.animationSystem.pulse(this.mesh)
  }

  // 旋转到目标角度
  rotateTo(x, y) {
    this.targetRotation = { x, y }
    this.isRotating = true
  }

  // 旋转指定角度
  rotateBy(dx, dy) {
    this.targetRotation.x = this.rotationState.x + dx
    this.targetRotation.y = this.rotationState.y + dy
    this.isRotating = true
  }

  update(delta) {
    if (this.isRotating && this.mesh) {
      const speed = 5
      const dx = this.targetRotation.x - this.rotationState.x
      const dy = this.targetRotation.y - this.rotationState.y
      
      this.rotationState.x += dx * speed * delta
      this.rotationState.y += dy * speed * delta
      
      this.mesh.rotation.x = this.rotationState.x
      this.mesh.rotation.y = this.rotationState.y
      
      // 检查是否完成
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
        this.rotationState = { ...this.targetRotation }
        this.isRotating = false
      }
    }
  }
}
