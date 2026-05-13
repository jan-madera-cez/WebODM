import React from 'react';
import './css/ModelView.scss';
import ErrorMessage from './components/ErrorMessage';
import SwitchModeButton from './components/SwitchModeButton';
import AssetDownloadButtons from './components/AssetDownloadButtons';
import Standby from './components/Standby';
import ShareButton from './components/ShareButton';
import ImagePopup from './components/ImagePopup';
import MediaView from './components/MediaView';
import Utils from './classes/Utils';
import Detection3DUtils from './classes/Detection3D';
import PropTypes from 'prop-types';
import PluginsAPI from './classes/plugins/API';
import update from 'immutability-helper';
import * as THREE from 'THREE';
import $ from 'jquery';
import { _, interpolate } from './classes/gettext';
import UnitSelector from './components/UnitSelector';
import { getUnitSystem, setUnitSystem, onUnitSystemChanged, offUnitSystemChanged } from './classes/Units';

require('./vendor/OBJLoader');
require('./vendor/MTLLoader');
require('./vendor/GLTFLoader');
require('./vendor/DRACOLoader');

class SetCameraView extends React.Component{
    static propTypes = {
        viewer: PropTypes.object.isRequired,
        task: PropTypes.object.isRequired
    }

    constructor(props){
        super(props);
        
        this.state = {
            error: "",
            showOk: false
        }
    }

    handleClick = () => {
        const { view } = Potree.saveProject(this.props.viewer);
        const showError = () => {
            this.setState({error: _("Cannot set initial camera view")});
            setTimeout(() => this.setState({error: ""}), 3000);
        };
        const showOk = () => {
            this.setState({showOk: true});
            setTimeout(() => this.setState({showOk: false}), 2000);
        }

        $.ajax({
            url: `/api/projects/${this.props.task.project}/tasks/${this.props.task.id}/3d/cameraview`,
            contentType: 'application/json',
            data: JSON.stringify(view),
            dataType: 'json',
            type: 'POST'
          }).done(result => {
            if (result.success) showOk();
            else showError();
          }).fail(() => {
            showError();
          });
    }

    render(){
        return ([<input key="btn" type="button" onClick={this.handleClick} 
                    style={{marginBottom: 12, display: 'inline-block'}} name="set_camera_view" 
                    value={_("set initial camera view")} />,
                this.state.showOk ? (<div key="ok" style={{color: 'lightgreen', display: 'inline-block', marginLeft: 12}}>✓</div>) : "",
                this.state.error ? (<div key="error" style={{color: 'red'}}>{this.state.error}</div>) : ""
                ]
        );
    }
}

class TexturedModelMenu extends React.Component{
    static propTypes = {
        toggleTexturedModel: PropTypes.func.isRequired,
        selected: PropTypes.bool
    }

    static defaultProps = {
        selected: false
    }

    constructor(props){
        super(props);

        this.state = {
            showTexturedModel: props.selected
        }
        
        // Translation for sidebar.html
        _("Cameras");
    }

    handleClick = (e) => {
        this.setState({showTexturedModel: e.target.checked});
        this.props.toggleTexturedModel(e);
    }

    render(){
        return (<label><input 
                            type="checkbox" 
                            checked={this.state.showTexturedModel}
                            onChange={this.handleClick}
                        /> {_("Show Model")}</label>);
    }
}

class CamerasMenu extends React.Component{
    static propTypes = {
        toggleCameras: PropTypes.func.isRequired,
        changeCameraScale: PropTypes.func.isRequired
    }

    constructor(props){
        super(props);

        this.state = {
            showCameras: false
        }
    }

    componentDidMount(){
        if (this.sldCameraSize){
            $(this.sldCameraSize).slider({
                min: 0.1, max: 4, step: 0.1,
                value: 1.0,
                slide: (event, ui) => {
                    this.props.changeCameraScale(ui.value);
                }
            });
        }
    }

    handleClick = (e) => {
        this.setState({showCameras: e.target.checked});
        this.props.toggleCameras(e);
    }

    render(){
        return (<div>
            <div><label><input type="checkbox" 
                    checked={this.state.showCameras}
                    onChange={this.handleClick}
                /> {_("Show Cameras")}</label>
            </div>
            <div style={{marginTop: 12}}>
                <span>{_("Size")}</span>
                <div ref={domNode => this.sldCameraSize = domNode}></div>
            </div>
            </div>);
    }
}

class PanoramasMenu extends React.Component{
    static propTypes = {
        togglePanoramas: PropTypes.func.isRequired,
        changePanoramaMarkerSize: PropTypes.func.isRequired,
        initialSize: PropTypes.number.isRequired
    }

    constructor(props){
        super(props);

        this.state = {
            showPanoramas: false
        };
    }

    componentDidMount(){
        if (this.sldPanoramaSize){
            $(this.sldPanoramaSize).slider({
                min: 0.05, max: 1.0, step: 0.025,
                value: this.props.initialSize,
                slide: (event, ui) => {
                    this.props.changePanoramaMarkerSize(ui.value);
                }
            });
        }
    }

    handleClick = (e) => {
        this.setState({showPanoramas: e.target.checked});
        this.props.togglePanoramas(e);
    }

    render(){
        return (<div>
            <div><label><input type="checkbox"
                    checked={this.state.showPanoramas}
                    onChange={this.handleClick}
                /> {_("Show Panoramas")}</label>
            </div>
            <div style={{marginTop: 12}}>
                <span>{_("Marker size")}</span>
                <div ref={domNode => this.sldPanoramaSize = domNode}></div>
            </div>
            </div>);
    }
}

class Detection3DMenu extends React.Component{
    static propTypes = {
        toggleDetection3D: PropTypes.func.isRequired,
        changeDetection3DMarkerSize: PropTypes.func.isRequired,
        initialSize: PropTypes.number.isRequired
    }

    constructor(props){
        super(props);

        this.state = {
            showDetections: false
        };
    }

    componentDidMount(){
        if (this.sldDetectionSize){
            $(this.sldDetectionSize).slider({
                min: 0.05, max: 1.0, step: 0.025,
                value: this.props.initialSize,
                slide: (event, ui) => {
                    this.props.changeDetection3DMarkerSize(ui.value);
                }
            });
        }
    }

    handleClick = (e) => {
        this.setState({showDetections: e.target.checked});
        this.props.toggleDetection3D(e);
    }

    render(){
        return (<div>
            <div><label><input type="checkbox"
                    checked={this.state.showDetections}
                    onChange={this.handleClick}
                /> {_("Show Detection3D")}</label>
            </div>
            <div style={{marginTop: 12}}>
                <span>{_("Marker size")}</span>
                <div ref={domNode => this.sldDetectionSize = domNode}></div>
            </div>
            </div>);
    }
}

const CAMERA_SCALES = {
    'm': 1.0,
    'ft': 3.28,
    'US survey foot': 3.28
};

const PANORAMA_MARKER_SIZES = {
    'm': 0.1,
    'ft': 0.328,
    'US survey foot': 0.328
};

const DETECTION3D_MARKER_SIZES = {
    'm': 0.12,
    'ft': 0.394,
    'US survey foot': 0.394
};

class ModelView extends React.Component {
  static defaultProps = {
    task: null,
    public: false,
    shareButtons: true,
    modelType: "cloud"
  };

  static propTypes = {
      task: PropTypes.object.isRequired, // The object should contain two keys: {id: <taskId>, project: <projectId>}
      public: PropTypes.bool, // Is the view being displayed via a shared link?
      shareButtons: PropTypes.bool,
      modelType: PropTypes.oneOf(['cloud', 'mesh'])
  };

  constructor(props){
    super(props);

    this.state = {
      error: "",
      showingTexturedModel: false,
      initializingModel: false,
      texModelLoadProgress: null,
      selectedCamera: null,
      selectedPanorama: null,
      selectedDetection3D: null,
      modalOpen: false,
      cameraScale: CAMERA_SCALES[props.task.srs.units] || 1.0,
      panoramaMarkerSize: PANORAMA_MARKER_SIZES[props.task.srs.units] || 0.1,
      detection3DMarkerSize: DETECTION3D_MARKER_SIZES[props.task.srs.units] || 0.12,
      pluginActionButtons: []
    };

    this.pointCloud = null;
    this.modelReference = null;

    this.cameraMeshes = [];
    this.panoramaMeshes = [];
    this.detection3DMeshes = [];
    this.detection3DEntries = [];
    this.panoramaOverlayScene = new THREE.Scene();
    this.panoramaMarkerTexture = null;
    this.detection3DMarkerTexture = null;
    this.loadingPanoramas = false;
    this.panoramaMarkersLoaded = false;
    this.detection3DMarkersLoaded = false;
  }

  basePath = () => {
    return `/api/projects/${this.props.task.project}/tasks/${this.props.task.id}`;
  }

  assetsPath = () => {
    return `${this.basePath()}/assets`;
  }

  mediaBasePath = () => {
    return `${this.basePath()}/media`;
  }

  urlExists = (url, cb) => {
    $.ajax({
        url: url,
        type:'HEAD',
        error: () => {
            cb(false);
        },
        success: () => {
            cb(true);
        }
    });
  }

  loadGeoreferencingOffset = (cb) => {
    const geoFile = `${this.assetsPath()}/odm_georeferencing/coords.txt`;
    const legacyGeoFile = `${this.assetsPath()}/odm_georeferencing/odm_georeferencing_model_geo.txt`;
    const getGeoOffsetFromUrl = (url) => {
        $.ajax({
            url: url,
            type: 'GET',
            error: () => {
                console.warn(`Cannot find ${url} (not georeferenced?)`);
                cb({x: 0, y: 0});
            },
            success: (data) => {
                const lines = data.split("\n");
                if (lines.length >= 2){
                    const [ x, y ] = lines[1].split(" ").map(parseFloat);
                    cb({x, y});
                }else{
                    console.warn(`Malformed georeferencing file: ${data}`);
                    cb({x: 0, y: 0});
                }
            }
        });
    };

    $.ajax({
        type: "HEAD",
        url: legacyGeoFile
    }).done(() => {
        // If a legacy georeferencing file is present
        // we'll use that
        getGeoOffsetFromUrl(legacyGeoFile);
    }).fail(() => {
        getGeoOffsetFromUrl(geoFile);
    });

    
  }

  pointCloudFilePath = (cb) => {
    // Check if entwine point cloud exists, 
    // otherwise fallback to potree point cloud binary format path
    const entwinePointCloud = this.assetsPath() + '/entwine_pointcloud/ept.json';
    const potreePointCloud = this.assetsPath() + '/potree_pointcloud/cloud.js';

    this.urlExists(entwinePointCloud, (exists) => {
        if (exists) cb(entwinePointCloud);
        else cb(potreePointCloud);
    });
  }

  texturedModelDirectoryPath = () => {
    return this.assetsPath() + '/odm_texturing/';
  }

  hasGeoreferencedAssets = () => {
    return this.props.task.available_assets.indexOf('orthophoto.tif') !== -1;
  }

  hasTexturedModel = () => {
    return this.props.task.available_assets.indexOf('textured_model.zip') !== -1;
  }

  getTexturedModelType = () => {
    if (this.props.task.available_assets.indexOf('textured_model.glb') !== -1) return 'gltf';
    else return 'obj';
  }

  hasCameras = () => {
    return this.props.task.available_assets.indexOf('shots.geojson') !== -1;
  }

  addPanoramasMenu(){
    if ($("#panoramas_container").length) return;

    const $container = $(`
        <div id="panoramas_container">
            <h3 id="panoramas">${_("Panoramas")}</h3>
            <div id="panoramas_button"></div>
        </div>
    `);

    if ($("#cameras_container").length){
        $container.insertAfter($("#cameras_container"));
    }else{
        $container.insertBefore($("#scene_export").parent());
    }
  }

  addDetection3DMenu(){
    if ($("#detection3d_container").length) return;

    const $container = $(`
        <div id="detection3d_container" style="display:none">
            <h3 id="detection3d">${_("Detection3D")}</h3>
            <div id="detection3d_button"></div>
        </div>
    `);

    if ($("#panoramas_container").length){
        $container.insertAfter($("#panoramas_container"));
    }else if ($("#cameras_container").length){
        $container.insertAfter($("#cameras_container"));
    }else{
        $container.insertBefore($("#scene_export").parent());
    }
  }

  renderDetection3DMenu(){
    this.addDetection3DMenu();

    if (this.detection3DEntries.length === 0){
        $("#detection3d").hide();
        $("#detection3d_container").hide();
        return;
    }

    $("#detection3d").show();
    $("#detection3d_container").show();
    window.ReactDOM.render(<Detection3DMenu
          toggleDetection3D={this.toggleDetection3D}
          changeDetection3DMarkerSize={this.changeDetection3DMarkerSize}
          initialSize={this.state.detection3DMarkerSize}
      />, $("#detection3d_button").get(0));
  }

  objFilePath = (cb) => {
    // Mostly for backward compatibility
    // as newer versions of ODX do not have 
    // a odm_textured_model.obj
    const geoUrl = this.texturedModelDirectoryPath() + 'odm_textured_model_geo.obj';
    const nongeoUrl = this.texturedModelDirectoryPath() + 'odm_textured_model.obj';

    $.ajax({
        type: "HEAD",
        url: geoUrl
    }).done(() => {
        cb(geoUrl);
    }).fail(() => {
        cb(nongeoUrl);
    });
  }

  glbFilePath = () => {
    let url = this.basePath() + '/textured_model/';
    
    if (Utils.isIOS()) url += "?platform=ios";
    else if (Utils.isMobile()) url += "?platform=mobile";
    
    return url;
  }

  mtlFilename = (cb) => {
    // Mostly for backward compatibility
    // as newer versions of ODX do not have 
    // a odm_textured_model.mtl
    const geoUrl = this.texturedModelDirectoryPath() + 'odm_textured_model_geo.mtl';

    $.ajax({
        type: "HEAD",
        url: geoUrl
    }).done(() => {
        cb("odm_textured_model_geo.mtl");
    }).fail(() => {
        cb("odm_textured_model.mtl");
    });
  }

  getSceneData(){
      let json = Potree.saveProject(window.viewer);

      // Remove view, settings since we don't want to trigger
      // scene updates when these change.
      delete json.view;
      delete json.settings;
      delete json.cameraAnimations;

      return json;
  }

  componentDidMount() {
    let container = this.container;
    if (!container) return; // Enzyme tests don't have support for all WebGL methods so we just skip this

    window.viewer = new Potree.Viewer(container);
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);

    if (Utils.isIOS()){
        viewer.setPointBudget(1000*1000);
    }else if (Utils.isMobile()){
        viewer.setPointBudget(2*1000*1000);
    }else{
        viewer.setPointBudget(10*1000*1000);
    }
    viewer.setEDLEnabled(true);
    viewer.loadSettingsFromURL();

    const origSetUnit = viewer.setLengthUnitAndDisplayUnit;
    onUnitSystemChanged(this.handleUnitSystemChanged);

    viewer.setLengthUnitAndDisplayUnit = (lengthUnit, displayUnit) => {
        if (displayUnit === 'm') setUnitSystem('metric');
        else if (displayUnit === 'ft') setUnitSystem("imperial");
        else if (displayUnit === 'ft (US)') setUnitSystem("imperialUS");

        origSetUnit.call(viewer, lengthUnit, displayUnit);
    };
        
    viewer.loadGUI(() => {
      viewer.setLanguage('en');
      $("#menu_tools").next().show();

    // Don't open sidebar on small screens
    if (window.innerWidth > 600) {
        viewer.toggleSidebar();
    }

      if (this.hasTexturedModel()){
          window.ReactDOM.render(<TexturedModelMenu selected={this.props.modelType === 'mesh'} toggleTexturedModel={this.toggleTexturedModel}/>, $("#textured_model_button").get(0));
      }else{
          $("#textured_model").hide();
          $("#textured_model_container").hide();
      }

      if (this.hasCameras()){
          window.ReactDOM.render(<CamerasMenu 
                toggleCameras={this.toggleCameras}
                changeCameraScale={this.changeCameraScale}
            />, $("#cameras_button").get(0));
      }else{
          $("#cameras").hide();
          $("#cameras_container").hide();
      }

      this.addPanoramasMenu();
      window.ReactDOM.render(<PanoramasMenu
            togglePanoramas={this.togglePanoramas}
            changePanoramaMarkerSize={this.changePanoramaMarkerSize}
            initialSize={this.state.panoramaMarkerSize}
        />, $("#panoramas_button").get(0));
      this.renderDetection3DMenu();

      if (!this.props.public){
          const $scv = $("<div id='set-camera-view'></div>");
          $scv.prependTo($("#scene_export").parent());
          window.ReactDOM.render(<SetCameraView viewer={viewer} task={this.props.task} />, $scv.get(0));
      }
    });

    viewer.scene.scene.add( new THREE.AmbientLight( 0x404040, 2.0 ) ); // soft white light );
    viewer.scene.scene.add( new THREE.DirectionalLight( 0xcccccc, 0.5 ) );

    const directional = new THREE.DirectionalLight( 0xcccccc, 0.5 );
    directional.position.z = 99999999999;
    viewer.scene.scene.add( directional );

    this.pointCloudFilePath(pointCloudPath =>{ 
        Potree.loadPointCloud(pointCloudPath, "Point Cloud", e => {
          if (e.type == "loading_failed"){
            this.setState({error: "Could not load point cloud. This task doesn't seem to have one. Try processing the task again."});
            return;
          }
          
          // Set crop vertices if needed
          e.pointcloud.material.cropVertices = this.getCropCoordinates();

          // Automatically load 3D model if required
          if (this.hasTexturedModel() && this.props.modelType === "mesh"){
            this.toggleTexturedModel({ target: { checked: true }});
          }
    
          let scene = viewer.scene;
          scene.addPointCloud(e.pointcloud);
          this.pointCloud = e.pointcloud;
    
          let material = e.pointcloud.material;
          material.size = 1;

          viewer.fitToScreen();
        
          this.handleUnitSystemChanged();

          // Load saved scene (if any)
          $.ajax({
              type: "GET",
              url: `/api/projects/${this.props.task.project}/tasks/${this.props.task.id}/3d/scene`
          }).done(sceneData => {
            this.detection3DEntries = Detection3DUtils.normalizeDetection3DEntries(sceneData);
            this.renderDetection3DMenu();
            this.loadDetection3D(false);
            let localSceneData = Potree.saveProject(viewer);

            // Check if we do not have a view set
            // if so, just keep the current view information
            if (!sceneData.view || !sceneData.view.position){
                sceneData.view = localSceneData.view;
            }

            const keepKeys = ['pointclouds', 'settings', 'cameraAnimations'];
            for (let k of keepKeys){
                sceneData[k] = localSceneData[k];
            }
            
            for (let k in localSceneData){
                if (keepKeys.indexOf(k) === -1){
                    sceneData[k] = sceneData[k] || localSceneData[k];
                }
            }

            // Load
            const potreeLoadProject = () => {
                Potree.loadProject(viewer, sceneData);
                viewer.removeEventListener("update", potreeLoadProject);
            };
            viewer.addEventListener("update", potreeLoadProject);

            // Every 3 seconds, check if the scene has changed
            // if it has, save the changes server-side
            // Unfortunately Potree does not have reliable events
            // for trivially detecting changes in measurements
            let saveSceneReq = null;
            let saveSceneInterval = null;
            let saveSceneErrors = 0;
            let prevSceneData = JSON.stringify(this.getSceneData());
            
            const postSceneData = (sceneData) => {
                if (saveSceneReq){
                    saveSceneReq.abort();
                    saveSceneReq = null;
                }
    
                saveSceneReq = $.ajax({
                    url: `/api/projects/${this.props.task.project}/tasks/${this.props.task.id}/3d/scene`,
                    contentType: 'application/json',
                    data: sceneData,
                    dataType: 'json',
                    type: 'POST'
                    }).done(result => {
                        if (result.success){
                            saveSceneErrors = 0;
                            prevSceneData = sceneData;
                        }else{
                            console.warn("Cannot save Potree scene");
                        }
                    }).fail(() => {
                        console.error("Cannot save Potree scene");
                        if (++saveSceneErrors === 5) clearInterval(saveSceneInterval);
                    });
            };

            const checkScene = () => {
                const sceneData = JSON.stringify(this.getSceneData());
                if (sceneData !== prevSceneData) postSceneData(sceneData);
                
                // Potree is a bit strange, sometimes fitToScreen does
                // not work, so we check whether the camera position is still
                // at zero and recall fitToScreen
                const pos = viewer.scene.view.position;
                if (pos.x === 0 && pos.y === 0 && pos.z === 0) viewer.fitToScreen();
            };

            saveSceneInterval = setInterval(checkScene, 3000);
          }).fail(e => {
            console.error("Cannot load 3D scene information", e);
          });
        });
    });

    viewer.renderer.domElement.addEventListener( 'mousedown', this.handleRenderMouseClick );
    viewer.renderer.domElement.addEventListener( 'mousemove', this.handleRenderMouseMove );
    viewer.renderer.domElement.addEventListener( 'touchstart', this.handleRenderTouchStart );
    viewer.addEventListener("render.pass.perspective_overlay", this.renderOverlay);
    
    PluginsAPI.ModelView.triggerAddActionButton({
      viewer
    }, (button) => {
      this.setState(update(this.state, {
        pluginActionButtons: {$push: [button]}
      }));
    });
  }

  handleUnitSystemChanged = () => {
    if (!window.viewer) return;

    const us = getUnitSystem();
    
    // GDAL --> Potree
    const UNIT_MAP = { 
        'm': 'm',
        'ft': 'ft',
        'US survey foot': 'ft (US)'
    };

    const dsUnit = UNIT_MAP[this.props.task.srs.units] || 'm';

    if (us === 'metric'){
        window.viewer.setLengthUnitAndDisplayUnit(dsUnit, 'm');
    }else if (us === 'imperial'){
        window.viewer.setLengthUnitAndDisplayUnit(dsUnit, 'ft');
    }else if (us === 'imperialUS'){
        window.viewer.setLengthUnitAndDisplayUnit(dsUnit, 'ft (US)');
    }
  }

  getCropCoordinates(){
    if (this.props.task.crop_projected && this.props.task.crop_projected.length >= 3){
        return this.props.task.crop_projected.map(coord => {
            return new THREE.Vector3(coord[0], coord[1], 0.0);
        });
    }
  }

  componentWillUnmount(){
    offUnitSystemChanged(this.handleUnitSystemChanged);
    viewer.renderer.domElement.removeEventListener( 'mousedown', this.handleRenderMouseClick );
    viewer.renderer.domElement.removeEventListener( 'mousemove', this.handleRenderMouseMove );
    viewer.renderer.domElement.removeEventListener( 'touchstart', this.handleRenderTouchStart );
    viewer.removeEventListener("render.pass.perspective_overlay", this.renderOverlay);

    this.cameraMeshes.forEach(cam => {
        if (cam.parent) viewer.scene.scene.remove(cam.parent);
    });
    this.panoramaMeshes.forEach(marker => {
        this.panoramaOverlayScene.remove(marker);
        if (marker.material) marker.material.dispose();
    });
    this.detection3DMeshes.forEach(marker => {
        this.panoramaOverlayScene.remove(marker);
        if (marker.material) marker.material.dispose();
    });
    if (this.panoramaMarkerTexture) {
        this.panoramaMarkerTexture.dispose();
        this.panoramaMarkerTexture = null;
    }
    if (this.detection3DMarkerTexture) {
        this.detection3DMarkerTexture.dispose();
        this.detection3DMarkerTexture = null;
    }
  }

  getPanoramaMarkerTexture = () => {
    if (this.panoramaMarkerTexture) return this.panoramaMarkerTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(64, 64, 48, 0, Math.PI * 2);
    context.fillStyle = '#ff9800';
    context.fill();

    context.lineWidth = 8;
    context.strokeStyle = '#ffffff';
    context.stroke();

    context.beginPath();
    context.arc(64, 64, 18, 0, Math.PI * 2);
    context.fillStyle = '#1f1f1f';
    context.fill();

    this.panoramaMarkerTexture = new THREE.CanvasTexture(canvas);
    return this.panoramaMarkerTexture;
  }

  createPanoramaMarker = (entry, visible) => {
    const material = new THREE.SpriteMaterial({
        map: this.getPanoramaMarkerTexture(),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: 1.0,
        sizeAttenuation: true
    });

    const marker = new THREE.Sprite(material);
    marker._media = entry;
    marker._position = entry.position;
    marker.center.set(0.5, 0.5);
    marker.renderOrder = 9999;
    marker.visible = visible;

    const markerSize = this.state.panoramaMarkerSize;
    marker.scale.set(markerSize, markerSize, 1);
    marker.position.set(entry.position[0], entry.position[1], entry.position[2]);
    return marker;
  }

  getDetection3DMarkerTexture = () => {
    if (this.detection3DMarkerTexture) return this.detection3DMarkerTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(64, 64, 44, 0, Math.PI * 2);
    context.fillStyle = '#1e88e5';
    context.fill();

    context.lineWidth = 8;
    context.strokeStyle = '#ffffff';
    context.stroke();

    context.beginPath();
    context.arc(64, 64, 10, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();

    this.detection3DMarkerTexture = new THREE.CanvasTexture(canvas);
    return this.detection3DMarkerTexture;
  }

  createDetection3DMarker = (entry, visible) => {
    const material = new THREE.SpriteMaterial({
        map: this.getDetection3DMarkerTexture(),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: 1.0,
        sizeAttenuation: true
    });

    const marker = new THREE.Sprite(material);
    marker._detection3d = entry;
    marker._position = entry.coordinates;
    marker.center.set(0.5, 0.5);
    marker.renderOrder = 9999;
    marker.visible = visible;

    const markerSize = this.state.detection3DMarkerSize;
    marker.scale.set(markerSize, markerSize, 1);
    marker.position.set(entry.coordinates[0], entry.coordinates[1], entry.coordinates[2]);
    return marker;
  }

  renderOverlay = () => {
    if (!this.panoramaMeshes.some(marker => marker.visible) &&
        !this.detection3DMeshes.some(marker => marker.visible)) return;

    const camera = viewer.scene.getActiveCamera();
    viewer.renderer.render(this.panoramaOverlayScene, camera);
  }

  getIntersectionUnderCursor = (evt, objects) => {
    const raycaster = new THREE.Raycaster();
    const rect = viewer.renderer.domElement.getBoundingClientRect();
    const [x, y] = [evt.clientX, evt.clientY];
    const array = [
        (x - rect.left) / rect.width,
        (y - rect.top) / rect.height
    ];
    const onClickPosition = new THREE.Vector2(...array);
    const camera = viewer.scene.getActiveCamera();
    const mouse = new THREE.Vector3(
        + (onClickPosition.x * 2) - 1,
        - (onClickPosition.y * 2) + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0){
        return intersects[0].object;
    }
  }

  getCameraUnderCursor = (evt) => {
    const cameraMesh = this.getIntersectionUnderCursor(evt, this.cameraMeshes);
    if (cameraMesh){
        return cameraMesh.parent.parent;
    }
  }

  getPanoramaUnderCursor = (evt) => {
    const marker = this.getIntersectionUnderCursor(evt, this.panoramaMeshes);
    if (marker){
        return marker._media;
    }
  }

  getDetection3DUnderCursor = (evt) => {
    const marker = this.getIntersectionUnderCursor(evt, this.detection3DMeshes);
    if (marker){
        return marker._detection3d;
    }
  }

  setCameraOpacity(camera, opacity){
    camera.traverse(obj => {
        if (obj.material) obj.material.opacity = opacity;
    });
  }

  handleRenderMouseMove = (evt) => {
    if (this._prevCamera && this._prevCamera !== this.state.selectedCamera) {
        this.setCameraOpacity(this._prevCamera, 0.7);
    }

    const camera = this.getCameraUnderCursor(evt);
    const detection3D = camera ? null : this.getDetection3DUnderCursor(evt);
    const panorama = camera || detection3D ? null : this.getPanoramaUnderCursor(evt);
    if (camera){
        viewer.renderer.domElement.classList.add("pointer-cursor");
        this.setCameraOpacity(camera, 1);
    }else if (detection3D){
        viewer.renderer.domElement.classList.add("pointer-cursor");
    }else if (panorama){
        viewer.renderer.domElement.classList.add("pointer-cursor");
    }else{
        viewer.renderer.domElement.classList.remove("pointer-cursor");
    }
    this._prevCamera = camera;
  }

  handleRenderTouchStart = (evt) => {
    if (evt.touches.length === 1){
        this.handleRenderMouseClick({clientX: evt.touches[0].clientX, clientY: evt.touches[0].clientY});
    }
  }

  handleRenderMouseClick = (evt) => {
    let camera = this.getCameraUnderCursor(evt);
    // Deselect
    if (camera === this.state.selectedCamera){
        this.setState({selectedCamera: null, selectedPanorama: null, selectedDetection3D: null});
    }else if (camera){
        if (this.state.selectedCamera){
            this.setCameraOpacity(this.state.selectedCamera, 0.7);
        }
        this.setState({selectedCamera: camera, selectedPanorama: null, selectedDetection3D: null});
    }else{
        const detection3D = this.getDetection3DUnderCursor(evt);
        if (detection3D){
            if (this.state.selectedCamera){
                this.setCameraOpacity(this.state.selectedCamera, 0.7);
            }
            if (this.state.selectedDetection3D && this.state.selectedDetection3D.id === detection3D.id){
                this.setState({selectedCamera: null, selectedPanorama: null, selectedDetection3D: null});
            }else{
                this.setState({selectedCamera: null, selectedPanorama: null, selectedDetection3D: detection3D});
            }
            return;
        }

        const panorama = this.getPanoramaUnderCursor(evt);
        if (panorama && this.state.selectedPanorama && this.state.selectedPanorama.filename === panorama.filename){
            this.setState({selectedPanorama: null, selectedDetection3D: null});
        }else if (panorama){
            if (this.state.selectedCamera){
                this.setCameraOpacity(this.state.selectedCamera, 0.7);
            }
            this.setState({selectedCamera: null, selectedPanorama: panorama, selectedDetection3D: null});
        }
    }
  }

  closeThumb = (e) => {
    e.stopPropagation();
    this.setState({selectedCamera: null});
  }

  closePanorama = () => {
    this.setState({selectedPanorama: null});
  }

  closeDetection3D = () => {
    this.setState({selectedDetection3D: null});
  }

  loadCameras(){
    const { task } = this.props;

    function getMatrix(translation, rotation, scale) {
        var axis = new THREE.Vector3(-rotation[0],
                                    -rotation[1],
                                    -rotation[2]);
        var angle = axis.length();
        axis.normalize();
        var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
        matrix.setPosition(new THREE.Vector3(translation[0], translation[1], translation[2]));
        
        if (scale != 1.0){
            matrix.scale(new THREE.Vector3(scale, scale, scale));
        }

        return matrix.transpose();
    }

    if (this.hasCameras()){
        const fileloader = new THREE.FileLoader();
        
        this.loadGltf('/static/app/models/camera.glb', (err, gltf) => {
            if (err){
                console.error(err);
                return;
            }

            const cameraObj = gltf.scene;

            fileloader.load(`/api/projects/${task.project}/tasks/${task.id}/download/shots.geojson`,  ( data ) => {
                const geojson = JSON.parse(data);
                cameraObj.traverse(obj => {
                    if (obj.material){
                        obj.material.transparent = true; 
                        obj.material.opacity = 0.7;
                    }
                });
                
                let i = 0;
                geojson.features.forEach(feat => {
                    const cameraMesh = cameraObj.clone();
                    cameraMesh.traverse((node) => {
                        if (node.isMesh) {
                            node.material = node.material.clone();
                        }
                    });

                    cameraMesh.matrixAutoUpdate = false;
                    let scale = this.state.cameraScale;
                    // if (!this.pointCloud.projection) scale = 0.1;

                    cameraMesh.matrix.set(...getMatrix(feat.properties.translation, feat.properties.rotation, scale).elements);
                    
                    viewer.scene.scene.add(cameraMesh);

                    cameraMesh._feat = feat;
                    this.cameraMeshes.push(cameraMesh.children[0].children[1]);

                    i++;
                });
            }, undefined, console.error);
        });
      }
  }

  loadPanoramas = (visible) => {
    if (this.loadingPanoramas || this.panoramaMarkersLoaded) return;

    this.loadingPanoramas = true;
    $.ajax({
        type: "GET",
        url: `${this.mediaBasePath()}/`
    }).done(entries => {
        const panoramas = (entries || []).filter(entry =>
            entry.type === 'pano' &&
            Array.isArray(entry.position) &&
            entry.position.length === 3
        );

        panoramas.forEach(entry => {
            const marker = this.createPanoramaMarker(entry, visible);
            this.panoramaOverlayScene.add(marker);
            this.panoramaMeshes.push(marker);
        });

        this.panoramaMarkersLoaded = true;
    }).fail(err => {
        console.error("Cannot load panorama media", err);
    }).always(() => {
        this.loadingPanoramas = false;
    });
  }

  loadDetection3D = (visible) => {
    if (this.detection3DMarkersLoaded) return;

    this.detection3DEntries.forEach(entry => {
        const marker = this.createDetection3DMarker(entry, visible);
        this.panoramaOverlayScene.add(marker);
        this.detection3DMeshes.push(marker);
    });
    this.detection3DMarkersLoaded = true;
  }

  setPointCloudsVisible = (flag) => {
    viewer.setEDLEnabled(true);
    
    // Using opacity we can still perform measurements
    viewer.setEDLOpacity(flag ? 1 : 0);

    // On mobile, for performance and because opacity doesn't
    // seem to work consistently, we remove the ability to do
    // measurements
    if (Utils.isMobile()){
        for(let pointcloud of viewer.scene.pointclouds){
            pointcloud.visible = flag;
        }
    }
  }

  toggleCameras = (e) => {
    if (this.cameraMeshes.length === 0){
        this.loadCameras();
        if (this.cameraMeshes.length === 0) return;
    }

    const isVisible = this.cameraMeshes[0].visible;
    this.cameraMeshes.forEach(cam => {
        cam.visible = !isVisible;
        cam.parent.visible = cam.visible;
    });
  }

  changeCameraScale = (value) => {
    if (this.cameraMeshes.length === 0) return;

      this.cameraMeshes.forEach(cam => {
          cam.parent.scale.setScalar(value);
      });
  }

  togglePanoramas = (e) => {
    const visible = e.target.checked;
    if (visible && !this.panoramaMarkersLoaded){
        this.loadPanoramas(true);
        return;
    }

    this.panoramaMeshes.forEach(marker => {
        marker.visible = visible;
    });
  }

  toggleDetection3D = (e) => {
    const visible = e.target.checked;
    if (visible && !this.detection3DMarkersLoaded){
        this.loadDetection3D(true);
        return;
    }

    this.detection3DMeshes.forEach(marker => {
        marker.visible = visible;
    });
    if (!visible){
        this.setState({selectedDetection3D: null});
    }
  }

  changePanoramaMarkerSize = (value) => {
    this.setState({panoramaMarkerSize: value});
    this.panoramaMeshes.forEach(marker => {
        marker.scale.set(value, value, 1);
        marker.position.set(
            marker._position[0],
            marker._position[1],
            marker._position[2]
        );
    });
  }

  changeDetection3DMarkerSize = (value) => {
    this.setState({detection3DMarkerSize: value});
    this.detection3DMeshes.forEach(marker => {
        marker.scale.set(value, value, 1);
        marker.position.set(
            marker._position[0],
            marker._position[1],
            marker._position[2]
        );
    });
  }

  loadGltf = (url, cb, onProgress) => {
    if (!this.gltfLoader) this.gltfLoader = new THREE.GLTFLoader();
    if (!this.dracoLoader) {
        this.dracoLoader = new THREE.DRACOLoader();
        this.dracoLoader.setDecoderPath( '/static/app/js/vendor/draco/' );
        this.gltfLoader.setDRACOLoader( this.dracoLoader );
    }

    // Load a glTF resource
    this.gltfLoader.load(url,
        gltf => { cb(null, gltf) },
        onProgress,
        error => { cb(error); },
        {crop: this.getCropCoordinates()}
    );
  }

  toggleTexturedModel = (e) => {
    const value = e.target.checked;

    if (value){
      // Need to load model for the first time?
      if (this.modelReference === null && !this.state.initializingModel){

        this.setState({initializingModel: true});

        const addObject = (object, offset) => {
            object.translateX(offset.x);
            object.translateY(offset.y);

            viewer.scene.scene.add(object);

            this.modelReference = object;
            this.setPointCloudsVisible(false);

            this.setState({
                initializingModel: false,
                showingTexturedModel: true
            });
        }

        if (this.getTexturedModelType() === 'gltf'){
            this.loadGltf(this.glbFilePath(), (err, gltf) => {
                if (err){
                    this.setState({initializingModel: false, error: err});
                    return;
                }
                this.setState({texModelLoadProgress: null});
                
                setTimeout(() => {
                    const offset = {x: 0, y: 0};
                    if (gltf.scene.CESIUM_RTC && gltf.scene.CESIUM_RTC.center){
                        offset.x = gltf.scene.CESIUM_RTC.center[0];
                        offset.y = gltf.scene.CESIUM_RTC.center[1];
                    }
    
                    addObject(gltf.scene, offset);
                }, 0);
            }, xhr => {
                const progress = Math.round((xhr.loaded / xhr.total) * 100);
                this.setState({texModelLoadProgress: progress});
            });
        }else{
            // Legacy OBJ

            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath(this.texturedModelDirectoryPath());
    
            this.mtlFilename(mtlPath => {
                mtlLoader.load(mtlPath, (materials) => {
                    materials.preload();
        
                    const objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials(materials);
                    this.objFilePath(filePath => {
                        objLoader.load(filePath, (object) => {
                            this.loadGeoreferencingOffset((offset) => {
                                addObject(object, offset);
                            });
                        });
                    });
                });
            });
        }
      }else{
        // Already initialized
        this.modelReference.visible = true;
        this.setPointCloudsVisible(false);
        this.setState({showingTexturedModel: true});
      }
    }else{
      this.modelReference.visible = false;
      this.setPointCloudsVisible(true);
      this.setState({showingTexturedModel: false});
    }
  }

  // React render
  render(){
    const { selectedCamera, selectedPanorama, selectedDetection3D, showingTexturedModel } = this.state;
    const { task } = this.props;
    const queryParams = {};
    if (showingTexturedModel){
        queryParams.t = "mesh";
    }

    return (<div className="model-view">
          <ErrorMessage bind={[this, "error"]} />
          <div className="container potree_container" 
             style={{height: "100%", width: "100%", position: "relative"}}
             onContextMenu={(e) => {e.preventDefault();}}>
                <div id="potree_render_area" 
                    ref={(domNode) => { this.container = domNode; }}></div>
                <div id="potree_sidebar_container"> </div>
          </div>

          <div className={"model-action-buttons " + (this.state.modalOpen ? "modal-open" : "")}>
            <UnitSelector />
            <AssetDownloadButtons 
                            task={this.props.task} 
                            direction="up" 
                            showLabel={false}
                            buttonClass="btn-secondary"
                            onModalOpen={() => this.setState({modalOpen: true})}
                            onModalClose={() => this.setState({modalOpen: false})} />
            {this.state.pluginActionButtons.map((button, i) => <div key={i}>{button}</div>)}
            {(this.props.shareButtons && !this.props.public) ? 
            <ShareButton 
                ref={(ref) => { this.shareButton = ref; }}
                task={this.props.task} 
                popupPlacement="top"
                linksTarget="3d"
                queryParams={queryParams}
            />
            : ""}
            <SwitchModeButton 
                public={this.props.public}
                task={this.props.task}
                type="modelToMap" />
        </div>

        {selectedCamera ? <div className="thumbnail">
            <a className="close-thumb" href="javascript:void(0)" onClick={this.closeThumb}><i className="fa fa-window-close"></i></a>
            <ImagePopup feature={selectedCamera._feat} task={task} />
        </div> : ""}

        {selectedPanorama ? <MediaView
            key={selectedPanorama.filename}
            basePath={this.mediaBasePath()}
            media={selectedPanorama}
            autoOpen
            onClose={this.closePanorama}
        /> : ""}

        {selectedDetection3D ? <div className="thumbnail detection3d-popup">
            <a className="close-thumb" href="javascript:void(0)" onClick={this.closeDetection3D}><i className="fa fa-window-close"></i></a>
            <div className="detection3d-popup__title">{selectedDetection3D.displayLabel}</div>
            <table className="table table-striped table-condensed">
                <tbody>
                    <tr><th>{_("Coordinates")}</th><td>{selectedDetection3D.coordinates.map(value => value.toFixed(3)).join(", ")}</td></tr>
                    <tr><th>{_("Method")}</th><td>{selectedDetection3D.localization_method || "-"}</td></tr>
                    <tr><th>{_("Uncertainty")}</th><td>{selectedDetection3D.uncertainty === null ? "-" : selectedDetection3D.uncertainty.toFixed(3)}</td></tr>
                    <tr><th>{_("Dimensions")}</th><td>{selectedDetection3D.dimensions ? selectedDetection3D.dimensions.map(value => value.toFixed(3)).join(", ") : "-"}</td></tr>
                    <tr><th>{_("Supporting images")}</th><td>{selectedDetection3D.supporting_image_count}</td></tr>
                </tbody>
            </table>
            {selectedDetection3D.supporting_detections.length > 0 ? <div className="detection3d-popup__supporting">
                <div className="detection3d-popup__subtitle">{_("Supporting detections")}</div>
                <ul>
                    {selectedDetection3D.supporting_detections.slice(0, 5).map((entry, index) => <li key={index}>
                        {[entry.room, entry.scan_id, entry.text].filter(Boolean).join(" / ")}
                    </li>)}
                </ul>
            </div> : ""}
        </div> : ""}

          <Standby 
            message={_("Loading textured model...")}
            show={this.state.initializingModel}
            progress={this.state.texModelLoadProgress}
            />
      </div>);
  }
}

$(function(){
    // Use gettext for translations
    const oldInit = i18n.init;
    i18n.addPostProcessor("gettext", function(v, k, opts){
        if (v){
            return _(v);
        }else return v;
    });
    i18n.init = function(opts, cb){
        opts.preload = ['en'];
        opts.postProcess = "gettext";
        oldInit(opts, cb);
    };

    $("[data-modelview]").each(function(){
        let props = $(this).data();
        delete(props.modelview);
        window.ReactDOM.render(<ModelView {...props}/>, $(this).get(0));
    });
});

export default ModelView;
