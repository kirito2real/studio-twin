# Studio Twin · 工作室数字孪生

基于四张房间照片、两段漫游视频和用户逐项修正建立的可编辑三维工作室。交互形式参考 [kitchen-twin](https://frank-zy-dou.github.io/kitchen-twin/)。

## 浏览与下载

[在线浏览工作室](https://kirito2real.github.io/studio-twin/)

- 网页：旋转、室内漫游、俯视、建筑剖切、图层控制、物体选择、四角照片对照。
- 资产：16 个分别配置的桌面，两排各四块隔板；修正机器狗位置、包装箱、门洞、休息区和展墙后凹入通道。
- [网页 GLB](assets/studio.glb)
- [Blender / Isaac Sim 完整模型包](downloads/studio_blender_isaac.zip)，包含 `.blend`、`.usdc`、纹理、渲染图和验证记录。
- [Isaac Sim 验证报告](assets/physics.json)：240 Hz、6 秒，10/10 指定支撑测试通过。
- [空间配准依据](assets/spatial_registration.json)：旧 COLMAP SfM/MVS 点云与相机轨迹的局部配准，并非训练后的 3D 高斯。

## 本地运行

在本目录运行 `python -m http.server 8766 --bind 127.0.0.1`，浏览器打开 `http://127.0.0.1:8766/`。不需要安装前端依赖；Three.js 和素材均在仓库中。

## GitHub Pages

仓库 Settings → Pages → Deploy from a branch → `main` / `/ (root)`。`.nojekyll` 保留静态文件原样发布；所有网页资源采用相对路径，支持项目子路径。

## 已知边界

主空间暂估 8.2 × 6.4 × 2.7 m，另有凹入通道；门洞暂估宽 1.65 m。缺少实测标尺，不属于测量级扫描。遮挡面、小物体、材质和局部位置含近似。

机器狗为静态几何资产，未验证行走、导航或抓取。网站漫游不提供实时碰撞。此前已做桌面端和手机端交互检查；最新两个细节视角因浏览器控制不可用，未做点击复测，已核对导出坐标和相机数据。

GitHub Pages 为公开网页，模型、参考照片及下载文件均可由访客获取。原 Sites 私有版本独立保留。

第三方库许可证见 [vendor/LICENSE](vendor/LICENSE)。参考照片、场景模型和图形内容不自动适用该许可证。
