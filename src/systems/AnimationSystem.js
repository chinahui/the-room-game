/**
 * 动画系统
 * 管理物体动画、过渡效果
 */

import * as THREE from 'three'

export class AnimationSystem {
  constructor(game) {
    this.game = game
    this.animations = []
  }

  // 添加动画
  add(animation) {
    this.animations.push(animation)
    return animation
  }

  // 移除动画
  remove(animation) {
    const index = this.animations.indexOf(animation)
    if (index > -1) {
      this.animations.splice(index, 1)
    }
  }

  // 脉冲效果（选中时）
  pulse(object, duration = 0.3) {
    const startScale = object.scale.clone()
    const targetScale = startScale.clone().multiplyScalar(1.1)
    
    const animation = {
      object,
      duration,
      elapsed: 0,
      update(delta) {
        this.elapsed += delta
        const progress = this.elapsed / this.duration
        
        if (progress >= 1) {
          object.scale.copy(startScale)
          return true // 完成
        }
        
        // 缓动函数：先放大再缩小
        const t = progress < 0.5 
          ? progress * 2 
          : 2 - progress * 2
        
        object.scale.lerpVectors(startScale, targetScale, t * 0.5)
        return false
      }
    }
    
    this.add(animation)
    return animation
  }

  // 旋转动画
  rotate(object, axis = 'y', speed = 1) {
    const animation = {
      object,
      axis,
      speed,
      active: true,
      update(delta) {
        if (!this.active) return true
        
        const rotation = this.speed * delta
        switch (this.axis) {
          case 'x': object.rotation.x += rotation; break
          case 'y': object.rotation.y += rotation; break
          case 'z': object.rotation.z += rotation; break
        }
        return false
      },
      stop() {
        this.active = false
      }
    }
    
    this.add(animation)
    return animation
  }

  // 移动到目标位置
  moveTo(object, targetPosition, duration = 1, easing = 'easeInOutCubic') {
    const startPosition = object.position.clone()
    const startTime = performance.now()
    
    const easings = {
      linear: t => t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => 1 - Math.pow(1 - t, 3),
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    
    const animation = {
      object,
      duration: duration * 1000,
      complete: false,
      update(delta) {
        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / this.duration, 1)
        const eased = easings[easing](progress)
        
        object.position.lerpVectors(startPosition, targetPosition, eased)
        
        if (progress >= 1) {
          this.complete = true
          return true
        }
        return false
      }
    }
    
    this.add(animation)
    return animation
  }

  // 颜色渐变
  colorFade(object, targetColor, duration = 0.5) {
    if (!object.material) return null
    
    const startColor = object.material.color.clone()
    const endColor = new THREE.Color(targetColor)
    const startTime = performance.now()
    
    const animation = {
      duration: duration * 1000,
      update(delta) {
        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / this.duration, 1)
        
        object.material.color.lerpColors(startColor, endColor, progress)
        
        if (progress >= 1) {
          return true
        }
        return false
      }
    }
    
    this.add(animation)
    return animation
  }

  // 更新所有动画
  update(delta, elapsed) {
    this.animations = this.animations.filter(animation => {
      return !animation.update(delta)
    })
  }
}
