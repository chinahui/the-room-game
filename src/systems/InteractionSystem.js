/**
 * 交互系统
 * 处理鼠标/触摸交互、射线检测、物体选择
 */

import * as THREE from 'three'

export class InteractionSystem {
  constructor(game) {
    this.game = game
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    
    // 当前状态
    this.hoveredObject = null
    this.selectedObject = null
    this.selectedInventoryItem = null
    this.isDragging = false
    this.dragStart = new THREE.Vector2()
    
    // 配置
    this.interactiveObjects = []
    this.interactionDistance = 5
    
    this.bindEvents()
  }
  
  // 注册可交互物体
  registerInteractive(object) {
    if (!this.interactiveObjects.includes(object)) {
      this.interactiveObjects.push(object)
    }
  }

  bindEvents() {
    const canvas = this.game.renderer.domElement

    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e))
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e))
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e))
    canvas.addEventListener('click', (e) => this.onClick(e))
    
    // 触摸支持
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e))
    canvas.addEventListener('touchmove', (e) => this.onTouchMove(e))
    canvas.addEventListener('touchend', (e) => this.onTouchEnd(e))
  }

  onMouseMove(event) {
    this.updateMouse(event)
    
    // 射线检测
    const intersects = this.getIntersections()
    
    if (intersects.length > 0) {
      const object = intersects[0].object
      
      if (object.userData.interactive) {
        this.setHovered(object)
        document.body.style.cursor = 'pointer'
      } else {
        this.clearHovered()
        document.body.style.cursor = 'default'
      }
    } else {
      this.clearHovered()
      document.body.style.cursor = 'default'
    }
  }

  onMouseDown(event) {
    if (event.button === 0) { // 左键
      this.dragStart.set(event.clientX, event.clientY)
      this.isDragging = false
    }
  }

  onMouseUp(event) {
    // 如果没有拖动太多，视为点击
    const distance = Math.hypot(
      event.clientX - this.dragStart.x,
      event.clientY - this.dragStart.y
    )
    
    if (distance < 5) {
      this.onClick(event)
    }
    
    this.isDragging = false
  }

  onClick(event) {
    const intersects = this.getIntersections()
    
    if (intersects.length > 0) {
      const object = intersects[0].object
      
      if (object.userData.interactive) {
        this.select(object)
      }
    } else {
      this.deselect()
    }
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.updateMouse(touch)
      this.dragStart.set(touch.clientX, touch.clientY)
    }
  }

  onTouchMove(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.updateMouse(touch)
      
      const distance = Math.hypot(
        touch.clientX - this.dragStart.x,
        touch.clientY - this.dragStart.y
      )
      
      if (distance > 10) {
        this.isDragging = true
      }
    }
  }

  onTouchEnd(event) {
    if (!this.isDragging) {
      const intersects = this.getIntersections()
      if (intersects.length > 0) {
        const object = intersects[0].object
        if (object.userData.interactive) {
          this.select(object)
        }
      }
    }
    this.isDragging = false
  }

  updateMouse(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  getIntersections() {
    this.raycaster.setFromCamera(this.mouse, this.game.camera)
    
    // 使用注册的可交互物体列表
    return this.raycaster.intersectObjects(this.interactiveObjects, true)
  }

  setHovered(object) {
    if (this.hoveredObject !== object) {
      this.clearHovered()
      this.hoveredObject = object
      
      // 高亮效果
      if (object.material && object.material.emissive) {
        object.userData.originalEmissive = object.material.emissive.getHex()
        object.material.emissive.setHex(0x333333)
      }
      
      // 显示准星激活状态
      document.getElementById('crosshair')?.classList.add('active')
      
      // 显示提示
      if (object.userData.hint) {
        this.showHint(object.userData.hint)
      }
    }
  }

  clearHovered() {
    if (this.hoveredObject) {
      // 恢复原始颜色
      if (this.hoveredObject.material?.emissive) {
        const original = this.hoveredObject.userData.originalEmissive
        if (original !== undefined) {
          this.hoveredObject.material.emissive.setHex(original)
        }
      }
      
      this.hoveredObject = null
      document.getElementById('crosshair')?.classList.remove('active')
      this.hideHint()
    }
  }

  select(object) {
    this.selectedObject = object
    console.log('Selected:', object.userData.name)
    
    // 触发选择动画
    this.game.animationSystem.pulse(object)
    
    // 检查是否使用了物品
    if (this.selectedInventoryItem) {
      this.useSelectedItem(object)
      return
    }
    
    // 如果有自定义对象处理器
    if (object.userData.object && typeof object.userData.object.handleClick === 'function') {
      object.userData.object.handleClick(object.userData.name)
    }
  }
  
  // 使用选中的物品
  useSelectedItem(targetObject) {
    const item = this.selectedInventoryItem
    const targetName = targetObject.userData.name
    
    // 尝试使用物品
    if (this.game.puzzleBox && this.game.puzzleBox.useItem) {
      const used = this.game.puzzleBox.useItem(item.id, targetName)
      if (used) {
        this.clearInventorySelection()
        return
      }
    }
    
    // 默认提示
    this.showHint(`无法对 ${targetName} 使用 ${item.name}`)
    this.clearInventorySelection()
  }
  
  // 清除物品选择
  clearInventorySelection() {
    this.selectedInventoryItem = null
    document.querySelectorAll('.inventory-slot').forEach(slot => {
      slot.classList.remove('selected')
    })
  }

  deselect() {
    this.selectedObject = null
  }

  showHint(text) {
    const panel = document.getElementById('hint-panel')
    if (panel) {
      panel.textContent = text
      panel.classList.remove('hidden')
    }
  }

  hideHint() {
    const panel = document.getElementById('hint-panel')
    if (panel) {
      panel.classList.add('hidden')
    }
  }

  update(delta) {
    // 更新交互状态
  }
}
