import gridTool from './grid.js'
import physics from './physics.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'

function init() {

  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////
  if(window.host) {

    // EDITOR CALLS THIS
  	window.socket.on('onAddObjects', (objectsAdded) => {
  		window.objects.push(...objectsAdded)
  		objectsAdded.forEach((object) => {
  			physics.addObject(object)
        window.objectsById[object.id] = object
  		})

      if(window.grid.nodes && !window.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

    // EDITOR CALLS THIS
  	window.socket.on('onResetObjects', (updatedObjects) => {
  		window.objects.forEach((object) => {
        if(object.removed) return

  			physics.removeObject(object)
  		})
  		window.objects = []
      window.objectsById = {}

      if(!window.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

    // EDITOR CALLS THIS
  	window.socket.on('onEditObjects', (editedObjects) => {
      editedObjects.forEach((obj) => {
        window.mergeDeep(window.objectsById[obj.id], obj)
      })
      if(!window.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

    // EDITOR CALLS THIS
  	window.socket.on('onSnapAllObjectsToGrid', () => {
  		window.snapAllObjectsToGrid()
  	})

    // EDITOR CALLS THIS
    window.socket.on('onAnticipateObject', (object) => {
  		window.anticipatedObject = object
  	})

    // EDITOR CALLS THIS
    window.socket.on('onStartGame', () => {
      if(window.defaultGame) {
        window.defaultGame.start()
      }
      if(window.customGame) {
        window.customGame.start()
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  /// for players
  ///////////////////////////////
  // EDITOR CALLS THIS
  if(window.isPlayer) {
    window.socket.on('onResetHero', (hero) => {
      if(hero.id === window.hero.id) {
        window.resetHero()
      }
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      if(hero.id === window.hero.id) {
        window.respawnHero()
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  /// only events for non hosts
  ///////////////////////////////
  if(!window.host) {
    // EDITOR CALLS THIS
    window.socket.on('onResetObjects', () => {
      window.objects = []
    })

    // client host calls this
    window.socket.on('onUpdateGameState', (gameState) => {
      window.gameState = gameState
      if(window.usePlayEditor && window.syncGameStateToggle.checked) {
        window.gamestateeditor.set(gameState)
      }
    })
  }

  if(window.editorPlayer || window.usePlayEditor) {
    // CLIENT HOST CALLS THIS
    window.socket.on('onUpdateObjects', (objectsUpdated) => {
      window.objects = objectsUpdated
      window.objectsById = window.objects.reduce((prev, next) => {
        prev[next.id] = next
        return prev
      }, {})

      if(window.usePlayEditor && window.editingObject.i >= 0) {
        window.mergeDeep(window.editingObject, objectsUpdated[window.editingObject.i])
        if(window.syncObjectsToggle.checked) {
          window.objecteditor.set(window.editingObject)
          window.objecteditor.expandAll()
        }
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////

  // EDITOR CALLS THIS
  window.socket.on('onResetWorld', () => {
    window.world = JSON.parse(JSON.stringify(window.defaultWorld))
    camera.clearLimit()
    gridTool.updateGridObstacles()
    window.resetPaths = true
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    window.socket.emit('updateWorld', window.world)
  })

  // CLIENT HOST CALLS THIS
  window.socket.on('onHeroPosUpdate', (heroUpdated) => {
    if(!window.heros[heroUpdated.id]) {
      window.heros[heroUpdated.id] = {}
    }

    if(window.usePlayEditor) {
      window.mergeDeep(window.heros[heroUpdated.id], heroUpdated)
      if(window.editingHero.id === heroUpdated.id) {
        window.editingHero = heroUpdated
        if(window.world.syncHero) {
          window.setEditingHero(heroUpdated)
        }
      }
    } else {
      if(window.hero.id !== heroUpdated.id) {
        window.mergeDeep(window.heros[heroUpdated.id], heroUpdated)
      }
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
  	for(let key in updatedWorld) {
  		const value = updatedWorld[key]

      if(window.world[key] instanceof Object) {
        window.mergeDeep(window.world[key], value)
      } else {
        window.world[key] = value
      }

      // no need to over write nested values ( flags, tags )
  		if(key === 'lockCamera' && !window.usePlayEditor) {
  			if(value && value.limitX) {
  				camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
  			} else {
  				camera.clearLimit();
  			}
  		}

      if(key === 'gameBoundaries') {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }

      if(key === 'globalTags') {
        for(let tag in updatedWorld.globalTags) {
          if(tag === 'syncHero' && window.usePlayEditor) {
            window.syncHeroToggle.checked = value
          }
          if(tag === 'syncObjects' && window.usePlayEditor) {
            window.shouldRestoreHeroToggle.checked = value
          }
          if(tag === 'calculatePathCollisions' && window.grid.nodes) {
            gridTool.updateGridObstacles()
            if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
          }
        }
      }
  	}

    if(window.usePlayEditor) {
      window.worldeditor.set(window.world)
      window.worldeditor.expandAll()
    }
  })

  // CLIENT HOST CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
  	if(!window.heros[updatedHero.id]) window.heros[updatedHero.id] = {}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== window.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.heros[updatedHero.id])
  	}

    window.mergeDeep(window.heros[updatedHero.id], updatedHero)

  	if(window.hero && updatedHero.id === window.hero.id){
  		window.resetHero(updatedHero)
  	}

    if(window.usePlayEditor){
      if(!window.editingHero.id) {
        window.setEditorToAnyHero()
      }
  	}
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveObject', (object) => {
    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objectsById[object.id].removed = true
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onDeleteObject', (object) => {
    if(window.usePlayEditor && window.editingObject.id === object.id) {
      window.editingObject = {
        id: null,
        i: null,
      }
      window.objecteditor.set({})
    }

    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objects = window.objects.filter((obj) => obj.id !== object.id)
    delete window.objectsById[object.id]

    if(window.host) {
      physics.removeObjectById(object.id)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    window.grid = grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (id) => {
    delete window.heros[id]
    if(window.usePlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
  window.socket.emit('askRestoreCurrentGame')
  window.socket.on('onAskRestoreCurrentGame', (game) => {
    window.game = game
    // objects
    window.objects = game.objects
    if(!window.objectsById) window.objectsById = {}
    window.objects.forEach((object) => {
      window.objectsById[object.id] = object
      physics.addObject(object)
    })

    // hero
    // if this is the first reload in a hackathon session we probably wont have a locally stored hero yet
    window.heros = game.heros
    if(!window.hero && window.isPlayer) {
      findHeroInNewWorld(game)
    }


    // world
    window.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)

    // grid
    window.grid = game.grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      console.log('host')
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    } else if(window.usePlayEditor) {
      console.log('editor')
    } else {
      console.log('non host')
    }

    // gameState
    // if game state is on the object it very likely means it has already been loaded..
    if(game.gameState) {
      window.gameState = game.gameState
    }

    window.tags = JSON.parse(JSON.stringify(window.defaultTags))

    window.changeGame(game.id)
    if(!window.gameState.loaded && window.host) {
      /// didnt get to init because it wasnt set yet
      if(window.customGame) {
        window.customGame.init()
      }

      /// DEFAULT GAME FX
      if(window.defaultGame) {
        window.defaultGame.loaded()
      }
      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.init()
        window.customGame.loaded()
      }

      window.gameState.loaded = true
    }

    window.onGameLoaded()
  })

  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    window.game = game

    // if theres already a game going on, need to unload it
    if(window.objects.length) {
      if(window.usePlayEditor) {
        window.editingObject = {
          id: null,
          i: null,
        }
        window.objecteditor.set({})
      } else {
        window.objects.forEach((object) => {
          physics.removeObjectById(object.id)
        })
      }
    }

    // objects
    window.objects = game.objects
    if(!window.objectsById) window.objectsById = {}
    window.objects.forEach((object) => {
      window.objectsById[object.id] = object
      physics.addObject(object)
    })

    // heros
    window.heros = game.heros

    // world
    window.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)

    // grid
    window.grid = game.grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    // reset to initial positions and state
    if(window.host) {
      findHeroInNewWorld(game)
    } else {
      // by default we reset all spawned objects
      window.resetSpawnAreasAndObjects()
    }

    // reset game state
    window.gameState = {}

    // reset tags to default
    window.tags = JSON.parse(JSON.stringify(window.defaultTags))

    /// CUSTOM GAME FX
    window.changeGame(game.id)
    if(window.customGame) {
      // if we've set the game it means it didnt happen on page load.
      // so we need to init it as well..
      window.customGame.init()
      if(window.host) {
        window.customGame.loaded()
      }
    }
    window.gameState.loaded = true
  })
}

export default {
  init
}


function findHeroInNewWorld(game) {
  // if we have decided to restore position, find hero in hero list
  if(game.world.globalTags.shouldRestoreHero) {
    for(var heroId in game.heros) {
      let currentHero = game.heros[heroId]
      if(currentHero.id == window.hero.id) {
        window.hero = currentHero
        return
      }
    }
    console.log('failed to find hero with id' + window.hero.id)
  }

  if(!game.world.globalTags.isAsymmetric) {
    // save current users id to the world.hero object and then store all other variables as the new hero
    game.hero.id = window.hero.id
    window.hero = game.hero
    // but then also respawn the hero
    window.respawnHero()
    return
  }





  // other random bullshit if theres two different versions of the hero
  if(!Object.keys(game.heros).length) {
    window.hero.x = window.world.worldSpawnPointX
    window.hero.y = window.world.worldSpawnPointY
  }
  for(var heroId in game.heros) {
    let currentHero = game.heros[heroId]
    if(currentHero.id == window.hero.id) {
      window.hero = currentHero
      return
    }
  }
  for(var heroId in game.heros) {
    let currentHero = game.heros[heroId]
    if(currentHero.tags.isPlayer) {
      window.hero = currentHero
      return
    }
  }

  window.hero = game.heros[heroId]
}
