/**
 * 游戏核心类
 * 负责场景初始化、渲染循环、系统协调
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { InteractionSystem } from '../systems/InteractionSystem.js'
import { AnimationSystem } from '../systems/AnimationSystem.js'
import { ObjectManager } from './ObjectManager.js'
import { ApprenticeBox } from '../objects/ApprenticeBox.js'

export class Game {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.clock = new THREE.Clock()
    
    // 系统
    this.interactionSystem = null
    this.animationSystem = null
    this.objectManager = null
    
    // 状态
    this.isRunning = false
    this.selectedObject = null
    this.inventory = []
  }

  async init() {
    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initLights()
    this.initControls()
    this.initSystems()
    this.initObjects()
    
    // 加载资源
    await this.loadAssets()
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a1a)
    this.scene.fog = new THREE.Fog(0x1a1a1a, 5, 30)
  }

  initCamera() {
    const canvas = document.getElementById('game-canvas')
    const aspect = window.innerWidth / window.innerHeight
    
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100)
    this.camera.position.set(0, 2, 5)
    this.camera.lookAt(0, 0, 0)
  }

  initRenderer() {
    const canvas = document.getElementById('game-canvas')
    
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    })
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
  }

  initLights() {
    // 环境光
    const ambient = new THREE.AmbientLight(0x404040, 0.5)
    this.scene.add(ambient)

    // 主光源
    const mainLight = new THREE.DirectionalLight(0xfff5e0, 1.0)
    mainLight.position.set(5, 10, 5)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 50
    mainLight.shadow.camera.left = -10
    mainLight.shadow.camera.right = 10
    mainLight.shadow.camera.top = 10
    mainLight.shadow.camera.bottom = -10
    this.scene.add(mainLight)

    // 补光
    const fillLight = new THREE.DirectionalLight(0x8899aa, 0.3)
    fillLight.position.set(-5, 5, -5)
    this.scene.add(fillLight)

    // 点光源（蜡烛效果）
    const pointLight = new THREE.PointLight(0xff9944, 0.8, 10)
    pointLight.position.set(0, 1, 0)
    this.scene.add(pointLight)
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    
    // The Room 风格：近距离观察物体
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 1
    this.controls.maxDistance = 15
    this.controls.maxPolarAngle = Math.PI * 0.85
    
    // 目标点（桌子中心）
    this.controls.target.set(0, 0.5, 0)
    this.controls.update()
  }

  initSystems() {
    this.interactionSystem = new InteractionSystem(this)
    this.animationSystem = new AnimationSystem(this)
    this.objectManager = new ObjectManager(this)
  }

  initObjects() {
    // 桌子
    const tableGeom = new THREE.BoxGeometry(3, 0.1, 2)
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.8,
      metalness: 0.1
    })
    const table = new THREE.Mesh(tableGeom, tableMat)
    table.position.y = 0.5
    table.receiveShadow = true
    table.userData.name = 'table'
    table.userData.interactive = false
    this.scene.add(table)

    // 桌腿
    const legGeom = new THREE.BoxGeometry(0.1, 0.5, 0.1)
    const positions = [
      [-1.4, 0.25, -0.9],
      [1.4, 0.25, -0.9],
      [-1.4, 0.25, 0.9],
      [1.4, 0.25, 0.9]
    ]
    
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeom, tableMat)
      leg.position.set(...pos)
      leg.castShadow = true
      this.scene.add(leg)
    })

    // 学徒之盒（主谜题）
    this.puzzleBox = new ApprenticeBox(this)
    this.puzzleBox.addToScene(this.scene)
    
    // 注册可交互物体
    this.puzzleBox.getInteractiveParts().forEach(part => {
      this.interactionSystem.registerInteractive(part)
    })

    // 地面
    const floorGeom = new THREE.PlaneGeometry(20, 20)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
      metalness: 0.1
    })
    const floor = new THREE.Mesh(floorGeom, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
    
    // 信件（开场提示）
    this.showIntro()
  }
  
  showIntro() {
    const hint = document.getElementById('hint-panel')
    if (hint) {
      hint.innerHTML = `<strong>学徒之盒</strong><br><br>
        你收到了一个包裹，里面是一个精致的木盒，附带一封信：<br><br>
        <em>"亲爱的学徒，如果你能打开这个盒子，说明你已经准备好接受真正的训练了。——你的导师"</em><br><br>
        <small>旋转盒子观察每一面，寻找打开它的方法...</small>`
      hint.classList.remove('hidden')
      
      // 5秒后隐藏
      setTimeout(() => {
        hint.classList.add('hidden')
      }, 8000)
    }
  }

  async loadAssets() {
    // TODO: 加载模型、纹理等资源
    console.log('Assets loaded')
  }

  start() {
    this.isRunning = true
    this.animate()
  }

  stop() {
    this.isRunning = false
  }

  animate() {
    if (!this.isRunning) return

    requestAnimationFrame(() => this.animate())

    const delta = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()

    // 更新系统
    this.controls.update()
    this.interactionSystem.update(delta)
    this.animationSystem.update(delta, elapsed)
    
    // 更新解谜盒子
    if (this.puzzleBox && this.puzzleBox.update) {
      this.puzzleBox.update(delta)
    }

    // 渲染
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // 添加物品到背包
  addToInventory(item) {
    this.inventory.push(item)
    this.updateInventoryUI()
  }

  updateInventoryUI() {
    const container = document.getElementById('inventory')
    container.innerHTML = ''
    
    this.inventory.forEach((item, index) => {
      const slot = document.createElement('div')
      slot.className = 'inventory-slot'
      slot.textContent = item.icon || '?'
      slot.onclick = () => this.selectInventoryItem(index)
      container.appendChild(slot)
    })
  }

  selectInventoryItem(index) {
    const item = this.inventory[index]
    if (!item) return
    
    // 设置选中的物品
    this.interactionSystem.selectedInventoryItem = item
    
    // 更新UI
    const slots = document.querySelectorAll('.inventory-slot')
    slots.forEach((slot, i) => {
      slot.classList.toggle('selected', i === index)
    })
    
    console.log('Selected inventory item:', item.name)
    this.interactionSystem.showHint(`已选择：${item.name}，点击目标使用`)
  }
}
