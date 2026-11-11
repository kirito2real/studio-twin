import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {poseJoint} from '../joints.js';

const root=new URL('../',import.meta.url);
const buffer=fs.readFileSync(new URL('assets/studio.glb',root));
assert.equal(buffer.readUInt32LE(0),0x46546c67);
const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
const nodes=gltf.nodes.map(n=>{const o=new THREE.Object3D();o.name=n.name||'';if(n.matrix)new THREE.Matrix4().fromArray(n.matrix).decompose(o.position,o.quaternion,o.scale);else{if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);}return o;});
gltf.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>nodes[i].add(nodes[c])));
const scene=new THREE.Group();gltf.scenes[gltf.scene||0].nodes.forEach(i=>scene.add(nodes[i]));
const joints=JSON.parse(fs.readFileSync(new URL('assets/joints.json',root))).joints;
const samples=JSON.parse(fs.readFileSync(new URL('tests/rig_samples.json',root)));
assert.equal(joints.length,31);assert.equal(joints.filter(j=>j.group==='robot').length,12);
let largestError=0;
for(const j of joints){
 const o=scene.getObjectByName(j.id);assert(o,j.id);
 const rest={position:o.position.clone(),quaternion:o.quaternion.clone()};
 poseJoint(o,rest,j,j.demo);scene.updateMatrixWorld(true);
 const world=o.localToWorld(new THREE.Vector3(.07,.10,-.03));
 const expected=new THREE.Vector3().fromArray(samples.find(s=>s.id===j.id).position);
 const error=world.distanceTo(expected);largestError=Math.max(largestError,error);
 assert(error<.00002,`${j.id}: Blender/web pose mismatch ${error} m`);
 assert.equal(poseJoint(o,rest,j,j.upper+100),j.upper);
 assert.throws(()=>poseJoint(o,rest,j,NaN));
 poseJoint(o,rest,j,0);
}
console.log(`PASS: ${joints.length} joint poses match Blender; max error ${largestError} m; limits and invalid input checked.`);
