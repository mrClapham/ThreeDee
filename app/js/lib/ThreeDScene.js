/**
 * Created by grahamclapham on 05/06/2014.
 * Dependencies ThreeJs (http://threejs.org/)
 */
ThreeDScene = (function (opt_target, opt_initialiser){

    var _scope = function(){
        this._private = {
            //APP
            target             : null,
            width              : 200,
            height             : 200,
            backgroundColour   : 0xcccccc,
            _aspect             : null,
            _scene              : null,
            //LIGHTS
            _light              : null,
            lightColour         : 0xffffff,
            _lightAmbient       : null,
            ambientColour       : 0xff00ff,
            _lights             :[],

            //CAMERA
            fov                : 45,       //— Camera frustum vertical field of view.
            near               : 0.1,      //— Camera frustum near plane.
            far                : 20000,    //— Camera frustum far plane.
            _camera             : null,

            //ACTION
            _sprites            : [],
            _materials          : [],
            _datum              : [],

            _scene              : new THREE.Scene(),
            _mouse              : new THREE.Vector2(),
            _projector          : new THREE.Projector(),
            _raycaster          : new THREE.Raycaster(),
            _bufferGeometry     : new THREE.BufferGeometry(),
            _renderer           : new THREE.WebGLRenderer({antialias:true}),
            _orbitControl       : null
        }
        _setUp.apply(this, arguments)
    };

    function _setUp(){
        console.log(arguments)

        //First, have you got a config object?
        // If so apply all the properies.
        if(arguments[1] && ( typeof arguments[1] == 'object') ){
            _onConfigSet.call(this, arguments[1])
        }

        // test to see if the first item is a DOM element
        if(arguments[0] && arguments[0].nodeType === 1){
            this.setTarget(arguments[0]);
        }
    }



    function _onConfigSet(){
        console.log("Config set ", arguments)
        for(var value in arguments[0]){
            this._private[value] = arguments[0][value];
        }
    }
////
    function _onTargetSet(){
        _init.call(this)
    }
/////
    function _init(){

        this.getRenderer().setSize(this.getWidth() , this.getHeight());
        this.getRenderer().setClearColor(this.getBackgroundColour(),.0);
        this._private._aspect = this.getWidth() / this.getHeight()
        if(this._private.target) this._private.target.appendChild( this.getRenderer().domElement );

        _initCamera.call(this);
        _initLights.call(this);
        _initMaterials.call(this);
        _initTester.call(this);
        _initSprites.call(this);
    }
//////
    function _initCamera(){
        // Create a camera, zoom it out from the model a bit, and add it to the scene.
        this._private._camera = new THREE.PerspectiveCamera(this.getFov(), this._private._aspect, this.getNear(), this.getFar());
        //this.getCamera().position.set(-50,6,0);
        this._private._scene.add( this.getCamera() );
    }
/////
    function _initLights(){

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
    }

    /*
        Default materials - if none are set
    */
    function _initMaterials(){
        this._private._materials[0] = new THREE.MeshPhongMaterial({color: 0xccff33});
    }

    function _initTester(){

        var geometry = new THREE.BoxGeometry(3,3,3,6,6,6);
        this._private._camera.position.z = 5;
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.cube = new THREE.Mesh(geometry, material);
        this._private._scene.add(this.cube);
        this._private._orbitControl  = new THREE.OrbitControls(this._private._camera, this._private._renderer.domElement);

        requestAnimationFrame(this.animate.bind(this));
    }

    function _initSprites(){

    }

    // Renders the scene and updates the render as needed.


    _scope.prototype = {
        animate:function(){
            this._private._renderer.render(this._private._scene, this._private._camera);
            this.cube.rotation.y += 0.1;
            requestAnimationFrame(this.animate.bind(this));
        },
        getTarget:function(){return this._private.target},
        setTarget:function(value){ this._private.target = value, _onTargetSet.apply(this)},
        getWidth:function(){return this._private.width},
        getHeight:function(){return this._private.height},
        getCamera:function(){return this._private._camera},
        getRenderer:function(){return this._private._renderer},
        getFov:function(){return this._private.fov},
        setFov:function(value){ this._private.fov = value},
        getNear:function(){ return this._private.near},
        setNear:function(value){ this._private.near = value},
        getFar:function(){ return this._private.far},
        setFar:function(value){ this._private.far = value},
        getBackgroundColour:function(){return this._private.backgroundColour},
        setBackgroundColour:function(value){this._private.backgroundColour = value},
        getLightColour:function(){return this._private.lightColour},
        setLightColour:function(value){this._private.lightColour = value},
        getAmbientLightColour:function(){return this._private.ambientColour},
        setAmbientLightColour:function(value){this._private.ambientColour = value},
    }
    /*
    Business logic
    */


    return _scope

})();
/*
    STATIC FUNCTIONS
 */

ThreeDSprite = (function(opt_initialiser){
    this._model = opt_initialiser ? opt_initialiser : {};
    this._data = null;
    this._material = null;


})();

