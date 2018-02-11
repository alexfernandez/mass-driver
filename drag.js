'use strict'

let t = 0
let x = 0, y = 0
let vx = 0, vy = 0
let ax = 0, ay = 0
let initx = 0, inity = 0
const w0 = 50
const w1 = 950
const h0 = 70
const h1 = 720
const g = 9.8
const fontSize = 16
let ctx, updater
let xmax, ymax, area, drag, mass, lift
const dt = 0.1

window.onload = () => {
  runSimulation()
  document.getElementById('run').onclick = () => {stop(); runSimulation()}
  document.getElementById('stop').onclick = () => stop()
}

function stop() {
  if (updater) window.clearInterval(updater)
}

function runSimulation() {
  const canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  ctx.font = '16px sans-serif'
  ctx.clearRect(0, 0, 1024, 768)
  const maxLength = getParameter('maxlength')
  const maxHeight = getParameter('maxheight')
  xmax = maxLength * 1000
  ymax = maxHeight * 1000
  ctx.fillText((xmax / 1000).toFixed(0) + ' km', w1, h1)
  ctx.fillText((ymax / 1000).toFixed(0) + ' km', w0, h0)
  ctx.moveTo(w0, h1)
  ctx.lineTo(w1, h1)
  ctx.lineTo(w1, h0)
  ctx.lineTo(w0, h0)
  ctx.lineTo(w0, h1)
  ctx.stroke()
  const v0 = getParameter('speed')
  const angle = getParameter('angle')
  area = getParameter('area')
  drag = getParameter('drag')
  mass = getParameter('mass')
  lift = getParameter('lift')
  vx = v0 * Math.cos(angle * Math.PI / 180)
  vy = v0 * Math.sin(angle * Math.PI / 180)
  initx = 0
  inity = getParameter('height')
  x = initx
  y = inity
  start()
}

function start() {
  updater = window.setInterval(() => {
    if (x > xmax || y > ymax || y < 0) {
      stop()
      return
    }
    update()
    draw()
  }, dt * 1000)
}

function getParameter(name) {
  return parseFloat(document.getElementById(name).value)
}

function update() {
  t = t + dt
  const density = computeDensity(y)
  const fdx = - 1/2 * drag * density * vx * vx * area * Math.sign(vx)
  const fdy = - 1/2 * drag * density * vy * vy * area * Math.sign(vy)
  ax = fdx / mass
  ay = lift - g + fdy / mass
  vx += ax * dt
  vy += ay * dt
  x += vx * dt
  y += vy * dt
}

/**
 * Pressure at sea level is 101325 kPa https://en.wikipedia.org/wiki/U.S._Standard_Atmosphere
 * Pressure is reduced exponentially, at 80 km is 1 pascal
 * From http://acmg.seas.harvard.edu/people/faculty/djj/book/bookchap2.html
 */
function computeDensity(h) {
  const R = 8.31447
  const M = 0.0289644
  const p = 10 ** (5 - h / 16000)
  const T = computeTemperature(h)
  return p * M / ( R * T)
  // 1.225
}

function computeTemperature(h) {
  if (h < 18000) {
    return 288 - 80 * h / 18000
  } else if (h < 50000) {
    return 208 + 60 * (h - 18000) / 32000
  } else {
    return 268 - 80 * (h - 50000) / 30000
  }
}

function draw() {
  ctx.clearRect(0, 0, 1024, fontSize * 3.5)
  ctx.fillText('t = ' + t.toFixed(1) + ' s', 100, fontSize)
  const d = Math.sqrt((x - initx) * (x - initx) + (y - inity) * (y - inity))
  ctx.fillText('d = ' + (d / 1000).toFixed(1) + ' km', 300, fontSize)
  ctx.fillText('x = ' + (x / 1000).toFixed(1) + ' km', 300, fontSize * 2)
  ctx.fillText('y = ' + (y / 1000).toFixed(1) + ' km', 300, fontSize * 3)
  const v = Math.sqrt(vx * vx + vy * vy)
  ctx.fillText('v = ' + (v / 1000).toFixed(1) + ' km/s', 500, fontSize)
  ctx.fillText('vx = ' + (vx / 1000).toFixed(1) + ' km/s', 500, fontSize * 2)
  ctx.fillText('vy = ' + (vy / 1000).toFixed(1) + ' km/s', 500, fontSize * 3)
  const a = Math.sqrt(ax * ax + ay * ay)
  ctx.fillText('a = ' + a.toFixed(2) + ' m/s^2', 700, fontSize)
  ctx.fillText('ax = ' + ax.toFixed(1) + ' m/s^2', 700, fontSize * 2)
  ctx.fillText('ay = ' + ay.toFixed(1) + ' m/s^2', 700, fontSize * 3)
  const px = w0 + (x / xmax) * (w1 - w0)
  const py = h1 - (y / ymax) * (h1 - h0)
  ctx.fillRect(px, py, 1, 1)
}


