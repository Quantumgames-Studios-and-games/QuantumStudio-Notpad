namespace phasereditor2d.scene.ui.editor.usercomponent {

    import controls = colibri.ui.controls;

    export class UserComponentsEditorPropertySectionProvider extends controls.properties.PropertySectionProvider {

        private _editor: UserComponentsEditor;

        constructor(editor: UserComponentsEditor) {
            super();

            this._editor = editor;
        }

        addSections(page: controls.properties.PropertyPage, sections: Array<controls.properties.PropertySection<any>>): void {

            sections.push(new UserComponentsCompilerSection(page));
            sections.push(new UserComponentSection(page));
            sections.push(new UserComponentPropertiesSection(page));
        }

        getEmptySelectionObject() {

            return this._editor.getModel();
        }
    }
}