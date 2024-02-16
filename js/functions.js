// https://pixijs.download/dev/docs/PIXI.Graphics.html

function randInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


// You can use either PIXI.WebGLRenderer or PIXI.CanvasRenderer
let renderer = new PIXI.autoDetectRenderer(
    $(window).width(),
    $(window).height()
)

//Append the renderer to the DOM
document.body.appendChild(renderer.view)

//declare all letiables
let body = document.body
let main_layer_zoom_scale = 1
let main_layer_zoom_scalemax = 10
let main_layer_zoom_scalemin = 1
let main_layer_zoom_offset_x = 0
let main_layer_zoom_offset_y = 0

//Used to check if mouse is down
let mousedown = false

let mainLayer = new PIXI.DisplayObjectContainer()
let stage = new PIXI.Stage()
let graphicLayer = new PIXI.DisplayObjectContainer()

//Setup the stage properties
stage.setBackgroundColor(0xcccccc)

//Build object styles


// XXX: import lessons learned: 

let methods = {
    slow: {
        before: () => null,
        inside: (ctx, x, y) => {
            let testGraphic = new PIXI.Graphics()
        
            testGraphic.beginFill(0x000000)
            testGraphic.lineStyle(2, 0xFF0000)
            testGraphic.drawRect(x, y, 10, 10)
        
            graphicLayer.addChild(testGraphic)
        },
        after: () => null
    },
    fast: {
        before: () => new PIXI.Graphics(),
        inside: (ctx, x, y) => {
            ctx.beginFill(0x000000)
            ctx.lineStyle(2, 0xFF0000)
            ctx.drawRect(x, y, 10, 10)
        },
        after: (ctx) => graphicLayer.addChild(ctx)
    }
}

let preferedMethod = methods.fast
let ctx = preferedMethod.before()

for (let I = 0; I < 10000; I++) {
    let x = randInt(0, 1000)
    let y = randInt(0, 1000)

    // XXX: slow
    preferedMethod.inside(ctx, x, y)

    // {
    //     let t = new PIXI.Text('This is a PixiJS text', {
    //         fontFamily: 'Arial',
    //         fontSize: 24,
    //         fill: 0xff1010,
    //         align: 'center',
    //     });

    //     t.position.x = x
    //     t.position.y = y

    //     graphicLayer.addChild(t)
    // }
    console.log(I)
}

//Build object hierarchy
preferedMethod.after(ctx)

mainLayer.addChild(graphicLayer)
stage.addChild(mainLayer)

//Animate via WebAPI
requestAnimationFrame(animate)

//Scale mainLayer
mainLayer.scale.set(1, 1)

/**
 * Animates the stage
 */
function animate() {
    renderer.render(stage)
    // Recursive animation request, disabled for performance.
    // requestAnimationFrame(animate);
}



/**
 *
 *
 *
 *  EVENT LISTENERS
 *
 *
 *
 */
stage.interactionManager.onMouseDown = function (e) {
    //Reset clientX and clientY to be used for relative location base panning
    clientX = -1
    clientY = -1
    mousedown = true
}

stage.interactionManager.onMouseUp = function (e) {
    mousedown = false
}

stage.interactionManager.onMouseMove = function (e) {
    // Check if the mouse button is down to activate panning
    if (mousedown) {

        // If this is the first iteration through then set clientX and clientY to match the inital mouse position
        if (clientX == -1 && clientY == -1) {
            clientX = e.clientX
            clientY = e.clientY
        }

        // Run a relative check of the last two mouse positions to detect which direction to pan on x
        if (e.clientX == clientX) {
            xPos = 0
        } else if (e.clientX < clientX) {
            xPos = -Math.abs(e.clientX - clientX)
        } else if (e.clientX > clientX) {
            xPos = Math.abs(e.clientX - clientX)
        }

        // Run a relative check of the last two mouse positions to detect which direction to pan on y
        if (e.clientY == clientY) {
            yPos = 0
        } else if (e.clientY < clientY) {
            yPos = -Math.abs(e.clientY - clientY)
        } else if (e.clientY > clientY) {
            yPos = Math.abs(clientY - e.clientY)
        }

        // Set the relative positions for comparison in the next frame
        clientX = e.clientX
        clientY = e.clientY

        // Change the main layer zoom offset x and y for use when mouse wheel listeners are fired.
        main_layer_zoom_offset_x = mainLayer.position.x + xPos
        main_layer_zoom_offset_y = mainLayer.position.y + yPos

        // Move the main layer based on above calucalations
        mainLayer.position.set(main_layer_zoom_offset_x, main_layer_zoom_offset_y)

        // Animate the stage
        requestAnimationFrame(animate)
    }
}

//Attach cross browser mouse wheel listeners
if (body.addEventListener) {
    body.addEventListener('mousewheel', zoom, false)     // Chrome/Safari/Opera
    body.addEventListener('DOMMouseScroll', zoom, false) // Firefox
} else if (body.attachEvent) {
    body.attachEvent('onmousewheel', zoom)                  // IE
}



/**
 *
 *
 *
 *  METHODS
 *
 *
 *
 */


/**
 * Detect the amount of distance the wheel has traveled and normalize it based on browsers.
 * @param  event
 * @return integer
 */
function wheelDistance(evt) {
    if (!evt) evt = event
    let w = evt.wheelDelta, d = evt.detail
    if (d) {
        if (w) return w / d / 40 * d > 0 ? 1 : -1 // Opera
        else return -d / 3              // Firefox;         TODO: do not /3 for OS X
    } else return w / 120             // IE/Safari/Chrome TODO: /3 for Chrome OS X
};

/**
 * Detect the direction that the scroll wheel moved
 * @param event
 * @return integer
 */
function wheelDirection(evt) {
    if (!evt) evt = event
    return (evt.detail < 0) ? 1 : (evt.wheelDelta > 0) ? 1 : -1
};

/**
 * Zoom into the DisplayObjectContainer that acts as the stage
 * @param event
 */
function zoom(evt) {

    // Find the direction that was scrolled
    let direction = wheelDirection(evt)

    // Find the normalized distance
    let distance = wheelDistance(evt)

    // Set the old scale to be referenced later
    let old_scale = main_layer_zoom_scale

    // Find the position of the clients mouse
    x = evt.clientX
    y = evt.clientY

    // Manipulate the scale based on direction
    main_layer_zoom_scale = old_scale + direction

    //Check to see that the scale is not outside of the specified bounds
    if (main_layer_zoom_scale > main_layer_zoom_scalemax) main_layer_zoom_scale = main_layer_zoom_scalemax
    else if (main_layer_zoom_scale < main_layer_zoom_scalemin) main_layer_zoom_scale = main_layer_zoom_scalemin

    // This is the magic. I didn't write this, but it is what allows the zoom to work.
    main_layer_zoom_offset_x = (main_layer_zoom_offset_x - x) * (main_layer_zoom_scale / old_scale) + x
    main_layer_zoom_offset_y = (main_layer_zoom_offset_y - y) * (main_layer_zoom_scale / old_scale) + y

    //Set the position and scale of the DisplayObjectContainer
    mainLayer.scale.set(main_layer_zoom_scale, main_layer_zoom_scale)
    mainLayer.position.set(main_layer_zoom_offset_x, main_layer_zoom_offset_y)

    //Animate the stage
    requestAnimationFrame(animate)

}