import drawTools from './drawTools';

function update() {
  if(MAPEDITOR.paused) return
  let ctx = MAPEDITOR.ctx
  let camera = MAPEDITOR.camera

  if(!GAME.gameState.started && GAME.heros[HERO.id]) {
    const {x, y} = HERO.getSpawnCoords(GAME.heros[HERO.id])
    drawTools.drawObject(ctx, {x: x, y: y - 20.5, width: 1, height: 40, color: 'white'}, camera)
    drawTools.drawObject(ctx, {x: x - 20.5, y: y, width: 40, height: 1, color: 'white'}, camera)
  }

  if(!GAME.gameState.started) {
    ctx.setLineDash([5, 15]);
    GAME.objects.forEach((object) => {
      if(object.tags.invisible) {
        drawTools.drawObject(ctx, {...object, tags: {invisible: false }, color: 'rgba(255,255,255,0.6)'}, camera)
      }
    })
    ctx.setLineDash([]);
  }

  const { draggingObject, copiedObject, objectHighlighted, objectHighlightedChildren, resizingObject, pathfindingLimit, draggingRelativeObject } = MAPEDITOR

  if(objectHighlighted) {
    let color = 'rgba(255,255,255,0.2)'
    if(objectHighlighted.tags && objectHighlighted.tags.invisible && objectHighlightedChildren.length === 0 && (!resizingObject || objectHighlighted.id !== resizingObject.id)) {
      color = 'rgba(255,255,255,0.6)'
    }

    // if(objectHighlighted.tags && objectHighlighted.tags.subObject) {
    //   const
    //   drawTools.drawFilledObject(ctx, {...objectHighlighted, color x: }, camera)
    // } else {
      drawTools.drawFilledObject(ctx, {...objectHighlighted, color}, camera)
    // }

    if(!GAME.gameState.started) {
      const {x, y} = OBJECTS.getSpawnCoords(objectHighlighted)
      drawTools.drawObject(ctx, {x: x, y: y - 20.5, width: 1, height: 40, color: 'white'}, camera)
      drawTools.drawObject(ctx, {x: x - 20.5, y: y, width: 40, height: 1, color: 'white'}, camera)
    }
  }

  if(objectHighlightedChildren) {
    let color = 'rgba(255,255,255,0.1)'
    objectHighlightedChildren.forEach((object) => {
      if(object.tags && object.tags.invisible) {
        color = 'rgba(255,255,255,0.4)'
      }
      drawTools.drawFilledObject(ctx, {...object, color}, camera)
    })
  }

  let currentObject = resizingObject || pathfindingLimit || draggingObject || copiedObject || draggingRelativeObject
  if(currentObject) {
    if(currentObject.tags && currentObject.tags.invisible) {
      drawTools.drawObject(ctx, {...currentObject, tags: {invisible: false, filled: true}, color: 'rgba(255,255,255,0.2)'}, camera)
    } else {
      drawTools.drawObject(ctx, currentObject, camera)
      if(currentObject.constructParts) {
        drawTools.drawConstructParts(ctx, camera, currentObject)
      }
    }
  }

  if(draggingRelativeObject) {
    const owner = OBJECTS.getOwner(draggingRelativeObject)
    drawTools.drawLine(ctx, { x: owner.x + owner.width/2, y: owner.y + owner.height/2 }, { x: draggingRelativeObject.x + draggingRelativeObject.width/2, y: draggingRelativeObject.y + draggingRelativeObject.height/2 }, {color: 'white', thickness: 5 }, camera)
  }
}

export default {
  update
}
