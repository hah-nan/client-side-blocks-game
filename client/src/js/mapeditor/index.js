import gridUtil from '../utils/grid.js'
import collisionsUtil from '../utils/collisions'
import contextMenu from './contextMenu.jsx'
import selectionTools from './selectionTools';
import keyInput from './keyInput';
import render from './render';
import Camera from '../map/camera'

class MapEditor{
  constructor() {
    this.initState()
  }

  initState() {
    this.clickStart = {
      x: null,
      y: null,
    }

    this.mousePos = {
      x: null,
      y: null,
    }

    this.dragStart = {
      x: null,
      y: null,
    }

    this.copiedObject = null
    this.objectHighlighted = null
    this.resizingObject = null
    this.draggingObject = null
    this.draggingRelativeObject = null
    this.snapToGrid = true
    this.pathfindingLimit = null
    this.isSettingPathfindingLimit = false
    this.paused = false
  }

  set(ctx, canvas, camera) {
    MAPEDITOR.ctx = ctx
    MAPEDITOR.canvas = canvas
    MAPEDITOR.camera = camera

    canvas.addEventListener("mousedown", (e) => {
      if(!MAPEDITOR.paused) handleMouseDown(event)
    })
    canvas.addEventListener("mousemove", (e) => {
      if(!MAPEDITOR.paused) handleMouseMove(event)
    })
    canvas.addEventListener("mouseup", (e) => {
       if(!MAPEDITOR.paused) handleMouseUp(event)
    })
    canvas.addEventListener("mouseout", (e) => {
       if(!MAPEDITOR.paused) handleMouseOut(event)
    })

    contextMenu.init(MAPEDITOR)
    keyInput.init()
  }

  openConstructEditor(object) {
    CONSTRUCTEDITOR.set(MAPEDITOR.ctx, MAPEDITOR.canvas, new Camera())
    CONSTRUCTEDITOR.start(object)
    window.socket.emit('editGameState', { paused: true })

    MAPEDITOR.initState()
    MAPEDITOR.pause()

    const removeListener = window.local.on('onConstructEditorClose', ({constructParts, x, y, width, height}) => {
      if(constructParts) {
        window.socket.emit('editObjects', [{ id: object.id, constructParts, spawnPointX: x, spawnPointY:y, x, y, width, height}])
      }
      window.socket.emit('editGameState', { paused: false })
      MAPEDITOR.resume()
      removeListener()
    })
  }

  pause() {
    MAPEDITOR.paused = true
  }

  resume() {
    MAPEDITOR.paused = false
  }

  onUpdate(delta) {
    if(MAPEDITOR.remoteState && !MAPEDITOR.skipRemoteStateUpdate) {
      updateGridHighlight(MAPEDITOR.remoteState.mousePos)
    }

    if(!PAGE.role.isGhost && PAGE.role.isPlayer && GAME.heros[HERO.id]) {
      window.socket.emit('sendHeroMapEditor', { mousePos: MAPEDITOR.mousePos } , HERO.id)
    }
  }

  startResize(object, options = { snapToGrid: true }) {
    MAPEDITOR.snapToGrid = options.snapToGrid
    MAPEDITOR.resizingObject = JSON.parse(JSON.stringify(object))
  }

  onStartSetPathfindingLimit(object) {
    MAPEDITOR.isSettingPathfindingLimit = true
    document.body.style.cursor = "crosshair";
  }

  onStartDrag(object) {
    MAPEDITOR.draggingObject = JSON.parse(JSON.stringify(object))
  }

  startRelativeDrag(object, options = { snapToGrid: false }) {
    MAPEDITOR.snapToGrid = options.snapToGrid
    const owner = OBJECTS.getOwner(object)
    object.angle = 0
    owner.angle = 0
    MAPEDITOR.draggingRelativeObject = JSON.parse(JSON.stringify(object))
  }

  onCopy(object) {
    MAPEDITOR.copiedObject = JSON.parse(JSON.stringify(object))
    delete MAPEDITOR.copiedObject.id
  }

  onRender() {
    render.update()
  }

  onSendHeroMapEditor(remoteState, heroId) {
    if(GAME.heros[HERO.id] && HERO.id === heroId) {
      MAPEDITOR.remoteState = remoteState
    }
  }

  onAskHeroToNameObject(object, heroId) {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && HERO.id === heroId) {
      modals.nameObject(object)
    }
  }

  onAskHeroToWriteDialogue(object, heroId) {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && HERO.id === heroId) {
      modals.writeDialogue(object)
    }
  }

  networkEditObject(object, update) {
    if(object.tags.subObject && object.subObjectName && object.ownerId) {
      const owner = OBJECTS.getOwner(object)
      window.socket.emit('editSubObject', object.ownerId, object.subObjectName, update)
    } else if(object.tags.hero) {
      window.socket.emit('editHero', {id: object.id, ...update})
    } else {
      window.socket.emit('editObjects', [{id: object.id, ...update}])
    }
  }

  deleteObject(object) {
    if(object.tags.subObject && object.subObjectName && object.ownerId) {
      const owner = OBJECTS.getOwner(object)
      window.socket.emit('deleteSubObject', owner, object.subObjectName)
    } else if(object.tags.hero) {
      window.socket.emit('deleteHero', object)
    } else if(object.id) {
      window.socket.emit('deleteObject', object)
    } else {
      console.error('trying to delete object without id')
    }

    window.objectHighlighted = null
  }

  removeObject(object) {
    if(object.tags.subObject && object.subObjectName && object.ownerId) {
      window.socket.emit('removeSubObject', object.ownerId, object.subObjectName)
    } else if(object.tags.hero) {
      window.socket.emit('removeHero', object)
    } else {
      window.socket.emit('removeObject', object)
    }
  }
}

function handleMouseUp(event) {
  const { camera } = MAPEDITOR
  let clickEndX = ((event.offsetX + camera.x) / camera.multiplier)
  let clickEndY = ((event.offsetY + camera.y) / camera.multiplier)
}

function handleMouseDown(event) {
  const { camera, networkEditObject } = MAPEDITOR

  MAPEDITOR.clickStart.x = ((event.offsetX + camera.x) / camera.multiplier)
  MAPEDITOR.clickStart.y = ((event.offsetY + camera.y) / camera.multiplier)

  if(MAPEDITOR.copiedObject) {
    OBJECTS.create([MAPEDITOR.copiedObject])
    MAPEDITOR.copiedObject = null
  } else if(MAPEDITOR.isSettingPathfindingLimit) {
    if(MAPEDITOR.pathfindingLimit) {
      const { pathfindingLimit, objectHighlighted } = MAPEDITOR
      gridUtil.snapDragToGrid(pathfindingLimit, {dragging: true})
      networkEditObject(objectHighlighted, {id: objectHighlighted.id, pathfindingLimit, path: null})
      document.body.style.cursor = "default";
      MAPEDITOR.isSettingPathfindingLimit = false
      MAPEDITOR.pathfindingLimit = null
    } else {
      MAPEDITOR.pathfindingLimit = { ...MAPEDITOR.clickStart }
      MAPEDITOR.pathfindingLimit.width = 0
      MAPEDITOR.pathfindingLimit.height = 0
    }
  } else if(MAPEDITOR.resizingObject) {
    const { resizingObject } = MAPEDITOR
    networkEditObject(resizingObject, {id: resizingObject.id, x: resizingObject.x, y: resizingObject.y, width: resizingObject.width, height: resizingObject.height})
    MAPEDITOR.resizingObject = null
  } else if(MAPEDITOR.draggingObject) {
    const { draggingObject } = MAPEDITOR
    if(draggingObject.constructParts) {
      networkEditObject(draggingObject, {id: draggingObject.id, spawnPointX: draggingObject.x, y: draggingObject.y, spawnPointY: draggingObject.y, x: draggingObject.x, y: draggingObject.y, constructParts: draggingObject.constructParts})
    } else if(GAME.gameState.started) {
      networkEditObject(draggingObject, {id: draggingObject.id, x: draggingObject.x, y: draggingObject.y})
    } else {
      networkEditObject(draggingObject, {id: draggingObject.id, x: draggingObject.x, spawnPointX: draggingObject.x, y: draggingObject.y, spawnPointY: draggingObject.spawnPointY})
    }
    MAPEDITOR.draggingObject = null
  } else if(MAPEDITOR.draggingRelativeObject) {
    const { draggingRelativeObject } = MAPEDITOR
    const owner = OBJECTS.getOwner(draggingRelativeObject)
    const { relativeX, relativeY } = OBJECTS.getRelativeCenterXY(draggingRelativeObject, owner)
    networkEditObject(draggingRelativeObject, {id: draggingRelativeObject.id, relativeX, relativeY })
    MAPEDITOR.draggingRelativeObject = null
  }

  MAPEDITOR.snapToGrid = true
}

function handleMouseOut(event) {
  if(PAGE.role.isGhost) {
    MAPEDITOR.skipRemoteStateUpdate = false
  }
}

function handleMouseMove(event) {
  const { camera } = MAPEDITOR

  if(PAGE.role.isGhost) {
    MAPEDITOR.skipRemoteStateUpdate = true
  }

  MAPEDITOR.mousePos.x = ((event.offsetX + camera.x) / camera.multiplier)
  MAPEDITOR.mousePos.y = ((event.offsetY + camera.y) / camera.multiplier)

  if(MAPEDITOR.draggingRelativeObject) {
    updateDraggingObject(MAPEDITOR.draggingRelativeObject)
  } else if(MAPEDITOR.copiedObject) {
    updateDraggingObject(MAPEDITOR.copiedObject)
  } else if(MAPEDITOR.isSettingPathfindingLimit) {
    if(MAPEDITOR.pathfindingLimit) {
      updateResizingObject(MAPEDITOR.pathfindingLimit, { allowTiny: false })
    }
  } else if(MAPEDITOR.resizingObject) {
    updateResizingObject(MAPEDITOR.resizingObject)
  } else if(MAPEDITOR.draggingObject) {
    updateDraggingObject(MAPEDITOR.draggingObject)
  } else {
    updateGridHighlight({x: MAPEDITOR.mousePos.x, y: MAPEDITOR.mousePos.y})
  }
}

function updateGridHighlight(location) {
  if(MAPEDITOR.contextMenuVisible) return

  const { x,y } = gridUtil.snapXYToGrid(location.x, location.y, { closest: false })

  let mouseLocation = {
    x,
    y,
    width: GAME.grid.nodeSize,
    height: GAME.grid.nodeSize
  }

  MAPEDITOR.objectHighlighted = mouseLocation

  // find the smallest one stacked up
  let smallestObject = selectionTools.findSmallestObjectInArea(mouseLocation, GAME.objects)

  collisionsUtil.check(mouseLocation, GAME.heroList, (hero) => {
    if(hero.removed) return
    smallestObject = JSON.parse(JSON.stringify(hero))
  })

  if(smallestObject) MAPEDITOR.objectHighlighted = JSON.parse(JSON.stringify(smallestObject))

  MAPEDITOR.objectHighlightedChildren = []
  if(MAPEDITOR.objectHighlighted.id) {
    // see if grid high light has children or is child
    const { parent, children } = selectionTools.getObjectRelations(MAPEDITOR.objectHighlighted, GAME)
    if(parent.constructParts) {
      MAPEDITOR.objectHighlighted = parent
    } else if(children.length && parent.id === MAPEDITOR.objectHighlighted.id) {
      MAPEDITOR.objectHighlighted = parent
      MAPEDITOR.objectHighlightedChildren = children
    }
  }
}

function updateResizingObject(object, options = { allowTiny : true }) {
  const { mousePos } = MAPEDITOR
  if(mousePos.x < object.x || mousePos.y < object.y) {
    return
  }
  object.width = mousePos.x - object.x
  object.height = mousePos.y - object.y

  let tinySize
  if(object.width < GAME.grid.nodeSize - 4 && object.height < GAME.grid.nodeSize - 4 && options.allowTiny) {
    tinySize = object.width
  }

  if(MAPEDITOR.snapToGrid) {
    if(tinySize) {
      gridUtil.snapTinyObjectToGrid(object, tinySize)
    } else {
      gridUtil.snapDragToGrid(object)
    }
  }
}

function updateDraggingObject(object) {
  const { mousePos } = MAPEDITOR

  const startX = object.x
  const startY = object.y

  object.x = mousePos.x
  object.y = mousePos.y

  let tinySize
  if(object.width < GAME.grid.nodeSize - 4 && object.height < GAME.grid.nodeSize - 4) {
    tinySize = object.width
  }

  if(MAPEDITOR.snapToGrid) {
    if(tinySize) {
      gridUtil.snapTinyObjectToGrid(object, tinySize)
    } else {
      gridUtil.snapDragToGrid(object)
    }
  }

  const diffX = object.x - startX
  const diffY = object.y - startY

  if(object.constructParts) {
    object.constructParts.forEach((part) => {
      part.x+= diffX
      part.y+= diffY
      return part
    })
  }
}

window.MAPEDITOR = new MapEditor()
