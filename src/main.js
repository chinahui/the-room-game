/**
 * The Room - 3D 解谜游戏
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
  
  // 开始游戏循环
  game.start()
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
