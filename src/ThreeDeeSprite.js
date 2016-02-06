var THREE = require('three');

var standardController = function(){
    //console.log("I have a standard controller");

    var _this = this
    this.listen(this.SPRITE_HIT_CHANGED, function(e){
        _onHitEvent.call(_this, e);
    });

//   if(sprite) this.sprite = sprite;
//    console.log("SPRITE ", this.sprite.getMesh())
//    if( this.sprite.getMesh() ) this.sprite.getMesh().rotation.x +=.5
    _onRolled.call(this);

};

var _onHitEvent = function(e){
    this.getHit() ? _onMouseIn.call(this, e) : _onMouseOut.call(this, e) ;
};

var _onMouseIn = function(e){
    console.log("_onMouseIn")
    this.setMaterial( this.getHoverMaterial() );
};

var _onMouseOut = function(e){
    console.log("_onMouseOut  ", this.getMaterial());
    console.log("UNHOVERED :",this._private.materialUnhovered)
    this.setMaterial( this._private.materialUnhovered );
    //this.setMaterial(  this.getMaterial() );
};

var _onRolled = function(){
   // console.log("I AM THE STANDARD ON ROLLED FUNCTION")
};

var defaultColour = new THREE.Color( 0.5, 0, 1 );

var defaultMaterial = new THREE.MeshPhongMaterial();

defaultMaterial.emissive = defaultColour;
defaultMaterial.shininess = 100;
defaultMaterial.shading = THREE.SmoothShading;
defaultMaterial.id = "defaultMaterial";

var defaultGeometry = new THREE.SphereGeometry( 1, 32, 32 );

ThreeDeeSprite = (function(modelURL, material, opt_initialiser, opt_controller){
    var _scope = function(modelURL, material, opt_initialiser, opt_controller){

        this._private = {
            material:null,
            materialDefault:null,
            materialUnhovered:null,
            materialHover:null,
            blenderModel:null,
            hit:false,
            skin:null,
            _imgTexture:null,
            bumpMap:null,
            bumpScale:.02,
            _x:1,
            _y:1,
            _z:1,
            _xRotation:0,
            _yRotation:0,
            _zRotation:0,
            _imgBump:null,
            _spriteEventDispatcher: null,
            _texturLoader: null,
            data:{name:"The name of the sprite is default"}
        };

        /* Statics */

        this.SPRITE_HIT_CHANGED   = "spriteHitChanged";

        this._private._spriteEventDispatcher = document.createElement("div");
        console.log("THE MATERIAL IS ", material);
        if(material){
            this._private.materialUnhovered = material;
            console.log(">>>>>>>>>>>>>>>>>>>> A material has been set. ", this._private.materialUnhovered)
        }else{
            this._private.materialUnhovered = defaultMaterial;
            console.log("!!!!!!!!!!!!!!!!!! A material has NOT been set. ", this._private.materialUnhovered)
        }
        this._private.materialDefault = defaultMaterial;
       // this._private.materialDefault = material ? material :  defaultMaterial;
        this._private.material = this._private.materialUnhovered;
        console.log("  this._private.material "===  this._private.material)

        this._private._opt_initialiser = opt_initialiser ? opt_initialiser : {};

        for(var value in this._private._opt_initialiser){
            //Underscore properties are not to be changed.
            if(String(value).charAt(0) != '_') this._private[value] = this._private._opt_initialiser[value];
            console.log("Setting config to ", this._private[value])
        }

        this._contoller = opt_controller ? opt_controller :  standardController;
        this._contoller.call(this);
        this._private.modelURL = modelURL ? modelURL : null;
        //    this._private._material = material;
        this._loader  = new THREE.JSONLoader();
        // was a default hover material set in the config?
        if(!this.getHoverMaterial()){
            var color = new THREE.Color( 1, 1, 0 );
            var material = new THREE.MeshPhongMaterial();
            material.emissive = color;
            material.shininess = 100;
            material.shading = THREE.SmoothShading;

            this._private.materialHover = material;
        }
       _initSprite.call(this)

    };
    // internal business logic

    var _initSprite = function(){
        console.log("_initSprite IS BEING CALLED ")
        if(this._private.skin) _initSkin.call(this);
        if(this._private.bumpMap) _initBumpmap.call(this);
        this._private.modelURL ?  _intModel.call(this) : _initDefaultModel.call(this);

        // this._private._hitEvent =  new CustomEvent(_scope.SPRITE_HIT_CHANGED, { 'detail': this.getData() , target:this });
    }

    var _intModel = function(){
        var scope = this;
        this._loader.load( this._private.modelURL, function(geometry){
            _onGeometrySet.call(scope, geometry)
        });
    };

    var _initDefaultModel = function(){
        this._private._mesh = mesh = new THREE.Mesh(defaultGeometry, this._private.material);
        _onGeometrySet.call(this, defaultGeometry)
    };

    var _onGeometrySet = function(geometry){

        var mesh;
        this._private._mesh = mesh = new THREE.Mesh(geometry, this._private.material);
        for(var prop in this._private._opt_initialiser){
            mesh[prop] = this._private._opt_initialiser[prop];
        }

        // rotation transforms need to be applied individually...
        if(this._private._opt_initialiser.position){
            this._private._x = this._private._opt_initialiser.position.x;
            this._private._y = this._private._opt_initialiser.position.y;
            this._private._z = this._private._opt_initialiser.position.z;

            mesh.position.x = this._private._x;
            mesh.position.y = this._private._y;
            mesh.position.z = this._private._z;
        }

        // rotation transforms need to be applied individually...
        if(this._private._opt_initialiser.rotation){
            this._private._x = this._private._opt_initialiser.rotation.x;
            this._private._y = this._private._opt_initialiser.rotation.y;
            this._private._z = this._private._opt_initialiser.rotation.z;

            mesh.rotation.x = this._private._xRotation;
            mesh.rotation.y = this._private._yRotation;
            mesh.rotation.z = this._private._zRotation;
        }

        // ...and scale transforms need to be applied individually too
        if(this._private._opt_initialiser.scale){
            mesh.scale.x = this._private._opt_initialiser.scale.x;
            mesh.scale.y = this._private._opt_initialiser.scale.y;
            mesh.scale.z = this._private._opt_initialiser.scale.z;
        }

        try{
            this.addToScene();
        }catch(err){
            ///
            console.log(err)
        }
    }

    var _updatePosition = function(){
        var mesh = this._private._mesh
        mesh.position.x = this._private._x;
        mesh.position.y = this._private._y;
        mesh.position.z = this._private._z;
        //

        mesh.rotation.x = this._private._xRotation;
        mesh.rotation.y = this._private._yRotation;
        mesh.rotation.z = this._private._zRotation;

    }

    var _initSkin = function(){
        this._private._texturLoader = new THREE.TextureLoader();
        this._private._texturLoader.load(
            // resource URL
            this._private.skin,
            // Function when resource is loaded
            function ( texture ) {
                // do something with the texture
                var material = new THREE.MeshBasicMaterial( {
                    map: texture
                } );
            },
            // Function called when download progresses
            function ( xhr ) {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },
            // Function called when download errors
            function ( xhr ) {
                console.log( 'An error happened' );
            }
        );
        //this._private._imgTexture = THREE.ImageUtils.loadTexture( this._private.skin )
        this._private.material.map = this._private._imgTexture;
    }

    var _initBumpmap = function(){
        this._private._imgBump = THREE.ImageUtils.loadTexture( this._private.bumpMap )
        this._private.material.bumpScale = this._private.bumpScale;
        this._private.material.bumpMap = this._private._imgBump;
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
        this.getDispatcher().dispatchEvent( this.getEvent(this.SPRITE_HIT_CHANGED, {data:this.getData(), target:this}) );
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
            if(!this._private._mesh || !this._private.scene.getScene()) return;
            var _this = this;
                _this._private.scene.getScene().add(_this._private._mesh);
            this._private.scene.listen(_scope.FRAME_EVENT, function(){
                this._contoller.call(this);
            }.bind(this));
        },
        listen:function(event, opt_callback){
            this._private._spriteEventDispatcher.addEventListener(event, opt_callback)
        },
        getMesh:function(){
            return this._private._mesh
        },
        setMaterial:function(value){
            this._private.material = value;
            try{
                this.getMesh().material = this.getMaterial();
            }catch(err){
                //--
                console.log("Error setting material ")
            }
        },
        getMaterial:function(){
            return this._private.material;
        },

        setDefaultMaterial:function(value){
            this._private.materialDefault = value;
        },
        getDefaultMaterial:function(){
            return this._private.materialDefault;
        },
        setHoverMaterial:function(value){
            this._private.materialHover = value;
        },
        getHoverMaterial:function(){
            return this._private.materialHover;
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
        setX:function(value){
            this._private._x = value;
            _updatePosition.call(this);
        },
        getX:function(){
            return this._x;
        },
        setY:function(value){
            this._private._y = value;
            _updatePosition.call(this);

        },
        getY:function(){
            return this._y;
        },
        setZ:function(value){
            this._private._z = value;
            _updatePosition.call(this);

        },
        getZ:function(){
            return this._z;
        },

        setXrotation:function(value){
            this._private._xRotation = value;
            _updatePosition.call(this);
        },
        getXrotation:function(value){
            return this._private._xRotation;
        },
        setYrotation:function(value){
            this._private._yRotation = value;
            _updatePosition.call(this);
        },
        getYrotation:function(value){
            return this._private._yRotation;
        },
        setZrotation:function(value){
            this._private._zRotation = value;
            _updatePosition.call(this);
        },
        getZrotation:function(value){
            return this._private._zRotation;
        },

        getData:function(){
            return   this._private.data;
        },
        setData:function(value){
            this._private.data = value;
        },
        getBumpScale:function(){
            return this._private.bumpScale;
        },
        setBumpScale:function(value){
            this._private.bumpScale = value;
            _initBumpmap.call(this);
            //var mesh = this.getMesh()
            // mesh.material = this.getMaterial();
            //mesh.updateMatrix();
        },
        setBumpMap:function(value ){
            this._private.bumpMap = value;
            _initBumpmap.call(this);
        },
        getBumpMap:function(){
            return  this._private.bumpMap;
        },
        getDispatcher:function(){
            return this._private._spriteEventDispatcher
        },
        getEvent:function(eventName, payload){
            //var evt = new CustomEvent(this.SPRITE_HIT_CHANGED, {'target':{'test':'hellooo'}, 'detail': { data: this.getData() }  });
            // console.log("EVENT DISP", evt)
            //return  evt
            return  new CustomEvent(eventName, { 'detail': payload  });

        }
    };

    //

    return _scope


})();


module.exports = ThreeDeeSprite