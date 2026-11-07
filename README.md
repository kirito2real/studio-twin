# Studio Twin

An editable 3D studio reconstructed from room photographs, two walkthrough videos, and iterative layout corrections. The interactive viewer takes inspiration from [kitchen-twin](https://frank-zy-dou.github.io/kitchen-twin/).

## Explore and download

**[Open the interactive 3D viewer](https://kirito2real.github.io/studio-twin/)**

- Orbit, walkthrough, and top-down views; architectural cutaways; layer controls; object selection and focusing.
- Sixteen individually furnished desk positions, with four divider panels in each of two rows.
- Detailed views of workstations, the lounge, the robot, the widened doorway, and the recessed passage behind the exhibition wall.
- [Web model (GLB)](assets/studio.glb)
- [Blender / Isaac Sim package](downloads/studio_blender_isaac.zip): `.blend`, `.usdc`, textures, model renders, and validation records.
- [Isaac Sim report](assets/physics.json): **10/10 designated support tests passed**, simulated at 240 Hz for 6 seconds.
- [Spatial registration record](assets/spatial_registration.json): local alignment against previously reconstructed COLMAP SfM/MVS points and camera poses, rather than a trained Gaussian splat model.

## Scope and limitations

The main room is approximately 8.2 × 6.4 × 2.7 m, with an additional recessed passage. The widened opening is estimated at 1.65 m. Dimensions, occluded surfaces, small objects, materials, and some positions remain approximate; this is not a survey-grade reconstruction.

The quadruped is static geometry. Robot locomotion, navigation, grasping, and articulated furniture have not been validated. Browser walkthrough mode does not provide collision detection. The physics report covers only the specified static support tests.

Standalone reference photographs and the photo-comparison interface are omitted from the current public site. The public download package also omits the source-photo comparison sheet. Photo-derived textures remain part of the 3D assets. Earlier Git commits may still contain previously published photographs; this update does not erase repository history.

The GitHub Pages site and model downloads are public. The separate private Sites deployment is retained independently.

## Third-party notices

The Three.js license is included in [vendor/LICENSE](vendor/LICENSE). It does not automatically license the scene models, source imagery, or other visual content.
