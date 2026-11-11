import * as THREE from 'three';
import {OrbitControls} from './vendor/controls/OrbitControls.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {jointControls} from './joints.js';

const $=id=>document.getElementById(id);
const viewport=$('viewport');
let renderer,model,meta,selected,outline,mode='orbit';
const meshes=[],assets=new Map(),keys=new Set();
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,1,.03,120);
const clipping=new THREE.Plane(new THREE.Vector3(0,-1,0),2.2);
const names={workstation:'工位',desk_contents:'桌面物品',desk_divider:'桌面隔板',coat_rack:'衣帽架',side_table:'边桌',water_dispenser:'饮水机',water_rack:'水桶架',water_storage_rack:'水桶架',loveseat:'小沙发',door:'玻璃门',quadruped_static_geometry:'研究机器人',quadruped:'研究机器人',quadruped_articulated_12dof:'宇树机器狗（Go1 暂定）',visitor_chair:'会客椅'};
let controls,motionTick=()=>{};
function fail(error){console.error(error);$('load-detail').textContent='三维加载失败，请刷新重试。下方 GLB 可下载至 Blender 查看。';$('loading').querySelector('strong').textContent='暂时无法打开三维视图';$('loading').querySelector('.loader').hidden=true;$('fallback').style.opacity='1';}
function resize(){if(!renderer)return;const {width,height}=viewport.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
function activeMode(value){mode=value;viewport.dataset.mode=value;document.querySelectorAll('button[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===value));controls.enablePan=value!=='walk';controls.minDistance=value==='walk'?.15:.3;controls.maxPolarAngle=value==='top'?Math.PI/2:Math.PI*.94;$('hint').textContent=value==='walk'?'拖动调整朝向 · W A S D 移动 · 仅视角漫游，无碰撞':'拖动旋转 · 滚轮缩放 · 点击选择物体';}
function setCamera(position,target,fov=42){camera.position.fromArray(position);controls.target.fromArray(target);camera.fov=fov;camera.updateProjectionMatrix();controls.update();}
function cut(value){$('cut').value=value;clipping.constant=Number(value);$('cut-value').textContent=value>=3.5?'完整高度':Number(value).toFixed(2)+' m';}
function overview(){activeMode('orbit');cut(.7);setCamera([9,9,11].map(v=>v*Math.max(1,1.25/camera.aspect)),[-.4,.5,-.3],42);document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));}
function view(name){const v=meta.cameras[name];activeMode('walk');cut(3.5);setCamera(v.position,v.target,v.fov);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));}
function assetOf(object){let target=object;while(target&&target!==model){if(assets.has(target.name))return target;target=target.parent;}return object;}
function label(object){if(object.userData.motion_label)return object.userData.motion_label;if(object.userData.bay_id)return `${object.userData.bay_id} · ${object.userData.semantic_type==='workstation'?'工位':'桌面物品'}`;const kind=names[object.userData.semantic_type]||object.userData.semantic_type||'场景构件';const station=object.name.match(/Workstation_(\d+)/);const desk=object.name.match(/Desk_(\d+)/);return station?`工位 ${String(Number(station[1])+1).padStart(2,'0')}`:desk?`桌面 ${String(Number(desk[1])+1).padStart(2,'0')} · 物品组`:object.name.startsWith('Divider_')?`第 ${Number(object.name.split('_')[1])+1} 排 · 隔板 ${Number(object.name.split('_')[2])+1}`:kind;}
function select(object){selected=object;if(outline){scene.remove(outline);outline.geometry.dispose();outline.material.dispose();outline=null;}if(!object)return;outline=new THREE.BoxHelper(object,0xb45430);outline.material.depthTest=false;outline.renderOrder=5;scene.add(outline);$('selected-name').textContent=label(object);$('selected-info').textContent=object.userData.source_evidence||meta.assets.find(a=>a.id===object.name)?.source||'依据照片和视频估算；形状、尺寸和位置仍需实测确认。';$('focus').disabled=false;$('asset-select').value=assets.has(object.name)?object.name:'';}
function focus(){if(!selected)return;const box=new THREE.Box3().setFromObject(selected),c=box.getCenter(new THREE.Vector3()),s=box.getSize(new THREE.Vector3()).length();activeMode('orbit');cut(3.5);setCamera(c.clone().add(new THREE.Vector3(1,.8,1).normalize().multiplyScalar(Math.max(s*1.5,1.1))).toArray(),c.toArray(),45);}
function layers(){meshes.forEach(o=>{const layer=o.userData.layer||'assets';o.visible=$(layer)?.checked??true;});if(outline)outline.visible=false;}
function colors(enabled){const palette=new Map();let index=0;meshes.forEach(o=>{if(enabled){if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;const root=assetOf(o);if(!palette.has(root.name))palette.set(root.name,new THREE.Color().setHSL((index++*.618)%1,.37,.54));o.userData.colorMaterial??=new THREE.MeshStandardMaterial({roughness:.8});o.userData.colorMaterial.clippingPlanes=o.userData.layer==='room'?[clipping]:[];o.userData.colorMaterial.color.copy(palette.get(root.name));o.material=o.userData.colorMaterial;}else if(o.userData.originalMaterial)o.material=o.userData.originalMaterial;});}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0xe3e5db,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;viewport.append(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.12;controls.maxDistance=30;
 scene.add(new THREE.HemisphereLight(0xfff7e9,0x5b6358,2.2));const sun=new THREE.DirectionalLight(0xfff5df,2.5);sun.position.set(-4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});sun.shadow.bias=-.0003;sun.shadow.normalBias=.015;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;scene.add(sun);
 const pmrem=new THREE.PMREMGenerator(renderer),environment=new RoomEnvironment();scene.environment=pmrem.fromScene(environment,.04).texture;scene.environmentIntensity=.35;environment.dispose();pmrem.dispose();
 new ResizeObserver(resize).observe(viewport);resize();overview();
 const response=await fetch('assets/scene.json');if(!response.ok)throw Error('Scene metadata unavailable');meta=await response.json();
 const gltf=await new GLTFLoader().loadAsync('assets/studio.glb',progress=>{$('load-detail').textContent=progress.total?`加载三维模型 · ${Math.round(progress.loaded/progress.total*100)}%`:`已接收 ${(progress.loaded/1e6).toFixed(1)} MB`;});
 model=gltf.scene;scene.add(model);model.updateMatrixWorld(true);
 model.traverse(o=>{if(o.isMesh){meshes.push(o);const room=o.userData.layer==='room';o.material=o.material.clone();o.material.clippingPlanes=room?[clipping]:[];o.receiveShadow=true;o.castShadow=!room&&o.userData.layer!=='ceiling'&&!o.material.transparent;if(o.material?.isMeshPhysicalMaterial)o.material.envMapIntensity=.5;}if(meta.assets.some(a=>a.id===o.name))assets.set(o.name,o);});
 for(const object of assets.values()){const option=document.createElement('option');option.value=object.name;option.textContent=label(object);$('asset-select').append(option);}
 motionTick=await jointControls(model,object=>{select(object);focus();},()=>{sun.shadow.needsUpdate=true;if(outline)outline.update();});
 layers();sun.shadow.needsUpdate=true;$('fallback').hidden=true;$('loading').hidden=true;$('render-status').textContent=`${meshes.length.toLocaleString()} 网格 · 估算尺度`;viewport.dataset.ready='true';
 let down;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=viewport.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(meshes,false).find(h=>h.object.visible&&(h.object.userData.layer!=='room'||clipping.distanceToPoint(h.point)>=0));if(hit)select(assetOf(hit.object));});
 $('asset-select').onchange=e=>{const object=assets.get(e.target.value);if(object)select(object);};$('focus').onclick=focus;
 document.querySelectorAll('button[data-mode]').forEach(b=>b.onclick=()=>{if(b.dataset.mode==='orbit')overview();else if(b.dataset.mode==='walk')view('Interior');else{activeMode('top');cut(1.3);setCamera([.3,12,.001],[.3,0,0],42);}});
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
 document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>view(b.dataset.detail));
 $('reset').onclick=overview;
 ['room','assets','ceiling'].forEach(id=>$(id).onchange=()=>{if(id==='ceiling'&&$('ceiling').checked)cut(3.5);layers();});$('colors').onchange=e=>colors(e.target.checked);
 $('cut').oninput=e=>cut(Number(e.target.value));$('exposure').oninput=e=>{renderer.toneMappingExposure=Number(e.target.value);$('exposure-value').textContent=Number(e.target.value).toFixed(2);};
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.explorer').requestFullscreen();}catch{$('hint').textContent='当前浏览器不支持全屏，请使用浏览器全屏快捷键。'}};
 viewport.addEventListener('keydown',e=>{if(mode==='walk'&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){keys.add(e.key.toLowerCase());e.preventDefault();}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());viewport.addEventListener('blur',()=>keys.clear());
 let previous=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-previous)/1000,.05);previous=now;motionTick(dt);if(mode==='walk'&&keys.size){const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0));const movement=new THREE.Vector3();if(keys.has('w')||keys.has('arrowup'))movement.add(forward);if(keys.has('s')||keys.has('arrowdown'))movement.sub(forward);if(keys.has('d')||keys.has('arrowright'))movement.add(right);if(keys.has('a')||keys.has('arrowleft'))movement.sub(right);movement.normalize().multiplyScalar(dt*1.4);camera.position.add(movement);controls.target.add(movement);}controls.update();renderer.render(scene,camera);});
}catch(error){fail(error);}
