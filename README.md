# Pixi-Pan-and-Zoom

## what I found
the point is to draw all of the shapes inside **only one** graphic data, so all of them will be cached together.

```js
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
```

## What this is:
- A quick and somewhat clean example of how to implement pan and zoom in PixiJS
- A good place to build on these ideas and make the example better
- Built to aid in the migration from KineticJS to PixiJS at https://github.com/confile/Kinetic2Pixi

## What this is not:
- Not dependency managed.
- Not tested in a web server, runs locally fine.
- Not fully cross browser checked, I used the latest version Chrome and Firefox on Ubuntu 14.01
- Not tested on mobile. It probably doesn't work, but could pretty easily be expanded for touch devices.
