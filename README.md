# Studio Twin

An editable 3D studio reconstructed from room photographs, two walkthrough videos, and iterative layout corrections. The interactive viewer takes inspiration from [kitchen-twin](https://frank-zy-dou.github.io/kitchen-twin/).

## Explore and download

**[Open the interactive 3D viewer](https://kirito2real.github.io/studio-twin/)**

- Orbit, walkthrough, and top-down views; architectural cutaways; layer controls; object selection and focusing.
- Sixteen individually furnished desk positions, with four divider panels in each of two rows.
- Detailed views of workstations, the lounge, the robot, the widened doorway, and the recessed passage behind the exhibition wall.
- [Web model (GLB)](assets/studio.glb)
- [Articulated Blender / Isaac Sim package](downloads/studio_articulated.zip): `.blend`, `.usdc`, textures, joint definitions, and validation records.
- 31 controllable joints: two doors, 15 chair swivels, two inferred drawers, and 12 Unitree Go1 leg joints. Use the joint panel to select, move, play, and reset them.
- [Joint properties](assets/joints.json) and [motion test results](assets/motion_report.json): **31/31** passed the 9-second rest/actuate/return check in Isaac Sim 4.1, using CPU PhysX at 240 Hz. The report identifies the tested USD by SHA-256.
- [Preserved static package](downloads/studio_blender_isaac.zip).
- [Original static-scene support report](assets/physics.json): 10/10 designated support tests passed for the earlier static USD, not the new articulated export.
- [Spatial registration record](assets/spatial_registration.json): local alignment against previously reconstructed COLMAP SfM/MVS points and camera poses, rather than a trained Gaussian splat model.

## Scope and limitations

The main room is approximately 8.2 × 6.4 × 2.7 m, with an additional recessed passage. The widened opening is estimated at 1.65 m. Dimensions, occluded surfaces, small objects, materials, and some positions remain approximate; this is not a survey-grade reconstruction.

The user confirmed the Unitree brand; **Go1 is assumed from appearance and the exact model remains unconfirmed**. Robot mesh, joint axes, limits, masses and inertias are based on [Unitree's official Go1 URDF](https://github.com/unitreerobotics/unitree_ros/tree/master/robots/go1_description). Sensor payload geometry is estimated and its inertia is not calibrated. The robot base is fixed for joint tests; no walking, balance, navigation, or grasp controller is supplied.

Browser and Blender motion are kinematic previews. USD drives are tested in Isaac Sim at the targets recorded in the motion report; full travel and contact combinations are not exhaustively validated. Browser walkthrough has no collision detection. Furniture parameters and drawer interiors are estimated. Chair armrests and door clearances were adjusted to remove intersections in the static scene. Decorative details and thin cables have no colliders. Door collision meshes use a CPU fallback; GPU particle/deformable contacts have not been validated. Angular targets are offsets in degrees from the stored rest pose; robot entries also retain the original URDF zero and limits.

Standalone reference photographs and the photo-comparison interface are omitted from the current public site. The public download package also omits the source-photo comparison sheet. Photo-derived textures remain part of the 3D assets. Earlier Git commits may still contain previously published photographs; this update does not erase repository history.

The GitHub Pages site and model downloads are public. The separate private Sites deployment is retained independently.

## Third-party notices

The Unitree Go1 assets use the [BSD 3-Clause license](vendor/UNITREE_LICENSE.txt). The Three.js license is included in [vendor/LICENSE](vendor/LICENSE). It does not automatically license the scene models, source imagery, or other visual content.
