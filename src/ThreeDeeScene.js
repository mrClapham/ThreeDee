var ThreeDeeSprite = require("./ThreeDeeSprite");
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var ColorHelpers = require('./ColorHelpers');
var Helpers = require('./Helpers')

/*Get requestAnimationFrame working for all browsers */
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

/**
 * Created by grahamclapham on 05/06/2014.
 * Dependencies ThreeJs (http://threejs.org/) and Three.js OrbitControls.js (https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js)
 */
ThreeDeeScene = (function (opt_target, opt_initialiser){

    var _scope = function(){
        this._private = {
            //APP
            target             : null,
            width              : 100,
            height             : 100,

            fullscreen         : true,
            backgroundColour   : 0xcccccc,
            _aspect            : null,
            _scene             : null,
            _playing           : true,
            //LIGHTS
            _light             : null,
            lightColour        : 0xffffff,
            _lightAmbient      : null,
            ambientColour      : 0xffffff,
            _lights            :[],


            //CAMERA
            fov                : 15,       //— Camera frustum vertical field of view.
            near               : 0.1,      //— Camera frustum near plane.
            far                : 20000,    //— Camera frustum far plane.
            _camera            : null,
            cameraX            : 0,
            cameraY            : 0,
            cameraZ            : 15,

            //ACTION
            _sprites            : [],
            _materials          : [],
            _datum              : [],

            _scene              : new THREE.Scene(),
            _mouse              : new THREE.Vector2(),
            //_projector          : new THREE.Projector(),
            _raycaster          : new THREE.Raycaster(),
            _bufferGeometry     : new THREE.BufferGeometry(),
            _renderer           : new THREE.WebGLRenderer({antialias:true, alpha:true, shadowMapEnabled:true}),
            _orbitControl       : null,
            orbit               : true, // is the scene controlled by an mouse controlled orbiter?
            _dispatcher         : null,
            _frameEvent         : null
        };
        _setUp.apply(this, arguments);
    };

    /* Constants */
    _scope.HOVERED          = "hovered";
    _scope.CLICKED          = "clicked";
    _scope.FRAME_EVENT      = "frameEvent";

    var _setUp = function(){
        //First, have you got a config object?
        // If so apply all the properties.
        if(arguments[1] && ( typeof arguments[1] == 'object') ){
            _onConfigSet.call(this, arguments[1])
        }

        // test to see if the first item is a DOM element
        if(arguments[0] && arguments[0].nodeType === 1){
            this.setTarget(arguments[0]);
        }
    };

    var _onConfigSet = function(){
        for(var value in arguments[0]){
            //Underscore properties are not to be changed.
            if(String(value).charAt(0) != '_') this._private[value] = arguments[0][value];
            //console.log("THE VALUE ",value," -- ",arguments[0][value]);
        }
    };
////
    var _onTargetSet =  function (){
        _initScene.call(this)
    };
/////
    var _initScene = function(){
        //this.getRenderer().setClearColor(this.getBackgroundColour(),.0);
        this._private._dispatcher = document.createElement("div")
        this._private._frameEvent = new CustomEvent(_scope.FRAME_EVENT, { 'detail': "frameEntered" });
        this._private._clickEvent = new CustomEvent(_scope.CLICKED, { 'detail': "clicked" });

        if(this.getTarget()) this._private.target.appendChild( this.getRenderer().domElement );
        _initCamera.call(this);
        _initLights.call(this);
        _initMaterials.call(this);
        _initAnimation.call(this);
        // console.log("FULLSCREEN IS SET TO ", this.getFullScreen());
        if(this.getFullScreen()){
            _initWindowResize.call(this);
            _onWindowResize.call(this);
        }else{
            _setFixedSize.call(this);
        }
        var scope = this;
        this.getTarget().addEventListener( 'mousemove', function(e){
            scope.documentMouseMove(e)
        }, false );

        this.getTarget().addEventListener( 'mousedown', function(e){
            scope.documentMouseDown(e)
        }, false );

    };



    var _setFixedSize = function(){
        this.getRenderer().setSize(this.getWidth(), this.getHeight());
        this._private._camera.aspect = this.getWidth() / this.getHeight();
        this._private._camera.updateProjectionMatrix();
    };
//////
    var  _initCamera =function(){
        // Create a camera, zoom it out from the model a bit, and add it to the scene.
        this._private._camera = new THREE.PerspectiveCamera(this.getFov(), this._private._aspect, this.getNear(), this.getFar());

        this._private._camera.position.x = this._private.cameraX;
        this._private._camera.position.y = this._private.cameraY;
        this._private._camera.position.z = this._private.cameraZ;
        //this.getCamera().position.set(-50,6,0);
        this._private._scene.add( this.getCamera() );
    };

    var _refreshCamera = function (){
        this._private._camera.position.x = this._private.cameraX;
        this._private._camera.position.y = this._private.cameraY;
        this._private._camera.position.z = this._private.cameraZ;
        this._private._camera.near = this._private.near;
        this._private._camera.far = this._private.far;
        this._private._camera.fov = this._private.fov;

        this._private._camera.updateProjectionMatrix();
    };
/////
    var _initLights = function(){

        // Create a light, set its position, and add it to the scene.
        var _light = this._private._light = new THREE.PointLight(this.getLightColour());
        _light.position.set(-100,200,100);
        _light.castShadow = true;
        _light.shadowMapWidth = 2048;
        _light.shadowMapHeight = 2048;
        _light.shadowCameraFov = 45;
        this._private._scene.add(_light);

        // ...and now the ambient light

        var _lightAmbient = this._private._lightAmbient  = new THREE.DirectionalLight(this.getAmbientLightColour() ,1);
        _lightAmbient.position.set(100,-700,-300);
        this._private._scene.add(_lightAmbient);
    };

    /*
     Default materials - if none are set
     */
    var _initMaterials = function(){
        this._private._materials[0] = new THREE.MeshPhongMaterial({color: 0xccff33});
    };

    var _initAnimation = function(){
        if(this._private.orbit) this._private._orbitControl = new OrbitControls(this._private._camera, this._private._renderer.domElement);

        requestAnimationFrame(this.animate.bind(this));
    };

    var _onSpriteAdded = function(sp){
        //   console.log("SpriteAdded ")
        sp.setScene( this )
    };

    var _initWindowResize = function(){
        var _this = this;
        this._private._windowListener = window.addEventListener('resize', function() {
            if(_this.getFullScreen()) _onWindowResize.call(_this);
        });
    };

    var _onDocumentMouseMove = function(){
        for(var i=0; i<this._private._sprites.length; i++){
            _hitTest.call(this, i);
        }
    };

    var _hitTest = function(index){
        this._private._vector = new THREE.Vector3( this._private._mouse.x, this._private._mouse.y, 1 );
        var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( this._private._camera.matrixWorld );
        this._private._raycaster.setFromCamera( this._private._mouse, this._private._camera );
        var __sprite = this._private._sprites[index]

        var mesh = __sprite.getMesh();
        var intersects = [];
        try{
            intersects = this._private._raycaster.intersectObject( mesh );
        }catch(err){
            // console.log("Intersects error: ", err);
        }

        if ( intersects.length > 0 ) {
            var intersect = intersects[ 0 ];
            __sprite.setHit(true)
        }else{
            __sprite.setHit(false)
        }
    };

    var _onWindowResize = function(){
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        this._private._renderer.setSize(WIDTH, HEIGHT);
        this._private._camera.aspect = WIDTH / HEIGHT;
        this._private._camera.updateProjectionMatrix();
    };

    var _onSizeChanged = function(){
        this.setFullScreen(false);
        _setFixedSize.call(this);
    };

    // Renders the scene and updates the render as needed.
    /* ENUMS */

    /* Methods */
    _scope.prototype = {
        animate:function(){
            if(!this.getPlaying()) return;
            this._private._renderer.render(this._private._scene, this._private._camera);
            //this.cube.rotation.y += 0.1;
            this._private._dispatcher.dispatchEvent(this._private._frameEvent )
            requestAnimationFrame(this.animate.bind(this));
        },
        listen:function(event, opt_callback){
            this._private._dispatcher.addEventListener(event, opt_callback);
        },
        addSprite:function(value){
            var alreadyAdded = false;
            for(var sp in this._private._sprites ){
                if(this._private._sprites[sp] == value){
                    alreadyAdded = true
                }
            }
            if( !alreadyAdded ){
                this._private._sprites.push(value) ;
                _onSpriteAdded.call(this, value)
            }
        },
        stripPx:function(value){
            var _s = String(value).replace("px", "");
            var _n = parseFloat(_s);
            return (!isNaN(_n) ) ? _n : 0;
        },
        documentMouseMove: function(event, targ) {
            event.preventDefault();
            var el = this.getTarget();
            var style  = el.currentStyle || window.getComputedStyle(el);
            var _xOffset = this.stripPx(style["padding-left"]);
            var _yOffset = this.stripPx(style["padding-top"]);
            var _rect = this.getTarget().getBoundingClientRect();
            var xMouseCalc = ( ( event.clientX - _rect.left - _xOffset ) / window.innerWidth ) * 2 - 1;
            var yMouseCalc = - ( (  event.clientY - _rect.top - _yOffset  ) / window.innerHeight ) * 2 + 1;
            this._private._mouse.x = xMouseCalc;
            this._private._mouse.y = yMouseCalc;

            _onDocumentMouseMove.call(this);
        },
        documentMouseDown:function(){
            // console.log("Mouse Down", this.getHovered());
            this._private._dispatcher.dispatchEvent( this._private._clickEvent )
        },
        getHovered:function(){
            var _hovered = [];
            for(var sp in this._private._sprites){
                if(this._private._sprites[sp].getHit()){
                    _hovered.push(this._private._sprites[sp])
                }
            }
            return _hovered
        },
        getTarget:function(){return this._private.target},
        setTarget:function(value){
            if(Helpers.chekDomElementIsValid(value) ){
                this._private.target = value;
                _onTargetSet.apply(this);
            }else{
                throw new Error("The value passed must be a DOM element")
            }
        },
        getWidth:function(){return this._private.width},
        setWidth:function(value){
            this._private.width = Helpers.checkNumberValid(value);
            _onSizeChanged.call(this)
        },
        getHeight:function(){return this._private.height},
        setHeight:function(value){
            this._private.height = Helpers.checkNumberValid(value);
            _onSizeChanged.call(this)
        },
        getCamera:function(){return this._private._camera},
        getCameraX:function(){return this._private.cameraX},
        setCameraX:function(value){
            this._private.cameraX = Helpers.checkNumberValid(value);
            _refreshCamera.call(this);
        },
        getCameraY:function(){return this._private.cameraY},
        setCameraY:function(value){
            this._private.cameraY = Helpers.checkNumberValid(value);
            _refreshCamera.call(this);
        },
        getCameraZ:function(){return this._private.cameraZ},
        setCameraZ:function(value){
            this._private.cameraZ = Helpers.checkNumberValid(value);
            _refreshCamera.call(this);
        },
        getRenderer:function(){return this._private._renderer},
        getFov:function(){return this._private.fov},
        setFov:function(value){
            this._private.fov = Helpers.checkNumberValid(value);
            _refreshCamera.call(this);
        },
        getNear:function(){ return this._private.near},
        setNear:function(value){
            this._private.near =  Helpers.checkNumberValid(value);
            _refreshCamera.call(this);
        },
        getFar:function(){ return this._private.far},
        setFar:function(value){
            this._private.far =  Helpers.checkNumberValid(value);
            _refreshCamera.call(this);
        },
        // in the short tern, just to ensure all number passed are not NaNs...
        colourHelper:function(value){
            var _passed = true;
            if(value.length){
                for(var i=0; i<value.length; i++){
                    if(isNaN( value[i]) ) _passed = false;
                }
            }
            return _passed
        },
        getBackgroundColour:function(){return this._private.backgroundColour},
        setBackgroundColour:function(value){this._private.backgroundColour = value},
        getLightColour:function(){return this._private.lightColour},
        setLightColour:function(value){
            this._private.lightColour = value;
            //console.log("New light col : ",value)
            try{
                this._private._light.color = new THREE.Color(value)
            }catch(err){
               // console.log(err)
            }
        },
        getAmbientLightColour:function(){return this._private.ambientColour},
        setAmbientLightColour:function(value){
            this._private.ambientColour = value;
            // console.log("New ambient col : ",value)
            try{
                this._private._lightAmbient.color = new THREE.Color(value)
            }catch(err){
                // console.log(err)
            }
        },
        getScene:function(){return this._private._scene},
        getFullScreen:function(){return this._private.fullscreen},
        setFullScreen:function(value){ this._private.fullscreen = value},
        setPlaying:function(value){
            this._private._playing = value;
            if(value){
                this.animate.call(this);
            }
        },
        getPlaying:function(){
            return this._private._playing;
        }
    };
    return _scope

})();



module.exports = {Scene:ThreeDeeScene, Sprite:ThreeDeeSprite, THREE:THREE, ColorHelpers:ColorHelpers};





