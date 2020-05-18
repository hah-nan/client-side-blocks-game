// MAIN CODE THINGS TO UPDATE
// HOST_GAME
// CLIENT_GAME
// revise physics system structure, allow like 'center point' to be changed and have it be used by default.
// ^^ so that rotation isnt a hack
// Rotational velocity also needs to be default.
// re organize parent, relative, owner, etc. What do these really all mean and why??

// event system is NOT named right. onDete vs delete for example. I think that ones good, but like... 'startQuest'
// like whats our patterns. Is it Host Sends event through network -> Host picks up event through network?

//https://github.com/semibran/canvas-paint
//https://github.com/scrapjs/canvas-paint

//http://literallycanvas.com/

// IF A VISUAL ARTIST GETS ON THE MIC HERE...
//https://github.com/jakubfiala/atrament.js

// HONESTLY USING BOX 2D PHYSICS WOULD BE INCREDIBLE
//https://zimjs.com/bits/physics.html

// combine outlined rects so there no overlap
//https://stackoverflow.com/questions/25670455/html5-canvas-merging-to-rectangles-to-form-a-new-shape

//https://turfjs.org/docs/

// if I Want to DO THE PAINTBRUSH TOOL ..I need to 'smooth lines'
// https://github.com/literallycanvas/literallycanvas-core/blob/master/src/shapes.js

// you wanna make some good cursors
//https://www.w3schools.com/cssref/playit.asp?filename=playcss_cursor&preval=alias
//----


// Template sub objects ( from compendium )
// PATHFINDING editor, compendium
// LEVEL UP
// PARTICLE GRAPHICS, BETTER GRAPHICS...
// World templates
// input modifiers....'on ice', 'flat'
// more space bar actions -> 'double jump', 'dash'

// ( Force anticipated add )

// tag idea -> attachAsRelativeOnCollide, attachAsParentOnCollide, (attachAsPermanentParentOnCollide,
// stopGravityOnCollide??
// give tag on collide, give tag when attached
// remove tag on collide, remove tag when attached
//

// call hero updates power ups again

////////////////////////////////////////////////////

// attack button ( like papa bear spears!! )
// set game boundaries to delete objects
// TRUE zelda camera work
// death by jump
// Target/Homing awareness area

// CONTEXT MENU TOOLS
//Set Target, Set Pathfinding Target
// PAINT TOOLS!

//Set to game boundary size
//Increment grid size, game boundary size
//Set all objects to the middle ( FULL MIGRATION )

// hero UPDATE is OK but maybe we can have a TRIGGER function editor. Its a code editor that sends a function to the host that the host saves as that objects effect? have it saved as a string?

// can hero update have a general id? which means effects the hero that collided with it or interacted with it?
// Thats how it exists right now ^^ but can something STORE an id to effect. An object id or hero id. It stores the id so when triggered it find the given object! ohh my...

// implement lodash

// Hole punch tool ( CLICK TO SEPERATE OBJECT INTO TWO AND PUNCH HOLE IN IT) OR // If im adding an object and it collides with another object I want it to like morph around it

// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

// satisfying death animations? satisfing death states or idk.. things?

// switch tag fresh to an _fresh ( actually just go through all object state and make sure its consistent, there are others such as !!!target!!!<---( please make _ ) that could be an underscore property )
// lastHeroUpdateId, velocity? , i gridX, width, etc
//--------
// spencer wants the world to slowly build itself infront of them.... interesintg, npt sure how to do
// Smarter rendering
// INVERT GAME, for example, when you get pacman powers
// planet gravity! Would be cool to have..
// Send player to... x, y ( have them like start to move really fast and possibly pathfind)
// stop player (velocity)
// controlling X or Y scroll. For example. allow X croll, but not Y scroll
// lazy scroll that is not not immediate! Smoother...
// leveling up
// optimize shadow feature, not all vertices!
// striped object!
// Instead of creating one big block, create a bunch of small blocks, OPTION. NO DDO NOT DDO THIS. MAybe make it a design...
// INSTEAD allow for stationary objects that are touching eachother to all be combined! This helps with physics and performance
// Maybe make a diagonal wall..
// path goals AKA patrol
// path 1, path 2, path 3 with conditions
// 'with patience' tag AKA pathfind less often
// 'dont backtrack' tag where they remember where they went

// (Snap to grid Toggle)
// — bring velocity to zero for hero
// — speed up hero
// — slow down hero
// — increase speed parameter
// — decrease speed parameter
// add grid to world editor
//
// Follow whatever you are editing
// editor preferences - zoom, editing object, editing hero, current menu, etc..
// I already have world MODIFIERS, those are the worlds I have just created. Make them world modifiers instead of loaded world?
// Switch tools based on actions!
// Make default clicking actions on the canvas universal regardless of tool.
// set editor to recently added object
// only if user has clicked a special action on the right tool bar will the map clicking behavior change

// Take up more horizontal space on the editor because right now the dimensions are just not right!
// TOP BAR

// confirmation on leaving back without saving or copying. HAve copy option

// editor UI needs to prioritize most time sensitive, most common, most SERIOUS/DANGEROUS options

// have the zoom of the editor get set to the gameBoundaries
// a button for 'zoom to where most objects are' THING WOULD BE GREAT
// CENTER ALL OBJECTS ON GRID ( calculate first and last object ( x and y ) and therefore how much room you can spare
// a try catch that if theres an error, the editor asks for a version of the game from like 1 minute ago
// everytime I switch out of a menu, I want the selected radio buttons to be reset to default

// JUICE IDEAS
/*Trails,
	long trail
	leaving trail ( drops )

have layered border, just draw another version at +2 and +4 and +6, -2 etc..

Shakes
	Object Shakes
	Camera Shakes

FLASHES

Glow

NEON vibe?

Dust particles

Particles being sucked into the player ( POWER!!! )

Splatter

Engine trail on a car u know what I mean?
*/
/*
——
!!!!!!!!!!!!!!
REGARDING PHYSICS, SOMETHING EARLIER ON THE i LIST ( objects ) loose the battle for corrections. They correct for everything else first
just make sure to set something to stationary if its not supposed to be move, or else it will be subject to spawn ( i ) order
*/
import './js/utils/utils.js'
import './js/page/index.js'
import './js/game/index.js'
import './js/arcade/index.js'
import './js/playeditor/playeditor.js'
import './js/constructEditor/index.js'
import './js/map/index.js'
import './js/physics/index.js'
import './js/mapeditor/index.js'
import './js/playerUI/index.js'
import './styles/index.scss'
import './styles/jsoneditor.css'


PAGE.load()
