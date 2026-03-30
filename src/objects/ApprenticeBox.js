/**
 * 学徒之盒 - 第一关解谜盒子
 * The Room 风格的可交互解谜盒子
 */

import * as THREE from 'three'

export class ApprenticeBox {
  constructor(game) {
    this.game = game
    
    // 盒子状态
    this.state = {
      footPadSlideOpen: false,     // 脚垫是否滑开
      pinRotated: false,           // 销钉是否转动
      drawerOpen: false,           // 抽屉是否打开
      hasKey: true,                // 钥匙是否在抽屉里
      lidOpen: false,              // 盒盖是否打开
      keyUsed: false               // 钥匙是否已使用
    }
    
    // 部件引用
    this.parts = {}
    
    // 动画状态
    this.animations = []
    
    this.createBox()
  }

  createBox() {
    // 主组
    this.group = new THREE.Group()
    
    // 盒子主体（木质）
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.8,
      metalness: 0.1
    })
    
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      roughness: 0.3,
      metalness: 0.8
    })
    
    // 盒子主体（空心的）
    this.parts.body = this.createHollowBox(boxMaterial)
    this.group.add(this.parts.body)
    
    // 盒盖
    this.parts.lid = this.createLid(boxMaterial, metalMaterial)
    this.parts.lid.position.set(0, 0.15, -0.15)
    this.group.add(this.parts.lid)
    
    // 前面抽屉
    this.parts.drawer = this.createDrawer(boxMaterial, metalMaterial)
    this.parts.drawer.position.set(0, 0, 0.28)
    this.group.add(this.parts.drawer)
    
    // 底部脚垫（可滑动）
    this.parts.footPad = this.createFootPad(metalMaterial)
    this.parts.footPad.position.set(0.12, -0.16, 0.12)
    this.group.add(this.parts.footPad)
    
    // 侧面销钉
    this.parts.pin = this.createPin(metalMaterial)
    this.parts.pin.position.set(0.26, 0, 0)
    this.group.add(this.parts.pin)
    
    // 设置整体位置
    this.group.position.set(0, 0.7, 0)
    this.group.userData = {
      name: 'apprentice_box',
      interactive: true,
      type: 'puzzle_box',
      hint: '一个精致的木盒，上面有一封信...',
      object: this
    }
    
    return this.group
  }

  createHollowBox(material) {
    const group = new THREE.Group()
    
    // 底部
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.02, 0.5),
      material
    )
    bottom.position.y = -0.15
    bottom.castShadow = true
    bottom.receiveShadow = true
    group.add(bottom)
    
    // 左侧
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.3, 0.5),
      material
    )
    left.position.set(-0.19, 0, 0)
    left.castShadow = true
    group.add(left)
    
    // 右侧
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.3, 0.5),
      material
    )
    right.position.set(0.19, 0, 0)
    right.castShadow = true
    group.add(right)
    
    // 后面
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.02),
      material
    )
    back.position.set(0, 0, -0.24)
    back.castShadow = true
    group.add(back)
    
    // 前面框架（留出抽屉口）
    const frontTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.02),
      material
    )
    frontTop.position.set(0, 0.1, 0.24)
    frontTop.castShadow = true
    group.add(frontTop)
    
    const frontBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.02),
      material
    )
    frontBottom.position.set(0, -0.125, 0.24)
    frontBottom.castShadow = true
    group.add(frontBottom)
    
    return group
  }

  createLid(boxMaterial, metalMaterial) {
    const group = new THREE.Group()
    
    // 盖子主体
    const lidBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.03, 0.35),
      boxMaterial
    )
    lidBody.castShadow = true
    group.add(lidBody)
    
    // 钥匙孔装饰
    const keyhole = new THREE.Mesh(
      new THREE.CircleGeometry(0.02, 16),
      metalMaterial
    )
    keyhole.position.set(0, 0.016, 0)
    keyhole.rotation.x = -Math.PI / 2
    group.add(keyhole)
    
    // 锁孔凹槽
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.001, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    )
    slot.position.set(0, 0.017, 0)
    slot.rotation.x = -Math.PI / 2
    group.add(slot)
    
    group.userData = {
      name: 'lid',
      interactive: true,
      hint: '盒盖上有一个钥匙孔，需要找到钥匙才能打开',
      object: this
    }
    
    return group
  }

  createDrawer(boxMaterial, metalMaterial) {
    const group = new THREE.Group()
    
    // 抽屉面板
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.12, 0.02),
      boxMaterial
    )
    panel.castShadow = true
    group.add(panel)
    
    // 抽屉把手
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.015, 0.005, 8, 16),
      metalMaterial
    )
    handle.position.set(0, 0, 0.015)
    handle.rotation.x = Math.PI / 2
    group.add(handle)
    
    group.userData = {
      name: 'drawer',
      interactive: true,
      hint: '一个小抽屉，似乎被什么东西卡住了...',
      object: this
    }
    
    return group
  }

  createFootPad(material) {
    const group = new THREE.Group()
    
    // 脚垫主体
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16),
      material
    )
    pad.castShadow = true
    group.add(pad)
    
    // 滑动指示纹路
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.005, 0.025),
      new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    )
    groove.position.set(0, 0.012, 0)
    group.add(groove)
    
    group.userData = {
      name: 'footPad',
      interactive: true,
      hint: '这个脚垫看起来可以滑动...',
      object: this
    }
    
    return group
  }

  createPin(material) {
    const group = new THREE.Group()
    
    // 销钉主体
    const pinBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.04, 16),
      material
    )
    pinBody.rotation.z = Math.PI / 2
    pinBody.castShadow = true
    group.add(pinBody)
    
    // 销钉头（一字槽）
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16),
      material
    )
    head.rotation.z = Math.PI / 2
    head.position.x = 0.025
    group.add(head)
    
    // 槽纹
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.001, 0.025, 0.005),
      new THREE.MeshStandardMaterial({ color: 0x654321 })
    )
    slot.position.set(0.031, 0, 0)
    group.add(slot)
    
    group.userData = {
      name: 'pin',
      interactive: true,
      hint: '一个金属销钉，槽纹是垂直的',
      object: this
    }
    
    return group
  }

  // 添加到场景
  addToScene(scene) {
    scene.add(this.group)
  }

  // 处理点击
  handleClick(partName) {
    switch (partName) {
      case 'footPad':
        this.slideFootPad()
        break
      case 'pin':
        this.rotatePin()
        break
      case 'drawer':
        this.openDrawer()
        break
      case 'lid':
        this.openLid()
        break
      case 'apprentice_box':
        // 点击整体显示提示
        this.game.interactionSystem.showHint('一个精致的木盒。旋转观察它的每一面...')
        break
    }
  }

  // 滑动脚垫
  slideFootPad() {
    if (this.state.footPadSlideOpen) {
      this.game.interactionSystem.showHint('脚垫已经滑开，露出一个小孔，里面有符号...')
      return
    }
    
    // 播放滑动动画
    this.addAnimation({
      target: this.parts.footPad.position,
      property: 'z',
      from: 0.12,
      to: 0.2,
      duration: 500,
      onComplete: () => {
        this.state.footPadSlideOpen = true
        this.game.interactionSystem.showHint('脚垫滑开了！露出一个小孔，里面似乎有一个符号...')
        
        // 显示符号（简化处理）
        this.showSymbol()
      }
    })
  }

  // 显示符号
  showSymbol() {
    // TODO: 在UI上显示符号
    console.log('Symbol revealed!')
  }

  // 转动销钉
  rotatePin() {
    if (this.state.pinRotated) {
      this.game.interactionSystem.showHint('销钉已经转动了90度，槽纹现在是水平的')
      return
    }
    
    // 播放旋转动画
    this.addAnimation({
      target: this.parts.pin.rotation,
      property: 'x',
      from: 0,
      to: Math.PI / 2,
      duration: 300,
      onComplete: () => {
        this.state.pinRotated = true
        this.game.interactionSystem.showHint('销钉转动了！抽屉的阻碍似乎解除了...')
        
        // 更新抽屉提示
        this.parts.drawer.userData.hint = '抽屉似乎可以打开了...'
      }
    })
  }

  // 打开抽屉
  openDrawer() {
    if (!this.state.pinRotated) {
      this.game.interactionSystem.showHint('抽屉被卡住了，打不开...')
      return
    }
    
    if (this.state.drawerOpen) {
      if (this.state.hasKey) {
        this.game.interactionSystem.showHint('抽屉里有一把小钥匙')
      } else {
        this.game.interactionSystem.showHint('抽屉是空的')
      }
      return
    }
    
    // 播放打开动画
    this.addAnimation({
      target: this.parts.drawer.position,
      property: 'z',
      from: 0.28,
      to: 0.4,
      duration: 400,
      onComplete: () => {
        this.state.drawerOpen = true
        this.game.interactionSystem.showHint('抽屉打开了！里面有一把小钥匙！')
        
        // 添加钥匙到物品栏
        if (this.state.hasKey) {
          this.game.addToInventory({
            id: 'small_key',
            name: '小钥匙',
            icon: '🔑',
            description: '一把精致的小钥匙'
          })
          this.state.hasKey = false
        }
      }
    })
  }

  // 打开盒盖
  openLid() {
    if (this.state.lidOpen) {
      this.game.interactionSystem.showHint('盒子已经打开了')
      return
    }
    
    // 检查是否使用了钥匙
    if (!this.state.keyUsed) {
      const key = this.game.inventory.find(item => item.id === 'small_key')
      if (key) {
        this.game.interactionSystem.showHint('用钥匙打开盒子？（点击钥匙后点击盒盖）')
      } else {
        this.game.interactionSystem.showHint('盒盖上有钥匙孔，需要找到钥匙...')
      }
      return
    }
    
    // 播放打开动画
    this.addAnimation({
      target: this.parts.lid.rotation,
      property: 'x',
      from: 0,
      to: -Math.PI / 4,
      duration: 600,
      onComplete: () => {
        this.state.lidOpen = true
        this.game.interactionSystem.showHint('盒子打开了！里面有一张羊皮纸碎片和一枚奇怪的徽章...')
        
        // TODO: 显示盒子内容
        this.showBoxContents()
      }
    })
  }

  // 显示盒子内容
  showBoxContents() {
    // 添加物品到背包
    this.game.addToInventory({
      id: 'parchment',
      name: '羊皮纸碎片',
      icon: '📜',
      description: '一张古老的羊皮纸碎片，上面有部分地图...'
    })
    
    this.game.addToInventory({
      id: 'badge',
      name: '神秘徽章',
      icon: '🏅',
      description: '一枚奇怪的金属徽章，上面有未知符号'
    })
    
    // 显示过关提示
    setTimeout(() => {
      this.game.interactionSystem.showHint('🎉 恭喜！你成功打开了学徒之盒！这只是开始...')
    }, 1500)
  }

  // 使用物品
  useItem(itemId, targetName) {
    if (itemId === 'small_key' && targetName === 'lid') {
      if (this.state.keyUsed) {
        this.game.interactionSystem.showHint('钥匙已经用过了')
        return true
      }
      
      // 使用钥匙
      this.state.keyUsed = true
      this.game.interactionSystem.showHint('钥匙插入锁孔，转动...咔嗒！盒子解锁了！')
      
      // 移除钥匙
      this.game.inventory = this.game.inventory.filter(item => item.id !== 'small_key')
      this.game.updateInventoryUI()
      
      // 延迟打开盒盖
      setTimeout(() => this.openLid(), 500)
      return true
    }
    
    return false
  }

  // 添加动画
  addAnimation(config) {
    const animation = {
      target: config.target,
      property: config.property,
      startValue: config.from !== undefined ? config.from : config.target[config.property],
      endValue: config.to,
      startTime: performance.now(),
      duration: config.duration || 300,
      easing: config.easing || 'easeOutCubic',
      onComplete: config.onComplete,
      
      update() {
        const elapsed = performance.now() - this.startTime
        let progress = Math.min(elapsed / this.duration, 1)
        
        // 缓动函数
        const easings = {
          linear: t => t,
          easeOutCubic: t => 1 - Math.pow(1 - t, 3),
          easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }
        
        progress = easings[this.easing](progress)
        
        // 更新值
        this.target[this.property] = this.startValue + (this.endValue - this.startValue) * progress
        
        // 检查完成
        if (elapsed >= this.duration) {
          if (this.onComplete) this.onComplete()
          return true
        }
        return false
      }
    }
    
    this.animations.push(animation)
  }

  // 更新
  update(delta) {
    // 更新动画
    this.animations = this.animations.filter(anim => !anim.update())
  }

  // 获取所有可交互部件
  getInteractiveParts() {
    return [
      this.parts.footPad,
      this.parts.pin,
      this.parts.drawer,
      this.parts.lid,
      this.group
    ]
  }
}
