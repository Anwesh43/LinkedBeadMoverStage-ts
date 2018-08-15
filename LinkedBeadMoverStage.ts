const w: number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class LinkedBeadMoverStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    linkedBeadMover : LinkedBeadMover = new LinkedBeadMover()
    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
        this.render()
        this.handleTap()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedBeadMover.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedBeadMover.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedBeadMover.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedBeadMoverStage = new LinkedBeadMoverStage()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number
    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class BMNode {
    prev : BMNode
    next : BMNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new BMNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / nodes
        context.save()
        context.translate(this.i * gap + gap / 2, h/2)
        const r = gap / 8
        const sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2
        context.lineWidth = r
        context.lineCap = 'round'
        const color : string = '#F9A825'
        context.strokeStyle = color
        context.fillStyle = color
        context.beginPath()
        var k : number = 0
        var cx : number = 0, cy : number = 0
        for (var j = 180 * (1 - sc2); j >= 180 * (1 - sc1); j --)  {
            const x = gap / 2 + (gap / 2) * Math.cos(j * Math.PI/180)
            const y = (gap / 2) * Math.sin(j * Math.PI/180)
            if (k == 0) {
                context.moveTo(x, y)
                cx = x
                cy = y
            } else {
                context.lineTo(x, y)
            }
            k++
        }
        context.stroke()
        context.beginPath()
        context.arc(cx, cy, r, 0, 2 * Math.PI)
        context.fill()
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BMNode {
        var curr : BMNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedBeadMover {
    curr : BMNode = new BMNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
