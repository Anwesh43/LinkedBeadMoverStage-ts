var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var LinkedBeadMoverStage = (function () {
    function LinkedBeadMoverStage() {
        this.canvas = document.createElement('canvas');
        this.linkedBeadMover = new LinkedBeadMover();
        this.animator = new Animator();
        this.initCanvas();
        this.render();
        this.handleTap();
    }
    LinkedBeadMoverStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    LinkedBeadMoverStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.linkedBeadMover.draw(this.context);
    };
    LinkedBeadMoverStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.linkedBeadMover.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.linkedBeadMover.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    LinkedBeadMoverStage.init = function () {
        var stage = new LinkedBeadMoverStage();
    };
    return LinkedBeadMoverStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.dir = 0;
        this.prevScale = 0;
    }
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    State.prototype.update = function (cb) {
        this.scale += 0.05 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(cb, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var BMNode = (function () {
    function BMNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    BMNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new BMNode(this.i + 1);
            this.next.prev = this;
        }
    };
    BMNode.prototype.draw = function (context) {
        var gap = w / nodes;
        context.save();
        context.translate(this.i * gap + gap / 2, h / 2);
        var r = gap / 8;
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2;
        context.lineWidth = r;
        context.lineCap = 'round';
        var color = '#F9A825';
        context.strokeStyle = color;
        context.fillStyle = color;
        context.beginPath();
        var k = 0;
        var cx = 0, cy = 0;
        for (var j = 180 * (1 - sc2); j >= 180 * (1 - sc1); j--) {
            var x = gap / 2 + (gap / 2) * Math.cos(j * Math.PI / 180);
            var y = (gap / 2) * Math.sin(j * Math.PI / 180);
            if (k == 0) {
                context.moveTo(x, y);
                cx = x;
                cy = y;
            }
            else {
                context.lineTo(x, y);
            }
            k++;
        }
        context.stroke();
        context.beginPath();
        context.arc(cx, cy, r, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    BMNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    BMNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    BMNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return BMNode;
})();
var LinkedBeadMover = (function () {
    function LinkedBeadMover() {
        this.curr = new BMNode(0);
        this.dir = 1;
    }
    LinkedBeadMover.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedBeadMover.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedBeadMover.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedBeadMover;
})();
