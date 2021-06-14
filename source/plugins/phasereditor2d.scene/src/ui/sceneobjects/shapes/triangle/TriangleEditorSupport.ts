/// <reference path="../ShapeEditorSupport.ts"/>

namespace phasereditor2d.scene.ui.sceneobjects {

    export class TriangleEditorSupport extends ShapeEditorSupport<Triangle> {

        constructor(scene: Scene, obj: Triangle) {
            super(TriangleExtension.getInstance(), obj, scene);

            this.addComponent(new TriangleComponent(obj));
        }
    }
}