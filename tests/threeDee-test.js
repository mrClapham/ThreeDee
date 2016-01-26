describe("A suite", function() {
    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    });
});

describe("A ThreeDee scene may be instatiated", function() {
    var _three = new ThreeDScene();
    it("A ThreeDScene should be able to ne instatiated.", function() {
        expect(_three).not.toBe(null);
    });
});


describe("Api", function() {
    var _three = new ThreeDScene();
    var _targ = document.createElement('div');
    _three.setTarget(_targ)
    it("getTarget should return the element set by setTarget(value).", function() {
        expect(_three.getTarget()).toEqual(_targ);
    });


});

