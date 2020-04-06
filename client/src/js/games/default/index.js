import collisions from '../../collisions'
import gridTool from '../../grid.js'
import camera from '../../camera.js'
import pathfinding from '../../pathfinding.js'
import action from './action'
import particles from '../../particles.js'

// we organize the code on the front end, default values, etc
// happens on every load, including reload
// on client and editor
function init() {

}

// once we have loaded up the game from the server for the first time, not on reload
// interact with other values and setup initial game state
// only on client
function loaded() {

}

// called by editor or player
// only on client
function start() {

}

// only on client
function onKeyDown(keysDown) {
  if(90 in keysDown) {
    if(window.hero.actionButtonBehavior === 'shootBullet') {
      action.shootBullet()
    }

    if(window.hero.actionButtonBehavior === 'dropWall') {
      action.dropWall()
    }
  }
}

// only on client
function input(keysDown, delta) {
  if(window.hero.flags.paused || window.gameState.paused) return

}

// only on client
function intelligence(object, delta) {
  if(object.tags && object.tags['zombie']) {
    object.target = { x: window.hero.x, y: window.hero.y }
  }

  if(object.tags && object.tags['homing']) {
    if(!object.path || (object.path && !object.path.length)) {
      const { x, y } = gridTool.convertToGridXY(object)
      object.gridX = x
      object.gridY = y

      const heroGridPos = gridTool.convertToGridXY(window.hero)
      window.hero.gridX = heroGridPos.x
      window.hero.gridY = heroGridPos.y

      object.path = pathfinding.findPath({
        x: x,
        y: y,
      }, {
        x: window.hero.gridX,
        y: window.hero.gridY,
      }, object.pathfindingLimit)
    }
  }

  if(object.tags && object.tags['wander']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkAround(object)]
      const { x, y } = gridTool.convertToGridXY(object)
      object.gridX = x
      object.gridY = y
    }
  }

  if(object.tags && object.tags['pacer']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkWithPurpose(object)]
      const { x, y } = gridTool.convertToGridXY(object)
      object.gridX = x
      object.gridY = y
    }
  }

  if(object.tags && object.tags['lemmings']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkIntoWall(object)]
      const { x, y } = gridTool.convertToGridXY(object)
      object.gridX = x
      object.gridY = y
    }
  }

  if(object.tags && object.tags['goomba']) {
    if(object.velocityMax === 0) object.velocityMax = 100

    if(!object.direction) {
      object.direction = 'right'
    }

    if(object.direction === 'right' ) {
      object.velocityX = object.speed || 100
    }

    if(object.direction === 'left') {
      object.velocityX = -object.speed || -100
    }
  }

  if(object.tags && object.tags['goombaSideways']) {
    if(object.velocityMax === 0) object.velocityMax = 100

    if(!object.direction) {
      object.direction = 'down'
    }

    if(object.direction === 'down' ) {
      object.velocityY = object.speed || 100
    }

    if(object.direction === 'up') {
      object.velocityY = -object.speed || -100
    }
  }

  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////
  // ZONE STUFF
  //////////////////////////////////////////
  //////////////////////////////////////////
  if(object.tags && object.tags['spawnZone']) {
    if(!object.spawnedIds) object.spawnedIds = []

    object.spawnedIds = object.spawnedIds.filter((id) => {
      if(window.objectsById[id] && !window.objectsById[id].removed) {
        return true
      } else return false
    })

    if(object.spawnedIds.length < object.spawnTotal && !object.spawnWait && (object.spawnPool === undefined || object.spawnPool === null || object.spawnPool > 0)) {
      let newObject = {
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        id: 'spawned-' + object.spawnedIds.length + object.id + Date.now(),
        ...object.spawnObject,
      }
      // let x = gridTool.getRandomGridWithinXY(object.x, object.x+width)
      // let y = gridTool.getRandomGridWithinXY(object.y, object.y+height)

      let createdObject = window.addObjects([newObject])
      object.spawnedIds.push(createdObject[0].id)
      if(object.spawnPool) object.spawnPool--

      object.spawnWait = true
      setTimeout(() => {
        object.spawnWait = false
      }, object.spawnWaitTime || 1000)
    }
  }
}

// only on client
function onCollide(agent, collider, result, removeObjects) {
  if(collider.tags && agent.tags && collider.tags['bullet'] && agent.tags['monster']) {
    removeObjects.push(agent)
    window.hero.score++
  }

  if(agent.tags && agent.tags['goomba'] && collider.tags && collider.tags['obstacle']) {
    if(result.overlap_x === 1 && agent.direction === 'right') {
      agent.direction = 'left'
    }
    if(result.overlap_x === -1 && agent.direction === 'left') {
      agent.direction = 'right'
    }
  }

  if(agent.tags && agent.tags['goombaSideways'] && collider.tags && collider.tags['obstacle']) {
    if(result.overlap_y === 1 && agent.direction === 'down') {
      agent.direction = 'up'
    }
    if(result.overlap_y === -1 && agent.direction === 'up') {
      agent.direction = 'down'
    }
  }
}

// after input, intel, physics, but before render
// only on client
function update(delta) {
  window.resetPaths = false
}

// only on client
function render(ctx) {
  if(window.hero) {

    // got some gradients to work..
    // let startx = (window.hero.x + 20)/window.camera.multiplier - window.camera.x
    // let starty = (window.hero.y - 40)/window.camera.multiplier - window.camera.y
    // let endx = (window.hero.x + 20)/window.camera.multiplier - window.camera.x
    // let endy = (window.hero.y - 20)/window.camera.multiplier - window.camera.y
    // var cx=250;
    // var cy=250;
    // var r=30;
    // var PI2=Math.PI*2;
    //
    // var gradient=ctx.createLinearGradient(startx,starty, endx, endy);
    // gradient.addColorStop(0.00,"transparent");
    // gradient.addColorStop(1.00,"white");
    //
    // ctx.lineWidth=40/window.camera.multiplier
    // ctx.lineCap="square";
    // ctx.beginPath();
    // ctx.moveTo(startx,starty);
    // ctx.lineTo(endx,endy);
    // ctx.strokeStyle=gradient;
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.arc(75,75,20,0,PI2);
    // ctx.closePath();
    // ctx.fillStyle="gold";
    // ctx.globalAlpha=0.50;
    // ctx.fill();
    // ctx.globalAlpha=1.00;
    //
    // ctx.beginPath();
    // ctx.arc(75,75,20,0,PI2);
    // ctx.closePath();
    // ctx.fillStyle="gold";
    // ctx.shadowColor="gold";
    // ctx.shadowBlur=5;
    // ctx.fill();

    // ctx.strokeStyle = 'white'
    // ctx.lineWidth=1;
    //
    // if(window.hero.directions.down) {
    //   let sWidth = 17.5;
    //   let sHeight = 20;
    //   var path=new Path2D();
    //   let x = window.hero.x/window.camera.multiplier - window.camera.x
    //   let y = (window.hero.y-20)/window.camera.multiplier - window.camera.y
    //   path.moveTo(x + (sWidth/2) +5, y+ sHeight/2);
    //   path.lineTo(x + (sWidth/2), y+ (sHeight/2)-10);
    //   path.lineTo(x + (sWidth/2)-5, y + sHeight/2);
    //   ctx.fill(path);
    // } else {
    //
    // }
  }
}

export default {
  init,
  loaded,
  start,
  onKeyDown,
  input,
  update,
  intelligence,
  render,
  onCollide,
}