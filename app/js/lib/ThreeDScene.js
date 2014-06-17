/**
 * Created by grahamclapham on 05/06/2014.
 * Dependencies ThreeJs (http://threejs.org/) and Three.js OrbitControls.js (https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js)
 */
ThreeDScene = (function (opt_target, opt_initialiser){

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
            //LIGHTS
            _light             : null,
            lightColour        : 0xffffff,
            _lightAmbient      : null,
            ambientColour      : 0xff00ff,
            _lights            :[],

            //CAMERA
            fov                : 45,       //— Camera frustum vertical field of view.
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
            _projector          : new THREE.Projector(),
            _raycaster          : new THREE.Raycaster(),
            _bufferGeometry     : new THREE.BufferGeometry(),
            _renderer           : new THREE.WebGLRenderer({antialias:true}),
            _orbitControl       : null,
            orbit               : true, // is the scene controlled by an mouse controlled orbiter?
            _dispatcher         : null,
            _frameEvent         : null
        }
        _setUp.apply(this, arguments)
    };

    function _setUp(){
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
        for(var value in arguments[0]){
            //Underscore properties are not to be changed.
           if(String(value).charAt(0) != '_') this._private[value] = arguments[0][value];
        }
    }
////
    function _onTargetSet(){
        _init.call(this)
    }
/////
    function _init(){
        this.getRenderer().setClearColor(this.getBackgroundColour(),.0);

        this._private._dispatcher = document.createElement("div")
        this._private._frameEvent = new CustomEvent("FRAME_EVENT", { 'detail': "Helooo------FRAME-------------" });

        if(this._private.target) this._private.target.appendChild( this.getRenderer().domElement );

        _initCamera.call(this);
        _initLights.call(this);
        _initMaterials.call(this);
        _initAnimation.call(this);
        _initSprites.call(this);
        if(this.getFullScreen()){
            _initWindowResize.call(this);
            _onWindowResize.call(this);
        }else{
            this.getRenderer().setSize(this.getWidth() , this.getHeight());
            this._private._aspect = this.getWidth() / this.getHeight()
        }

    }
//////
    function _initCamera(){
        // Create a camera, zoom it out from the model a bit, and add it to the scene.
        this._private._camera = new THREE.PerspectiveCamera(this.getFov(), this._private._aspect, this.getNear(), this.getFar());

        this._private._camera.position.x = this._private.cameraX;
        this._private._camera.position.y = this._private.cameraY;
        this._private._camera.position.z = this._private.cameraZ;
        //this.getCamera().position.set(-50,6,0);
        this._private._scene.add( this.getCamera() );
    }

    function _refreshCamera(){
        this._private._camera.position.x = this._private.cameraX;
        this._private._camera.position.y = this._private.cameraY;
        this._private._camera.position.z = this._private.cameraZ;
        this._private._camera.updateProjectionMatrix();
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

    function _initAnimation(){
        if(this._private.orbit) this._private._orbitControl = new THREE.OrbitControls(this._private._camera, this._private._renderer.domElement);

        requestAnimationFrame(this.animate.bind(this));
    }

    function _onSpriteAdded(sp){
     //   console.log("SpriteAdded ")
        sp.setScene( this )
    }

    function _initSprites(){

    }

    function _initWindowResize(){
        var _this = this
        window.addEventListener('resize', function() {
           if(_this.getFullScreen()) _onWindowResize.call(_this)
        });
    }

    function _onWindowResize(){
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        this._private._renderer.setSize(WIDTH, HEIGHT);
        this._private._camera.aspect = WIDTH / HEIGHT;
        this._private._camera.updateProjectionMatrix();
    }

    function callBack(e){
        console.log(e)
    }
    // Renders the scene and updates the render as needed.

/* Methods */
    _scope.prototype = {
        animate:function(){

            this._private._renderer.render(this._private._scene, this._private._camera);
            //this.cube.rotation.y += 0.1;
            this._private._dispatcher.dispatchEvent(this._private._frameEvent )
            requestAnimationFrame(this.animate.bind(this));
        },
        listen:function(event, opt_callback){
            this._private._dispatcher.addEventListener("FRAME_EVENT", opt_callback)
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
        getTarget:function(){return this._private.target},
        setTarget:function(value){ this._private.target = value, _onTargetSet.apply(this)},
        getWidth:function(){return this._private.width},
        getHeight:function(){return this._private.height},
        getCamera:function(){return this._private._camera},
        getCameraX:function(){return this._private.cameraX},
        setCameraX:function(value){
            this._private.cameraX = value
        },
        getRenderer:function(){return this._private._renderer},
        getFov:function(){return this._private.fov},
        setFov:function(value){ this._private.fov = value},
        getNear:function(){ return this._private.near},
        setNear:function(value){ this._private.near = value},
        getFar:function(){ return this._private.far},
        setFar:function(value){
            this._private.far = value
            _refreshCamera.call(this);
        },
        getBackgroundColour:function(){return this._private.backgroundColour},
        setBackgroundColour:function(value){this._private.backgroundColour = value},
        getLightColour:function(){return this._private.lightColour},
        setLightColour:function(value){this._private.lightColour = value},
        getAmbientLightColour:function(){return this._private.ambientColour},
        setAmbientLightColour:function(value){this._private.ambientColour = value},
        getScene:function(){return this._private._scene},
        getFullScreen:function(){return this._private.fullscreen},
        setFullScreen:function(value){ this._private.fullscreen = value}
    }


    return _scope

})();
/*
    STATIC FUNCTIONS
 */
var standardController = function(){

    if( this.getMesh() ){
        console.log("THE CONTROLLER SPRITE IS ",this.getMesh())
        this.getMesh().rotation.x +=.005
    }
//   if(sprite) this.sprite = sprite;
//    console.log("SPRITE ", this.sprite.getMesh())
//    if( this.sprite.getMesh() ) this.sprite.getMesh().rotation.x +=.5

}




////////////// THE SPRITE CLASS ////////////////////////////////////////////////////
/* AS THEY ARE INTRINSICALLY LINKED I'VE KEPT THE SPRITE AND THE SCENE IN THE SAME JS FILE */

ThreeDSprite = (function(modelURL, material, opt_initialiser, opt_controller){

    var _scope = function(modelURL, material, opt_initialiser, opt_controller){
    this._private = {} //opt_initialiser ? opt_initialiser : {};
    this._private._opt_initialiser = opt_initialiser ? opt_initialiser : {};
    this._contoller = opt_controller ? opt_controller :  standardController;
    this._private._modelURL = modelURL;
    this._private._material = material;
    this._loader  = new THREE.JSONLoader();
    var scope = this
    this._loader.load( this._private._modelURL, function(geometry){
        var imgTexture = THREE.ImageUtils.loadTexture( 'models/Map-COL.jpg' )
        imgTexture.anisotropy = 1;
        geometry.computeTangents();

        var mesh;
        scope._private._mesh = mesh = new THREE.Mesh(geometry, scope._private._material);
        for(var prop in scope._private._opt_initialiser){
            mesh[prop] = scope._private._opt_initialiser[prop];
        }
        // rotation transforms need to be applied individually
        if(scope._private._opt_initialiser.rotation){
            mesh.rotation.x = scope._private._opt_initialiser.rotation.x;
            mesh.rotation.y = scope._private._opt_initialiser.rotation.y;
            mesh.rotation.z = scope._private._opt_initialiser.rotation.z;
        }

        try{
            scope.addToScene();
        }catch(e){
            ///
        }
    })
    }
    // internal business logic
    function _onSceneSet(){
        //  Due to the asynchronous way the models load this mesh may not yet be defined.
        //  If so the mesh should be added during the callback from the loader (this._loader.load... etc)
        try{
            this.addToScene();
        }catch(e){
                //
        }
    }
var __count = 0
    /* Methods */
    _scope.prototype = {
        setScene:function(value){
            this._private.scene = value;
            _onSceneSet.call(this);
        },
        getController:function(){
            return this._contoller
        },
        addToScene:function(){
            this._private.scene.getScene().add(this._private._mesh);
            this._private.scene.listen("FRAME_EVENT", function(){
                standardController.call(this)
               //if( this.getMesh() ) this.getMesh().rotation.x +=3
               // if( this.getController() ) this.getController.call(this);

            }.bind(this));
        },
        getMesh:function(){
            return this._private._mesh
        }
    }

    //

    return _scope


})();




