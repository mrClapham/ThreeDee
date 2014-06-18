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

    /* Constants */
    _scope.HOVERED          = "hovered"
    _scope.CLICKED          = "clicked"
    _scope.SPRITE_CLICKED   = "sprite_clicked"
    _scope.FRAME_EVENT      = "frameEvent"

    var _setUp = function(){
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


    var _onConfigSet = function(){
        for(var value in arguments[0]){
            //Underscore properties are not to be changed.
           if(String(value).charAt(0) != '_') this._private[value] = arguments[0][value];
        }
    }
////
   var _onTargetSet =  function (){
        _init.call(this)
    }
/////
    var _init = function(){
        this.getRenderer().setClearColor(this.getBackgroundColour(),.0);

        this._private._dispatcher = document.createElement("div")
        this._private._frameEvent = new CustomEvent(_scope.FRAME_EVENT, { 'detail': "frameEntered" });
        this._private._clickEvent = new CustomEvent(_scope.CLICKED, { 'detail': "clicked" });

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
        console.log("I N I T ", this)
        var scope = this
        document.addEventListener( 'mousemove', function(e){
            scope.documentMouseMove(e)
        }, false );

        document.addEventListener( 'mousedown', function(e){
            scope.documentMouseDown(e)
        }, false );

    }
//////
   var  _initCamera =function(){
        // Create a camera, zoom it out from the model a bit, and add it to the scene.
        this._private._camera = new THREE.PerspectiveCamera(this.getFov(), this._private._aspect, this.getNear(), this.getFar());

        this._private._camera.position.x = this._private.cameraX;
        this._private._camera.position.y = this._private.cameraY;
        this._private._camera.position.z = this._private.cameraZ;
        //this.getCamera().position.set(-50,6,0);
        this._private._scene.add( this.getCamera() );
    }

    var _refreshCamera = function (){
        this._private._camera.position.x = this._private.cameraX;
        this._private._camera.position.y = this._private.cameraY;
        this._private._camera.position.z = this._private.cameraZ;
        this._private._camera.updateProjectionMatrix();
    }
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
    }

    /*
        Default materials - if none are set
    */
    var _initMaterials = function(){
        this._private._materials[0] = new THREE.MeshPhongMaterial({color: 0xccff33});
    }

    var _initAnimation = function(){
        if(this._private.orbit) this._private._orbitControl = new THREE.OrbitControls(this._private._camera, this._private._renderer.domElement);

        requestAnimationFrame(this.animate.bind(this));
    }

    var _onSpriteAdded = function(sp){
     //   console.log("SpriteAdded ")
        sp.setScene( this )
    }

    var  _initSprites = function(){

    }

    var _initWindowResize = function(){
        var _this = this
        window.addEventListener('resize', function() {
           if(_this.getFullScreen()) _onWindowResize.call(_this)
        });
    }

    var _onDocumentMouseMove = function(){
        // console.log(this._private._sprites)
        for(var i=0; i<this._private._sprites.length; i++){
            _hitTest.call(this, i);
        }
    }

    var _hitTest = function(index){
       //    console.log("Hit +"+index)
//        var  _projector      = new THREE.Projector()
//        var   _raycaster     = new THREE.Raycaster()
        this._private._vector = new THREE.Vector3( this._private._mouse.x, this._private._mouse.y, 1 );
        this._private._projector.unprojectVector( this._private._vector, this._private._camera );
        this._private._raycaster.set( this._private._camera.position, this._private._vector.sub( this._private._camera.position ).normalize() );

        var __sprite = this._private._sprites[index]

        var mesh = __sprite.getMesh()
        var intersects = this._private._raycaster.intersectObject( mesh );

        if ( intersects.length > 0 ) {
            var intersect = intersects[ 0 ];
            var color = new THREE.Color( 1, 0, 0 );
            var material = new THREE.MeshPhongMaterial();
            //material.color = color
            material.emissive = color;
            material.shininess = 100;
            material.shading = THREE.SmoothShading;

            mesh.material = material;
            var object = intersect.object;
            mesh.rotation.z -= .04;

            mesh.updateMatrix();
            __sprite.setHit(true)

//            _line.geometry.applyMatrix( mesh.matrix );
//
//            _line.visible = true;

        }else{
            try{
                mesh.material = __sprite.getMaterial();
            }catch(e){
                __sprite.setHit(false)
            }

        }
    }



    var _onWindowResize = function(){
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        this._private._renderer.setSize(WIDTH, HEIGHT);
        this._private._camera.aspect = WIDTH / HEIGHT;
        this._private._camera.updateProjectionMatrix();
    }


    // Renders the scene and updates the render as needed.
/* ENUMS */

/* Methods */
    _scope.prototype = {
        animate:function(){
            this._private._renderer.render(this._private._scene, this._private._camera);
            //this.cube.rotation.y += 0.1;
            this._private._dispatcher.dispatchEvent(this._private._frameEvent )
            requestAnimationFrame(this.animate.bind(this));
        },
        listen:function(event, opt_callback){
            this._private._dispatcher.addEventListener(event, opt_callback)
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
        documentMouseMove: function(event, targ) {
            event.preventDefault();
            this._private._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this._private._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            _onDocumentMouseMove.call(this);
        },
        documentMouseDown:function(){
            console.log("Mouse Down", this.getHovered());
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
       // console.log("THE CONTROLLER SPRITE IS ",this.getMesh())
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
    this._private = {
        hit:false,
        skin:null,
        _imgTexture:null,
        bumpMap:null,
        data:{name:"The name of the sprite is"}
    }
    this._private._opt_initialiser = opt_initialiser ? opt_initialiser : {};

        for(var value in this._private._opt_initialiser){
            //Underscore properties are not to be changed.
            if(String(value).charAt(0) != '_') this._private[value] = this._private._opt_initialiser[value];
        }

    this._contoller = opt_controller ? opt_controller :  standardController;
    this._private._modelURL = modelURL;
    this._private._material = material;
    this._loader  = new THREE.JSONLoader();


        _init.call(this)

    }
    // internal business logic

    var _init = function(){
       if(this._private._modelURL) _intModel.call(this);
       if(this._private.skin) _initSkin.call(this);
       if(this._private.bumpMap) _initBumpmap.call(this);
    }

    var _intModel = function(){
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

    var _initSkin = function(){
            console.log("INIT SKIN ")
        this._private._imgTexture = THREE.ImageUtils.loadTexture( this._private.skin )
        this._private._material.map = this._private._imgTexture;
    }

    var _initBumpmap = function(){
        console.log("INIT BUMP ")
    }

    var _onSceneSet = function(){
        //  Due to the asynchronous way the models load this mesh may not yet be defined.
        //  If so the mesh should be added during the callback from the loader (this._loader.load... etc)
        try{
            this.addToScene();
        }catch(e){
                //
        }
    }

    var _onHitChanged = function(){
        console.log("I'VE BEEN HIT ", this.getData().name);
    }

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
            this._private.scene.listen(_scope.FRAME_EVENT, function(){
                this._contoller.call(this)
               //if( this.getMesh() ) this.getMesh().rotation.x +=3
               // if( this.getController() ) this.getController.call(this);

            }.bind(this));
        },
        getMesh:function(){
            return this._private._mesh
        },
        setMaterial:function(value){
            this._private._material = value;
        },
        getMaterial:function(){
            return this._private._material;
        },
        getHit:function(){
            return this._private.hit
        },
        setHit:function(value){
            if(this._private.hit != value){
                this._private.hit = value;
                _onHitChanged.call(this)
            }
        },
        getData:function(){
          return   this._private.data;
        },
        setData:function(value){
            this._private.data = value;
        }
    }

    //

    return _scope


})();




