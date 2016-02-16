describe("A suite", function() {
    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    });
});

var _three = new ThreeDeeScene();
var _targ = document.createElement('div');

describe("A ThreeDee scene may be instantiated", function() {
    it("A ThreeDScene should be able to be instantiated.", function() {
        expect(_three).not.toBe(null);
    });
});

describe("Api: DOM set the target DIV.", function() {
    _three.setTarget(_targ);
    it("getTarget should return the element set by setTarget(value).", function() {
        expect(_three.getTarget()).toEqual(_targ);
    });
    var _bogusDiv = {};
    it("setTarget should throw an error if passed a non DOM element.", function() {
        expect(function(){
            _three.setTarget(_bogusDiv);
        }).toThrowError("The value passed must be a DOM element");
    });
});

describe("API: set/get width and height", function(){

    it("Should allow width to be set and retrieved via the API as a Number.", function(){
        _three.setWidth(100);
        expect(_three.getWidth()).toEqual(100)
    });

    it("Should allow width to be set and retrieved via the API as a Number String.", function(){

        var _canvas = [].slice.call(_three.getTarget().children).filter(function(d,i){
            return d.nodeName === "CANVAS";
        })[0];

        _three.setWidth("200");
        expect(_three.getWidth()).toEqual(200);
        expect(_canvas.width).toEqual(200);

        _three.setWidth(150);
        expect(_three.getWidth()).toEqual(150);
        expect(_canvas.width).toEqual(150);

        _three.setHeight("400");
        expect(_three.getHeight()).toEqual(400);
        expect(_canvas.height).toEqual(400);

        _three.setHeight(350);
        expect(_three.getHeight()).toEqual(350);
        expect(_canvas.height).toEqual(350);
    });

    it("Setting width with a non-number String should throw an Error.", function(){
        expect(function(){
            _three.setWidth("two hundred");
        }).toThrowError("The value you passed should be a number");
    });

    it("Setting height with a non-number String should throw an Error.", function(){
        expect(function(){
            _three.setHeight("two hundred");
        }).toThrowError("The value you passed should be a number");
    });

    it("Should allow the height to be set and retrieved via the API as a Number.", function(){
        _three.setHeight(300);
        expect(_three.getHeight()).toEqual(300)
    });

    it("Should allow the height to be set and retrieved via the API as a Number String.", function(){
        _three.setHeight("400");
        expect(_three.getHeight()).toEqual(400)
    });
});

describe("The camera API", function(){
    it("The camera X Y and Z positions should be able to be set va the API.", function(){
        it("getCameraX should return the same value as set by setCameraX.", function(){
            _three.setCameraX(5);
            expect(_three.getCameraX(5)).toEqual(5);
        });

        it("getCameraY should return the same value as set by setCameraY.", function(){
            _three.setCameraY(15);
            expect(_three.getCameraY(15)).toEqual(15);
        });

        it("getCameraZ should return the same value as set by setCameraz.", function(){
            _three.setCameraZ(7);
            expect(_three.getCameraZ(7)).toEqual(7);
        });

        it("Setting the camera X, Y or Z to a non number string should throw the Error, 'The value you passed should be a number'", function(){
            expect(function(){_three.setCameraX("Five")}).toThrow("The value you passed should be a number");
            expect(function(){_three.setCameraY("Five")}).toThrow("The value you passed should be a number");
            expect(function(){_three.setCameraZ("Five")}).toThrow("The value you passed should be a number");
        });
    });
});

describe("The frustum API", function(){
    it("The field of view should be modifiable via the API", function(){
        _three.setFov(30);
        expect(_three.getFov()).toEqual(30);
        _three.setFov('40');
        expect(_three.getFov()).toEqual(40);
    });

});