describe("A suite", function() {
    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    });
});

describe("A ThreeDee scene may be instantiated", function() {
    var _three = new ThreeDeeScene();
    it("A ThreeDScene should be able to be instantiated.", function() {
        expect(_three).not.toBe(null);
    });
});

var _three = new ThreeDeeScene();
var _targ = document.createElement('div');

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
        _three.setWidth("200");
        expect(_three.getWidth()).toEqual(200);
        // expect(_three.getTarget().clientWidth).toEqual(200);
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