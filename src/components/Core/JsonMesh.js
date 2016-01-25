import Container from 'Container'
import gui from '../Utils/GUI'
import FolderInspector from '../Utils/FolderInspector'
/**
 * JsonMesh class
 */
class JsonMesh {

  /**
   * Constructor function
   * @return {void}
   */
  constructor() {
    this.mesh
    this.mixer
    this.clipMorpher
    this.currentMesh = 'suzanne'
    this.loader = new THREE.JSONLoader()
    // this.folderInspector = new FolderInspector()
    this.scene = Container.get( 'Scene' )
    this.clock = Container.get( 'Clock' )
    this.gui = Container.get( 'GUI' )



    // GUI Vars
    this.scale = 10
    this.animationSpeed = 10
    this.enableRotation = true
    this.meshList = ['suzanne', 'suzanne2']



    this.initGUI()
  }

  /**
   * Load a json model function
   * @param {string} model Model name
   * @param {function} callback Callback function
   * @return {void}
   */
  loadModel(model) {


    return new Promise((resolve, reject) => {
      try {
        this.loader.load( "../models/" + model + ".json", ( geometry, materials ) => {
            this.mesh = new THREE.Mesh( geometry,  materials[0] )

            this.mesh.material.morphTargets = true;
            this.mesh.material.verticesNeedUpdate = true;
            this.mesh.material.normalsNeedUpdate = true;

            this.clipMorpher = THREE.AnimationClip.CreateFromMorphTargetSequence( 'animation_', this.mesh.geometry.morphTargets, 25 )

    				this.mixer = new THREE.AnimationMixer( this.mesh )
    				this.mixer.addAction( new THREE.AnimationAction( this.clipMorpher ) )

            resolve(this.mesh)
    		})
      } catch (e) {
        reject("error ", e)
      }
    })
  }

  /**
   * InitGUI function
   * @return {void}
   */
  initGUI() {

    this.gui.add(this, 'currentMesh', this.meshList).onChange((newValue) => {
      this.scene.meshIsLoaded = false
      this.scene.remove(this.mesh)

      this.loadModel(newValue).then( () => {
        const bbox = new THREE.Box3().setFromObject(this.mesh)

        this.mesh.position.y = Math.abs(bbox.min.y) + 20
        this.mesh.rotation.y = 0
        this.scene.add(this.mesh);
        this.scene.meshIsLoaded = true

      });

    });

    this.gui.add(this, 'animationSpeed', 0, 30)

    this.gui.add(this, 'scale', 0.5, 30).onChange((newValue) => {
      this.mesh.position.y = 0

      const bbox = new THREE.Box3().setFromObject(this.mesh)

      this.mesh.position.y = Math.abs(bbox.min.y) + 20
    });

    this.gui.add(this, 'enableRotation')
  }

  /**
   * Animation call by raf
   * @return {void}
   */
  animate() {
    const delta = this.animationSpeed * this.clock.getDelta()

    if(this.mesh && this.enableRotation) {
      this.mesh.rotation.y += 0.003
    }

    if( this.mixer ) {
			this.mixer.update( delta )
		}

    this.mesh.scale.set(this.scale, this.scale, this.scale)
  }

}

export default JsonMesh
