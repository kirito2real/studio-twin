import * as THREE from './vendor/three.module.js';

const axes={X:new THREE.Vector3(1,0,0),Y:new THREE.Vector3(0,0,-1),Z:new THREE.Vector3(0,1,0)};
export function poseJoint(object,rest,joint,value){
 if(!Number.isFinite(value))throw new Error('Joint position must be finite');
 value=THREE.MathUtils.clamp(value,joint.lower,joint.upper);
 object.position.copy(rest.position);object.quaternion.copy(rest.quaternion);
 if(joint.type==='prismatic')object.position.addScaledVector(axes[joint.axis],value);
 else object.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axes[joint.axis],THREE.MathUtils.degToRad(value)));
 return value;
}

export async function jointControls(model,onFocus,onChange){
 const response=await fetch('assets/joints.json');if(!response.ok)throw new Error('Joint definitions unavailable');
 const {joints}=await response.json();
 const states=joints.map(j=>{const object=model.getObjectByName(j.id);if(!object)throw new Error(`Missing joint: ${j.id}`);object.userData.motion_label=j.label;return {j,object,rest:{position:object.position.clone(),quaternion:object.quaternion.clone()}};});
 const $=id=>document.getElementById(id),select=$('joint-select'),slider=$('joint-position'),output=$('joint-value'),play=$('joint-play');
 let active=states[0],playing=false,time=0;
 for(const state of states){const option=document.createElement('option');option.value=state.j.id;option.textContent=state.j.label;select.append(option);}
 function describe(){const j=active.j;slider.min=j.lower;slider.max=j.upper;slider.step=j.type==='prismatic'?.005:'any';slider.value=0;output.value=`0 ${j.unit}`;$('joint-info').textContent=`${j.type==='prismatic'?'滑动':'旋转'} · ${j.lower.toFixed(j.type==='prismatic'?3:1)}～${j.upper.toFixed(j.type==='prismatic'?3:1)} ${j.unit} · ${j.mass_kg.toFixed(2)} kg`;}
 function stop(){playing=false;play.textContent='播放动作';play.setAttribute('aria-pressed','false');}
 function reset(){stop();states.forEach(s=>poseJoint(s.object,s.rest,s.j,0));slider.value=0;output.value=`0 ${active.j.unit}`;onChange();}
 select.onchange=()=>{reset();active=states.find(s=>s.j.id===select.value);describe();onFocus(active.object);};
 slider.oninput=()=>{stop();const value=poseJoint(active.object,active.rest,active.j,Number(slider.value));output.value=`${value.toFixed(active.j.type==='prismatic'?3:0)} ${active.j.unit}`;onChange();};
 $('joint-reset').onclick=reset;
 play.onclick=()=>{if(playing){stop();return;}playing=true;time=0;play.textContent='暂停动作';play.setAttribute('aria-pressed','true');};
 $('joint-focus').onclick=()=>onFocus(active.object);
 describe();$('joint-count').textContent=String(joints.length);
 return dt=>{if(!playing)return;time+=dt;const factor=(1-Math.cos(time*Math.PI/2))/2;states.forEach(s=>poseJoint(s.object,s.rest,s.j,s.j.demo*factor));const value=active.j.demo*factor;slider.value=value;output.value=`${value.toFixed(active.j.type==='prismatic'?3:0)} ${active.j.unit}`;onChange();};
}
