describe('Getters and setters', function(){
    describe('Set near', function(){
        var _three = new ThreeDScene();
        _three.setNear(100)
        it('should be equal to 100', function(){
            (_three.getNear()).should.equal(100);
        })

//        it('should return the length', function(){
//            var arr = [];
//            assert(1 == arr.push('foo'));
//            assert(2 == arr.push('bar'));
//            assert(3 == arr.push('baz'));
//        })
    })
})