/**
 * 物体管理器
 * 负责管理场景中的可交互物体
 */

import * as THREE from 'three'

export class ObjectManager {
  constructor(game) {
    this.game = game
    this.objects = new Map()
  }

  // 注册物体
  register(name, object, config = {}) {
    this.objects.set(name, {
      mesh: object,
      interactive: config.interactive ?? true,
      type: config.type || 'generic',
      state: config.initialState || {},
      interactions: config.interactions || []
    })
    
    object.userData.objectName = name
    object.userData.registered = true
  }

  // 获取物体
  get(name) {
    return this.objects.get(name)
  }

  // 更新物体状态
  setState(name, state) {
    const obj = this.objects.get(name)
    if (obj) {
      Object.assign(obj.state, state)
    }
  }

  // 获取状态
  getState(name) {
    const obj = this.objects.get(name)
    return obj ? obj.state : null
  }

  // 检查是否可交互
  isInteractive(object) {
    return object.userData.interactive === true
  }

  // 获取所有可交互物体
  getInteractiveObjects() {
    const interactives = []
    this.objects.forEach((obj) => {
      if (obj.interactive) {
        interactives.push(obj.mesh)
      }
    })
    return interactives
  }
}
