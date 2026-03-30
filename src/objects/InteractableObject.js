/**
 * 物体基类
 * 所有可交互物体的基类
 */

import * as THREE from 'three'

export class InteractableObject {
  constructor(game, config = {}) {
    this.game = game
    this.mesh = null
    this.name = config.name || 'unnamed'
    this.interactive = config.interactive ?? true
    this.state = config.initialState || {}
  }

  // 创建网格（子类实现）
  createMesh() {
    throw new Error('createMesh must be implemented by subclass')
  }

  // 添加到场景
  addToScene() {
    if (this.mesh) {
      this.game.scene.add(this.mesh)
    }
  }

  // 从场景移除
  removeFromScene() {
    if (this.mesh) {
      this.game.scene.remove(this.mesh)
    }
  }

  // 设置位置
  setPosition(x, y, z) {
    if (this.mesh) {
      this.mesh.position.set(x, y, z)
    }
  }

  // 设置旋转
  setRotation(x, y, z) {
    if (this.mesh) {
      this.mesh.rotation.set(x, y, z)
    }
  }

  // 被点击时
  onClick() {
    console.log(`${this.name} was clicked`)
  }

  // 被悬停时
  onHover() {
    // 子类实现
  }

  // 取消悬停时
  onHoverEnd() {
    // 子类实现
  }

  // 更新
  update(delta) {
    // 子类实现
  }
}
