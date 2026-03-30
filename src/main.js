/**
 * The Room - 学徒之盒
 * 游戏入口文件
 */

import { Game } from './core/Game.js'

// 游戏实例
let game = null

// 初始化游戏
async function init() {
  game = new Game()
  await game.init()
  
  // 隐藏加载界面
  const loadingScreen = document.getElementById('loading-screen')
  loadingScreen.classList.add('hidden')
  setTimeout(() => loadingScreen.remove(), 500)
  
  // 绑定开始按钮
  const startBtn = document.getElementById('start-btn')
  const introOverlay = document.getElementById('intro-overlay')
  
  if (startBtn && introOverlay) {
    startBtn.addEventListener('click', () => {
      introOverlay.classList.add('hidden')
      setTimeout(() => introOverlay.remove(), 1000)
      game.start()
    })
    
    // 也支持按 Enter 开始
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !introOverlay.classList.contains('hidden')) {
        startBtn.click()
      }
    })
  } else {
    // 没有开场界面，直接开始
    game.start()
  }
}

// 窗口大小变化处理
function handleResize() {
  if (game) {
    game.resize()
  }
}

// 事件监听
window.addEventListener('DOMContentLoaded', init)
window.addEventListener('resize', handleResize)
