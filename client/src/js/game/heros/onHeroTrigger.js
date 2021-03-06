import onHeroUpdate from './onHeroUpdate'
import onTalk from './onTalk'
import onBehavior from './onBehavior'
import onCombat from './onCombat'
import { startQuest, completeQuest } from './quests'
import { pickupObject, withdrawFromInventory } from './inventory'
import { spawnAllNow } from '../spawnZone'

export default function onHeroTrigger(hero, collider, result, options = { fromInteractButton: false }) {
  const isInteraction = options.fromInteractButton
  let triggered = false

  if(!isInteraction) {
    onCombat(hero, collider, result, options)
    triggered = true
  }

  if(collider.mod().tags['skipHeroGravityOnCollide']) {
    hero._skipNextGravity = true
  }

  if(collider.mod().tags['behaviorOnHeroCollide'] && !isInteraction) {
    onBehavior(hero, collider, result, options)
    triggered = true
  }
  if(collider.mod().tags['behaviorOnHeroInteract'] && isInteraction) {
    onBehavior(hero, collider, result, options)
    triggered = true
  }

  if(collider.mod().tags['updateHeroOnHeroCollide'] && !isInteraction) {
    onHeroUpdate(hero, collider, result, options)
    triggered = true
  }

  if(collider.mod().tags['updateHeroOnHeroInteract'] && isInteraction) {
    onHeroUpdate(hero, collider, result, options)
    triggered = true
  }

  if(collider.tags && collider.mod().tags['talker'] && collider.heroDialogue && collider.heroDialogue.length) {
    if(collider.mod().tags['talkOnHeroCollide'] && !isInteraction) {
      onTalk(hero, collider, result, options)
      triggered = true
    }

    if(collider.mod().tags['talkOnHeroInteract'] && isInteraction) {
      onTalk(hero, collider, result, options)
      triggered = true
    }
  }

  if(collider.tags && collider.mod().tags['questGiver'] && collider.questGivingId && hero.quests && hero.questState && hero.questState[collider.questGivingId] && !hero.questState[collider.questGivingId].started && !hero.questState[collider.questGivingId].completed) {
    if(collider.mod().tags['giveQuestOnHeroCollide'] && !isInteraction) {
      startQuest(hero, collider.mod().questGivingId)
      triggered = true
    }
    if(collider.mod().tags['giveQuestOnHeroInteract'] && isInteraction) {
      startQuest(hero, collider.mod().questGivingId)
      triggered = true
    }
  }

  if(collider.tags && collider.mod().tags['questCompleter'] && collider.questCompleterId && hero.quests && hero.questState && hero.questState[collider.questCompleterId] && hero.questState[collider.questCompleterId].started && !hero.questState[collider.questCompleterId].completed) {
    if(collider.mod().tags['completeQuestOnHeroCollide'] && !isInteraction) {
      completeQuest(hero, collider.mod().questCompleterId)
      triggered = true
    }
    if(collider.mod().tags['completeQuestOnHeroInteract'] && isInteraction) {
      completeQuest(hero, collider.mod().questCompleterId)
      triggered = true
    }
  }

  if(collider.tags && collider.mod().tags['cameraShakeOnCollide_quickrumble']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 50, frequency: 10, amplitude: 5})
    triggered = true
  }

  if(collider.tags && collider.mod().tags['cameraShakeOnCollide_longrumble']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 3000, frequency: 10, amplitude: 8 })
    triggered = true
  }

  if(collider.tags && collider.mod().tags['cameraShakeOnCollide_quick']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 50, frequency: 10, amplitude: 24})
    triggered = true
  }

  if(collider.tags && collider.mod().tags['cameraShakeOnCollide_short']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 500, frequency: 20, amplitude: 36 })
    triggered = true
  }

  if(collider.tags && collider.mod().tags['cameraShakeOnCollide_long']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 2000, frequency: 40, amplitude: 36 })
    triggered = true
  }

  if(collider.tags && collider.mod().tags['pickupable'] && collider.mod().tags['pickupOnHeroInteract'] && isInteraction) {
    pickupObject(hero, collider)
    triggered = true
  }

  if(collider.tags && collider.mod().tags['pickupable'] && collider.mod().tags['pickupOnHeroCollide']) {
    pickupObject(hero, collider)
    triggered = true
  }

  if(collider.tags && collider.mod().tags['spawnZone'] && collider.mod().tags['spawnAllInHeroInventoryOnHeroInteract'] && isInteraction) {
    spawnAllNow(collider, hero)
    triggered = true
  }

  if(collider.tags && collider.mod().tags['resourceZone'] && ((collider.mod().tags['resourceWithdrawOnInteract'] && isInteraction) || (collider.mod().tags['resourceWithdrawOnCollide'] && !isInteraction) )) {
    let subObjectNameToWithdraw
    Object.keys(collider.subObjects).forEach((subObjectName) => {
      const so = collider.subObjects[subObjectName]
      const tagsAllowed = collider.resourceTags
      const hasTag = tagsAllowed.some((tag) => {
        return so.tags[tag]
      })
      if(hasTag) subObjectNameToWithdraw = subObjectName
    })
    if(subObjectNameToWithdraw) withdrawFromInventory(hero, collider, subObjectNameToWithdraw, collider.resourceWithdrawAmount)
    triggered = true
  }

  if(collider.tags && collider.mod().tags['resourceZone'] && ((collider.mod().tags['resourceDepositOnInteract'] && isInteraction) || (collider.mod().tags['resourceDepositOnCollide'] && !isInteraction) )) {
    let subObjectNameToWithdraw
    Object.keys(hero.subObjects).forEach((subObjectName) => {
      const so = hero.subObjects[subObjectName]
      const tagsAllowed = collider.resourceTags
      const hasTag = tagsAllowed.some((tag) => {
        return so.tags[tag]
      })
      if(hasTag) subObjectNameToWithdraw = subObjectName
    })

    if(subObjectNameToWithdraw) {
      const so = hero.subObjects[subObjectNameToWithdraw]
      withdrawFromInventory(collider, hero, subObjectNameToWithdraw, so.count)
    }
    triggered = true
  }

  if(collider.tags && triggered && collider.mod().tags['destroyAfterTrigger']) {
    collider._remove = true
  }
}
