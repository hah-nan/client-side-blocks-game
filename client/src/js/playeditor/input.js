const keysDown = {}

let justChangedHerosLeft = false
let justChangedHerosRight = false

function init(hero){
  window.addEventListener("keydown", function (e) {
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }

    delete keysDown['83']
    delete keysDown['67']
    keysDown[e.keyCode] = true

    //if you press escape, cancel a drag
    if(e.keyCode === 27) {
      window.clickStart.x = null
      window.clickStart.y = null

      if(window.currentTool === window.TOOLS.CUSTOM_GAME) {
        window.onChangeTool(window.TOOLS.ADD_OBJECT)
      }
    }

    if(keysDown['32']){
      console.log('x: ' + window.mousePos.x, ', y: ' + window.mousePos.y)
      return
    }

    if(keysDown['91']) {
      //s
      if(keysDown['83']){
        if(window.currentTool === window.TOOLS.CUSTOM_GAME) {
          window.saveCodeEditor()
          document.getElementById("is-code-editor-saved").innerHTML = "Saved"
        } else if((window.currentTool === window.TOOLS.ADD_OBJECT || window.currentTool == window.TOOLS.SIMPLE_EDITOR) && !window.objecteditor.live) {
          window.saveCompendiumObject(window.objecteditor.get())
        }
        e.preventDefault()
      }

      //c
      if(keysDown['67']){
        if(window.currentTool === window.TOOLS.ADD_OBJECT || window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
          window.addToCompendium(window.objecteditor.get())
        }
      }
    }


    // if shift +
    if(keysDown['16']) {

      // q and a zoom in and out
      if(e.keyCode === 81) {
        window.scaleMultiplier = window.scaleMultiplier * 1.1
      }
      if(e.keyCode === 65) {
        window.scaleMultiplier = window.scaleMultiplier * .9
      }

      //, .
      if(keysDown['188'] || keysDown['190']){
        if(Object.keys(window.heros).length === 1 || !window.editingHero.id) {
          for(var heroId in window.heros) {
            window.setEditingHero(window.heros[heroId])
            window.findHero()
          }
          return
        }
      }

      //select left
      if(keysDown['188']){
        let heroNames = Object.keys(window.heros)
        for(let i = 0; i < heroNames.length; i++) {
          if(window.heros[heroNames[i]].id === window.editingHero.id) {
            if(i === 0) {
              window.setEditingHero(window.heros[heroNames[heroNames.length-1]])
            } else {
              window.setEditingHero(window.heros[heroNames[i-1]])
            }
            window.findHero()

            break;
          }
        }
        return
      }

      //select right
      if(keysDown['190']){
        let heroNames = Object.keys(window.heros)
        for(let i = 0; i < heroNames.length; i++) {
          if(window.heros[heroNames[i]].id === window.editingHero.id) {
            if(i === heroNames.length - 1) {
              window.setEditingHero(window.heros[heroNames[0]])
            } else {
              window.setEditingHero(window.heros[heroNames[i+1]])
            }
            window.findHero()

            break;
          }
        }
        return
      }

      // right
      if(keysDown['222']){
        let editorState = window.objecteditor.get()

        if(window.objects.length == 0) return
        let newI = editorState.i
        if(editorState.i === window.objects.length -1 || editorState.i == null) {
          newI = 0
        } else {
          newI += 1
        }
        let editingObject = window.objects[newI]
        editingObject.i = newI
        window.objecteditor.set(editingObject)
        window.updateObjectEditorNotifier()
        window.findObject(editingObject)
      }

      //left
      if(keysDown['186']){
        let editorState = window.objecteditor.get()
        if(window.objects.length == 0) return
        let newI = editorState.i
        if(!editorState.i) {
          newI = window.objects.length - 1
        } else {
          newI -= 1
        }
        let editingObject = window.objects[newI]
        editingObject.i = newI
        window.objecteditor.set(editingObject)
        window.updateObjectEditorNotifier()
        window.findObject(editingObject)
      }
    }

  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)
}

function update(delta) {
  if (38 in keysDown) { // Player holding up
    window.camera.y -= (40 * window.scaleMultiplier)
  }
  if (40 in keysDown) { // Player holding down
    window.camera.y += (40 * window.scaleMultiplier)
  }
  if (37 in keysDown) { // Player holding left
    window.camera.x -= (40 * window.scaleMultiplier)
  }
  if (39 in keysDown) { // Player holding right
    window.camera.x += (40 * window.scaleMultiplier)
  }
}

export default {
  init,
  update,
}
