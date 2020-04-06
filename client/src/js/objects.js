import physics from './physics.js'
import pathfinding from './pathfinding.js'
import collisions from './collisions'
import grid from './grid.js'

function init() {
  window.defaultObject = {
    velocityX: 0,
    velocityY: 0,
    velocityMax: 100,
    speed: 100,
    color: '#999',
    // cant put objects in it cuz of some pass by reference BS...
  }
}

window.anticipateObjectAdd = function() {
  const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = window.getViewBoundaries(window.hero)

  let isWall = window.anticipatedObject.wall

  if (leftDiff < 1 && window.hero.directions.left) {
    let newObject = {
      x: minX - window.grid.nodeSize,
      y: isWall ? minY + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
      width: window.grid.nodeSize,
      height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (window.grid.nodeSize * 3) : window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (topDiff < 1 && window.hero.directions.up) {
    let newObject = {
      x: isWall ? minX + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
      y: minY - window.grid.nodeSize,
      width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
      height: window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (rightDiff > window.grid.nodeSize - 1 && window.hero.directions.right) {
    let newObject = {
      x: maxX + window.grid.nodeSize,
      y: isWall ? minY + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
      width: window.grid.nodeSize,
      height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (bottomDiff > window.grid.nodeSize - 1 && window.hero.directions.down) {
    let newObject = {
      x: isWall ? minX + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
      y: maxY + window.grid.nodeSize,
      width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
      height: window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  }

  function addAnticipatedObject(newObject) {
    let {x , y} = grid.snapXYToGrid(newObject.x, newObject.y)
    if(grid.keepGridXYWithinBoundaries(x/window.grid.nodeSize, y/window.grid.nodeSize)) {
      window.addObjects([{...newObject, ...window.anticipatedObject}])
      window.anticipatedObject = null
    }
  }
}

window.addObjects = function(objects, options = { bypassCollisions: false, instantAdd: true }) {
  if(!objects.length) {
    objects = [objects]
  }

  let alertAboutCollision

  objects = objects.map((newObject) => {
    Object.assign(newObject, {...window.defaultObject})

    if(!newObject.id){
      newObject.id = 'object' + Date.now();
    }

    if(!newObject.tags){
      newObject.tags = {};
    }

    for(let tag in window.tags) {
      if((window.usePlayEditor && window.tagEls[tag].checked) || newObject.tags[tag] === true){
        if(tag === 'monster' && window.usePlayEditor && !(window.world.worldSpawnPointX >= 0 || window.editingHero.spawnPointX >= 0)) {
          alert('You cannot add a monster without setting spawn point first')
          return
        }
        newObject.tags[tag] = true
      } else {
        newObject.tags[tag] = false
      }
    }

    newObject.spawnPointX = newObject.x
    newObject.spawnPointY = newObject.y

    if(!window.world.globalTags.calculatePathCollisions) {
      grid.addObstacle(newObject)
    }

    if(newObject.tags.obstacle && collisions.check(newObject, window.objects) && !options.bypassCollisions) {
      alertAboutCollision = true
    }

    //ALWAYS CONTAIN WITHIN BOUNDARIES OF THE GRID!!
    if(newObject.x + newObject.width > (window.grid.nodeSize * window.grid.width) + window.grid.startX) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }
    if(newObject.y + newObject.height > (window.grid.nodeSize * window.grid.height) + window.grid.startY) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }
    if(newObject.x < window.grid.startX) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }
    if(newObject.y < window.grid.startY) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }

    return newObject
  }).filter(obj => !!obj)

  if(window.host){
    window.objects.push(...objects)
    objects.forEach((object) => {
      if(object.removed) return
      window.objectsById[object.id] = object
      physics.addObject(object)
    })

    if(!window.world.globalTags.calculatePathCollisions) {
      grid.updateGridObstacles()
      window.resetPaths = true
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
    return objects
  }

  if(alertAboutCollision) {
    if(confirm('already an object on this grid node..confirm to add anyways')) {
      emitNewObjects()
    }
  } else {
    emitNewObjects()
  }

  function emitNewObjects() {
    if(window.instantAddToggle.checked || options.instantAddToggle) {
      // need to do a local add first
      window.objects.push(...objects)
      window.socket.emit('addObjects', objects)
    } else {
      window.objectFactory.push(...objects)
    }
  }

  return objects
}


export default {
  init
}
