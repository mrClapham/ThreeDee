var THREE = require('three'),
    Helpers = require('./Helpers')

var standardController = function(){
    var _this = this
    this.listen(this.SPRITE_HIT_CHANGED, function(e){
        _onHitEvent.call(_this, e);
    });
};

var _onHitEvent = function(e){
    this.getHit() ? _onMouseIn.call(this, e) : _onMouseOut.call(this, e) ;
};

var _onMouseIn = function(e){
    this.setMaterial( this.getHoverMaterial() );
};

var _onMouseOut = function(e){
    this.setMaterial( this._private.materialUnhovered );
};

var defaultMaterial = new THREE.MeshPhongMaterial();

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
            textureMap:null,
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

        this._private.materialDefault = defaultMaterial;
        this._private.materialUnhovered = material ? material : defaultMaterial;
        this._private.material = this._private.materialUnhovered;
        this._private._opt_initialiser = opt_initialiser ? opt_initialiser : {};

        for(var value in this._private._opt_initialiser){
            //Underscore properties are not to be changed.
            if(String(value).charAt(0) != '_') this._private[value] = this._private._opt_initialiser[value];
        }

        this._contoller = opt_controller ? opt_controller :  standardController;
        this._contoller.call(this);
        this._private.modelURL = modelURL ? modelURL : null;

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
        if(this._private.textureMap) _initTextureMap.call(this);
        if(this._private.bumpMap) _initBumpmap.call(this);
        this._private.modelURL ?  _intModel.call(this) : _initDefaultModel.call(this);
    };

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
        // position transforms need to be applied individually...
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
            //console.log(err)
        }
    };

    var _updatePosition = function(){
        var mesh = this._private._mesh
        mesh.position.x = this._private._x;
        mesh.position.y = this._private._y;
        mesh.position.z = this._private._z;
        //
        mesh.rotation.x = this._private._xRotation;
        mesh.rotation.y = this._private._yRotation;
        mesh.rotation.z = this._private._zRotation;
    };

    var _initTextureMap = function(){
        var _this = this;
        var tex = new THREE.TextureLoader();
        tex.load(this.getTextureMap(), function(evt){
            _this.getMaterial().map = evt;
            _this.getMaterial().needsUpdate =  true;
        });

    };

    var _initBumpmap = function(){

        var _this = this;
        var tex = new THREE.TextureLoader();
        tex.load(this.getBumpMap(), function(evt){
            _this.getMaterial().bumpScale = _this.getBumpScale();
            _this.getMaterial().bumpMap = evt;
            _this.getMaterial().needsUpdate =  true;
        });
    };

    var _onSceneSet = function(){
        //  Due to the asynchronous way the models load this mesh may not yet be defined.
        //  If so the mesh should be added during the callback from the loader (this._loader.load... etc)
        try{
            this.addToScene();
        }catch(e){
            //---
        }
    };

    var _onHitChanged = function(){
        this.getDispatcher().dispatchEvent( this.getEvent(this.SPRITE_HIT_CHANGED, {data:this.getData(), target:this}) );
    };

    /* Methods */
    _scope.prototype = {
        /**
         * Sets the Scene which the Sprite belongs to.
         * @param value
         */
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
               // console.log("Error setting material ")
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
            return this._private._x;
        },
        setY:function(value){
            this._private._y = value;
            _updatePosition.call(this);

        },
        getY:function(){
            return this._private._y;
        },
        setZ:function(value){
            this._private._z = value;
            _updatePosition.call(this);
        },
        getZ:function(){
            return this._private._z;
        },

        setXrotation:function(value){
            this._private._xRotation = Helpers.checkNumberValid(value);
            _updatePosition.call(this);
        },
        getXrotation:function(value){
            return this._private._xRotation;
        },
        setYrotation:function(value){
            this._private._yRotation = Helpers.checkNumberValid(value);;
            _updatePosition.call(this);
        },
        getYrotation:function(value){
            return this._private._yRotation;
        },
        setZrotation:function(value){
            this._private._zRotation = Helpers.checkNumberValid(value);;
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
        getTextureMap:function(){
            return this._private.textureMap;
        },
        setTextureMap:function(value){
            this._private.textureMap = value;
            _initTextureMap.call(this);
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
            return  new CustomEvent(eventName, { 'detail': payload  });

        }
    };

    //

    return _scope


})();


module.exports = ThreeDeeSprite;