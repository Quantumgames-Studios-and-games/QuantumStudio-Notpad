var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var controls = colibri.ui.controls;
        ide.ICON_PLAY = "play";
        class IDEPlugin extends colibri.Plugin {
            constructor() {
                super("phasereditor2d.ide");
                this.eventActivationChanged = new controls.ListenerList();
                this._openingProject = false;
                this._licenseActivated = false;
            }
            static getInstance() {
                return this._instance;
            }
            registerExtensions(reg) {
                // windows
                reg.addExtension(new colibri.ui.ide.WindowExtension(() => new ide.ui.DesignWindow()));
                reg.addExtension(new colibri.ui.ide.WindowExtension(() => new ide.ui.WelcomeWindow()));
                // icons
                reg.addExtension(colibri.ui.ide.IconLoaderExtension.withPluginFiles(this, [
                    ide.ICON_PLAY
                ]));
                // keys
                reg.addExtension(new colibri.ui.ide.commands.CommandExtension(ide.ui.actions.IDEActions.registerCommands));
                // themes
                reg.addExtension(new colibri.ui.ide.themes.ThemeExtension({
                    dark: false,
                    id: "lightBlue",
                    classList: ["lightBlue"],
                    displayName: "Light Blue",
                    viewerForeground: controls.Controls.LIGHT_THEME.viewerForeground,
                    viewerSelectionForeground: controls.Controls.LIGHT_THEME.viewerSelectionForeground,
                    viewerSelectionBackground: controls.Controls.LIGHT_THEME.viewerSelectionBackground,
                }));
                reg.addExtension(new colibri.ui.ide.themes.ThemeExtension({
                    dark: false,
                    id: "lightGray",
                    classList: ["light", "lightGray"],
                    displayName: "Light Gray",
                    viewerForeground: controls.Controls.LIGHT_THEME.viewerForeground,
                    viewerSelectionForeground: controls.Controls.LIGHT_THEME.viewerSelectionForeground,
                    viewerSelectionBackground: controls.Controls.LIGHT_THEME.viewerSelectionBackground,
                }));
                // new dialogs
                reg.addExtension(new ide.ui.dialogs.NewProjectDialogExtension());
                // files view menu
                if (IDEPlugin.getInstance().isDesktopMode()) {
                    reg.addExtension(new controls.MenuExtension(phasereditor2d.files.ui.views.FilesView.MENU_ID, {
                        command: ide.ui.actions.CMD_LOCATE_FILE
                    }));
                }
            }
            async compileProject() {
                const exts = colibri.Platform.getExtensions(ide.core.CompileProjectExtension.POINT_ID);
                const dlg = new controls.dialogs.ProgressDialog();
                dlg.create();
                dlg.setTitle("Compiling Project");
                const monitor = new controls.dialogs.ProgressDialogMonitor(dlg);
                for (const ext of exts) {
                    monitor.addTotal(ext.getTotal());
                }
                for (const ext of exts) {
                    await ext.preload(monitor);
                }
                dlg.close();
            }
            async requestServerMode() {
                const data = await colibri.core.io.apiRequest("GetServerMode");
                this._desktopMode = data.desktop === true;
                this._advancedJSEditor = data.advancedJSEditor === true;
                this._licenseActivated = data.unlocked === true;
                this._externalEditorName = data.externalEditorName || "Alien";
            }
            getExternalEditorName() {
                return this._externalEditorName;
            }
            async requestUpdateAvailable() {
                if (this.isDesktopMode()) {
                    if (await this.isNewUpdateAvailable()) {
                        colibri.Platform.getWorkbench().showNotification("A new version is available!");
                    }
                }
            }
            async isNewUpdateAvailable() {
                const data = await colibri.core.io.apiRequest("GetNewVersionAvailable");
                return data.available;
            }
            isLicenseActivated() {
                return this._licenseActivated;
            }
            isDesktopMode() {
                return this._desktopMode;
            }
            isAdvancedJSEditor() {
                return this._advancedJSEditor;
            }
            createHelpMenuItem(menu, helpPath) {
                menu.addAction({
                    text: "Help",
                    callback: () => {
                        controls.Controls.openUrlInNewPage("https://help.phasereditor2d.com/v3/" + helpPath);
                    }
                });
            }
            async openFirstWindow() {
                const wb = colibri.Platform.getWorkbench();
                wb.eventProjectOpened.addListener(() => {
                    wb.getGlobalPreferences().setValue("defaultProjectData", {
                        projectName: wb.getFileStorage().getRoot().getName()
                    });
                });
                const prefs = wb.getGlobalPreferences();
                const defaultProjectData = prefs.getValue("defaultProjectData");
                let win = null;
                if (defaultProjectData) {
                    const projectName = defaultProjectData["projectName"];
                    const { projects } = await wb.getFileStorage().getProjects();
                    if (projects.indexOf(projectName) >= 0) {
                        await this.ideOpenProject(projectName);
                        return;
                    }
                }
                win = wb.activateWindow(ide.ui.WelcomeWindow.ID);
                if (win) {
                    win.restoreState(wb.getProjectPreferences());
                }
            }
            async ideOpenProject(projectName, workspacePath) {
                this._openingProject = true;
                controls.dialogs.Dialog.closeAllDialogs();
                const dlg = new ide.ui.dialogs.OpeningProjectDialog();
                dlg.create();
                dlg.setTitle("Opening " + projectName);
                dlg.setProgress(0);
                const monitor = new controls.dialogs.ProgressDialogMonitor(dlg);
                try {
                    const wb = colibri.Platform.getWorkbench();
                    {
                        const win = wb.getActiveWindow();
                        if (win instanceof ide.ui.DesignWindow) {
                            win.saveState(wb.getProjectPreferences());
                        }
                    }
                    console.log(`IDEPlugin: opening project ${projectName}`);
                    colibri.Platform.onElectron(async () => {
                        let ws = workspacePath;
                        if (!ws) {
                            const result = await colibri.Platform.getWorkbench().getFileStorage().getProjects();
                            ws = result.workspacePath;
                        }
                        document.title = `Phaser Editor 2D v${ide.VER} ${this.isLicenseActivated() ? "Premium" : "Free"} (${ws})`;
                    }, () => {
                        document.title = `Phaser Editor 2D v${ide.VER} ${this.isLicenseActivated() ? "Premium" : "Free"}`;
                    });
                    const designWindow = wb.activateWindow(ide.ui.DesignWindow.ID);
                    const editorArea = designWindow.getEditorArea();
                    editorArea.closeAllEditors();
                    await wb.openProject(projectName, workspacePath, monitor);
                    dlg.setProgress(1);
                    if (designWindow) {
                        designWindow.restoreState(wb.getProjectPreferences());
                    }
                }
                finally {
                    this._openingProject = false;
                    dlg.close();
                }
            }
            isOpeningProject() {
                return this._openingProject;
            }
            openProjectInVSCode() {
                this.openFileExternalEditor(colibri.ui.ide.FileUtils.getRoot());
            }
            async openFileExternalEditor(file) {
                const resp = await colibri.core.io.apiRequest("OpenVSCode", { location: file.getFullName() });
                if (resp.error) {
                    alert(resp.error);
                }
            }
        }
        IDEPlugin._instance = new IDEPlugin();
        ide.IDEPlugin = IDEPlugin;
        colibri.Platform.addPlugin(IDEPlugin.getInstance());
        /* program entry point */
        ide.VER = "3.14.0";
        async function main() {
            colibri.CACHE_VERSION = ide.VER;
            console.log(`%c %c Phaser Editor 2D %c v${ide.VER} %c %c https://phasereditor2d.com `, "background-color:red", "background-color:#3f3f3f;color:whitesmoke", "background-color:orange;color:black", "background-color:red", "background-color:silver");
            colibri.ui.controls.dialogs.AlertDialog.replaceConsoleAlert();
            await IDEPlugin.getInstance().requestServerMode();
            await colibri.Platform.start();
            await IDEPlugin.getInstance().openFirstWindow();
            await IDEPlugin.getInstance().requestUpdateAvailable();
        }
        window.addEventListener("load", main);
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var core;
        (function (core) {
            class CompileProjectExtension extends colibri.Extension {
                constructor() {
                    super(CompileProjectExtension.POINT_ID);
                }
            }
            CompileProjectExtension.POINT_ID = "phasereditor2d.ide.core.CompilerExtension";
            core.CompileProjectExtension = CompileProjectExtension;
        })(core = ide.core || (ide.core = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var core;
        (function (core) {
            class MultiHashBuilder {
                constructor() {
                    this._tokens = new Set();
                }
                addPartialToken(token) {
                    if (token && token !== "") {
                        this._tokens.add(token);
                    }
                }
                addPartialFileToken(file) {
                    if (file) {
                        this.addPartialToken("file(" + file.getFullName() + "," + file.getModTime() + ")");
                    }
                }
                build() {
                    const list = [];
                    for (const token of this._tokens) {
                        list.push(token);
                    }
                    return list.sort().join("+");
                }
            }
            core.MultiHashBuilder = MultiHashBuilder;
        })(core = ide.core || (ide.core = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var core;
        (function (core) {
            class PhaserDocs {
                constructor(plugin, filePath) {
                    this._data = null;
                    this._plugin = plugin;
                    this._filePath = filePath;
                }
                async preload() {
                    if (!this._data) {
                        this._data = await this._plugin.getJSON(this._filePath);
                        const converter = new showdown.Converter();
                        // tslint:disable-next-line:forin
                        for (const k in this._data) {
                            const help = this._data[k];
                            this._data[k] = converter.makeHtml(help);
                        }
                    }
                }
                getDoc(helpKey) {
                    if (helpKey in this._data) {
                        return `<small>${helpKey}</small> <br><br> <div style="max-width:60em">${this._data[helpKey]}</div>`;
                    }
                    return "Help not found for: " + helpKey;
                }
            }
            core.PhaserDocs = PhaserDocs;
        })(core = ide.core || (ide.core = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide_1) {
        var ui;
        (function (ui) {
            var controls = colibri.ui.controls;
            var ide = colibri.ui.ide;
            class DesignWindow extends ide.WorkbenchWindow {
                constructor() {
                    super(DesignWindow.ID);
                    ide.Workbench.getWorkbench().eventPartActivated.addListener(() => {
                        this.saveWindowState();
                    });
                    window.addEventListener("beforeunload", e => {
                        this.saveWindowState();
                    });
                }
                saveWindowState() {
                    if (ide_1.IDEPlugin.getInstance().isOpeningProject()) {
                        return;
                    }
                    this.saveState(colibri.Platform.getWorkbench().getProjectPreferences());
                }
                saveState(prefs) {
                    this.saveEditorsState(prefs);
                }
                restoreState(prefs) {
                    this.restoreEditors(prefs);
                }
                createParts() {
                    this._outlineView = new phasereditor2d.outline.ui.views.OutlineView();
                    this._filesView = new phasereditor2d.files.ui.views.FilesView();
                    this._inspectorView = new colibri.inspector.ui.views.InspectorView();
                    this._blocksView = new phasereditor2d.blocks.ui.views.BlocksView();
                    this._editorArea = new ide.EditorArea();
                    this._split_Files_Blocks = new controls.SplitPanel(this.createViewFolder(this._filesView), this.createViewFolder(this._blocksView));
                    this._split_Editor_FilesBlocks = new controls.SplitPanel(this._editorArea, this._split_Files_Blocks, false);
                    this._split_Outline_EditorFilesBlocks = new controls.SplitPanel(this.createViewFolder(this._outlineView), this._split_Editor_FilesBlocks);
                    this._split_OutlineEditorFilesBlocks_Inspector = new controls.SplitPanel(this._split_Outline_EditorFilesBlocks, this.createViewFolder(this._inspectorView));
                    this.getClientArea().add(this._split_OutlineEditorFilesBlocks_Inspector);
                    this.initToolbar();
                    this.initialLayout();
                }
                initToolbar() {
                    const toolbar = this.getToolbar();
                    {
                        // left area
                        const area = toolbar.getLeftArea();
                        const manager = new controls.ToolbarManager(area);
                        manager.add(new phasereditor2d.files.ui.actions.OpenNewFileDialogAction());
                        // manager.add(new ui.actions.OpenProjectsDialogAction());
                        manager.addCommand(ui.actions.CMD_PLAY_PROJECT, { showText: false });
                    }
                    {
                        // right area
                        const area = toolbar.getRightArea();
                        const manager = new controls.ToolbarManager(area);
                        manager.add(new ui.actions.OpenMainMenuAction());
                    }
                }
                getEditorArea() {
                    return this._editorArea;
                }
                initialLayout() {
                    this._split_Files_Blocks.setSplitFactor(0.2);
                    this._split_Editor_FilesBlocks.setSplitFactor(0.6);
                    this._split_Outline_EditorFilesBlocks.setSplitFactor(0.15);
                    this._split_OutlineEditorFilesBlocks_Inspector.setSplitFactor(0.8);
                    this.layout();
                }
            }
            DesignWindow.ID = "phasereditor2d.ide.ui.DesignWindow";
            DesignWindow.MENU_MAIN = "phasereditor2d.ide.ui.MainMenu";
            ui.DesignWindow = DesignWindow;
        })(ui = ide_1.ui || (ide_1.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            class WelcomeWindow extends colibri.ui.ide.WorkbenchWindow {
                constructor() {
                    super(WelcomeWindow.ID);
                }
                getEditorArea() {
                    return new colibri.ui.ide.EditorArea();
                }
                async createParts() {
                    const { projects } = await colibri.ui.ide.FileUtils.getProjects_async();
                    if (projects.length === 0) {
                        const dlg = new ui.dialogs.NewProjectDialog();
                        dlg.setCancellable(false);
                        dlg.setCloseWithEscapeKey(false);
                        dlg.create();
                    }
                    else {
                        const dlg = new ui.dialogs.ProjectsDialog();
                        dlg.setCloseWithEscapeKey(false);
                        dlg.create();
                    }
                }
            }
            WelcomeWindow.ID = "phasereditor2d.welcome.ui.WelcomeWindow";
            ui.WelcomeWindow = WelcomeWindow;
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var actions;
            (function (actions) {
                actions.CAT_PROJECT = "phasereditor2d.ide.ui.actions.ProjectCategory";
                actions.CMD_LOCATE_FILE = "phasereditor2d.ide.ui.actions.LocateFile";
                actions.CMD_OPEN_PROJECTS_DIALOG = "phasereditor2d.ide.ui.actions.OpenProjectsDialog";
                actions.CMD_RELOAD_PROJECT = "phasereditor2d.ide.ui.actions.ReloadProjectAction";
                actions.CMD_COMPILE_PROJECT = "phasereditor2d.ide.ui.actions.CompileProject";
                actions.CMD_PLAY_PROJECT = "phasereditor2d.ide.ui.actions.PlayProject";
                actions.CMD_QUICK_PLAY_PROJECT = "phasereditor2d.ide.ui.actions.QuickPlayProject";
                actions.CMD_OPEN_VSCODE = "phasereditor2d.ide.ui.actions.OpenVSCode";
                var controls = colibri.ui.controls;
                var commands = colibri.ui.ide.commands;
                function isNotWelcomeWindowScope(args) {
                    return !(args.activeWindow instanceof ui.WelcomeWindow);
                }
                actions.isNotWelcomeWindowScope = isNotWelcomeWindowScope;
                class IDEActions {
                    static registerCommands(manager) {
                        manager.addCategory({
                            id: actions.CAT_PROJECT,
                            name: "Project"
                        });
                        // open project
                        manager.addCommandHelper({
                            id: actions.CMD_OPEN_PROJECTS_DIALOG,
                            name: "Open Project",
                            tooltip: "Open other project or create a new one.",
                            category: actions.CAT_PROJECT
                        });
                        manager.addHandlerHelper(actions.CMD_OPEN_PROJECTS_DIALOG, args => isNotWelcomeWindowScope(args) && !args.activeDialog, actions.OpenProjectHandler);
                        manager.addKeyBinding(actions.CMD_OPEN_PROJECTS_DIALOG, new commands.KeyMatcher({
                            control: true,
                            alt: true,
                            key: "P",
                            filterInputElements: false
                        }));
                        // play game
                        manager.add({
                            command: {
                                id: actions.CMD_PLAY_PROJECT,
                                name: "Play Project",
                                tooltip: "Run this project in other tab",
                                icon: ide.IDEPlugin.getInstance().getIcon(ide.ICON_PLAY),
                                category: actions.CAT_PROJECT
                            },
                            handler: {
                                testFunc: isNotWelcomeWindowScope,
                                executeFunc: args => {
                                    const url = colibri.ui.ide.FileUtils.getRoot().getExternalUrl();
                                    controls.Controls.openUrlInNewPage(url);
                                }
                            },
                            keys: {
                                key: "F12"
                            }
                        });
                        manager.add({
                            command: {
                                id: actions.CMD_QUICK_PLAY_PROJECT,
                                name: "Quick Play Project",
                                tooltip: "Run this project in a dialog.",
                                icon: ide.IDEPlugin.getInstance().getIcon(ide.ICON_PLAY),
                                category: actions.CAT_PROJECT
                            },
                            handler: {
                                testFunc: isNotWelcomeWindowScope,
                                executeFunc: args => {
                                    const url = colibri.ui.ide.FileUtils.getRoot().getExternalUrl();
                                    const dlg = new ui.dialogs.PlayDialog(url);
                                    dlg.create();
                                }
                            },
                            keys: {
                                key: "F10"
                            }
                        });
                        // reload project
                        manager.add({
                            command: {
                                id: actions.CMD_RELOAD_PROJECT,
                                name: "Reload Project",
                                tooltip: "Reload the project files.",
                                category: actions.CAT_PROJECT
                            },
                            handler: {
                                testFunc: isNotWelcomeWindowScope,
                                executeFunc: args => ide.IDEPlugin.getInstance().ideOpenProject(colibri.Platform.getWorkbench().getProjectRoot().getName())
                            },
                            keys: {
                                control: true,
                                alt: true,
                                key: "R"
                            }
                        });
                        // compile project
                        manager.add({
                            command: {
                                id: actions.CMD_COMPILE_PROJECT,
                                name: "Compile Project",
                                tooltip: "Compile all files.",
                                category: actions.CAT_PROJECT
                            },
                            handler: {
                                testFunc: isNotWelcomeWindowScope,
                                executeFunc: args => ide.IDEPlugin.getInstance().compileProject()
                            },
                            keys: {
                                control: true,
                                alt: true,
                                key: "B"
                            }
                        });
                        if (ide.IDEPlugin.getInstance().isDesktopMode()) {
                            // locate file
                            manager.add({
                                command: {
                                    id: actions.CMD_LOCATE_FILE,
                                    category: actions.CAT_PROJECT,
                                    name: "Locate File",
                                    tooltip: "Open the selected file (or project root) in the OS file manager."
                                },
                                keys: {
                                    key: "L",
                                    control: true,
                                    alt: true
                                },
                                handler: {
                                    executeFunc: async (args) => {
                                        let file = colibri.ui.ide.FileUtils.getRoot();
                                        const view = args.activePart;
                                        if (view instanceof phasereditor2d.files.ui.views.FilesView) {
                                            const sel = view.getSelection()[0];
                                            if (sel) {
                                                file = sel;
                                            }
                                        }
                                        if (!file) {
                                            return;
                                        }
                                        if (file.isFile()) {
                                            file = file.getParent();
                                        }
                                        const resp = await colibri.core.io.apiRequest("OpenFileManager", { file: file.getFullName() });
                                        if (resp.error) {
                                            alert(resp.error);
                                        }
                                    }
                                }
                            });
                            // open vscode
                            manager.add({
                                command: {
                                    id: actions.CMD_OPEN_VSCODE,
                                    category: actions.CAT_PROJECT,
                                    name: "Open " + ide.IDEPlugin.getInstance().getExternalEditorName(),
                                    tooltip: "Open the project in the configured external editor (" + ide.IDEPlugin.getInstance().getExternalEditorName() + ")."
                                },
                                keys: {
                                    control: true,
                                    alt: true,
                                    key: "U"
                                },
                                handler: {
                                    executeFunc: args => ide.IDEPlugin.getInstance().openProjectInVSCode()
                                }
                            });
                        }
                    }
                }
                actions.IDEActions = IDEActions;
            })(actions = ui.actions || (ui.actions = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var actions;
            (function (actions) {
                var controls = colibri.ui.controls;
                class OpenMainMenuAction extends controls.Action {
                    constructor() {
                        super({
                            text: "Open Menu",
                            tooltip: "Main menu",
                            showText: false,
                            icon: ide.IDEPlugin.getInstance().getIcon(colibri.ICON_MENU)
                        });
                    }
                    run(e) {
                        const menu = new controls.Menu();
                        menu.addCommand(actions.CMD_OPEN_PROJECTS_DIALOG);
                        menu.addCommand(actions.CMD_RELOAD_PROJECT);
                        menu.addCommand(actions.CMD_COMPILE_PROJECT);
                        if (ide.IDEPlugin.getInstance().isDesktopMode()) {
                            menu.addSeparator();
                            menu.addCommand(actions.CMD_OPEN_VSCODE);
                        }
                        menu.addSeparator();
                        menu.addCommand(colibri.ui.ide.actions.CMD_CHANGE_THEME);
                        menu.addCommand(colibri.ui.ide.actions.CMD_SHOW_COMMAND_PALETTE);
                        menu.addExtension(ui.DesignWindow.MENU_MAIN);
                        menu.addSeparator();
                        if (ide.IDEPlugin.getInstance().isDesktopMode()) {
                            const activated = ide.IDEPlugin.getInstance().isLicenseActivated();
                            menu.add(new controls.Action({
                                text: activated ? "Change License Key" : "Unlock Phaser Editor 2D",
                                callback: () => {
                                    new ui.dialogs.UnlockDialog().create();
                                }
                            }));
                            menu.add(new controls.Action({
                                text: "Check For Updates",
                                callback: async () => {
                                    const dlg = new controls.dialogs.AlertDialog();
                                    dlg.create();
                                    dlg.setTitle("Updates");
                                    dlg.setMessage("Checking for updates...");
                                    const available = await ide.IDEPlugin.getInstance().isNewUpdateAvailable();
                                    dlg.setMessage(available ? "A new version is available!" : "Updates not found.");
                                }
                            }));
                        }
                        menu.add(new controls.Action({
                            text: "Unofficial Phaser Help Center",
                            callback: () => controls.Controls.openUrlInNewPage("https://helpcenter.phasereditor2d.com")
                        }));
                        menu.add(new controls.Action({
                            text: "Help",
                            callback: () => controls.Controls.openUrlInNewPage("https://help.phasereditor2d.com")
                        }));
                        menu.add(new controls.Action({
                            text: "About",
                            callback: () => {
                                new ui.dialogs.AboutDialog().create();
                            }
                        }));
                        menu.createWithEvent(e);
                    }
                }
                actions.OpenMainMenuAction = OpenMainMenuAction;
            })(actions = ui.actions || (ui.actions = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var actions;
            (function (actions) {
                function OpenProjectHandler(args) {
                    const dlg = new ui.dialogs.ProjectsDialog();
                    dlg.create();
                    dlg.addCancelButton();
                }
                actions.OpenProjectHandler = OpenProjectHandler;
            })(actions = ui.actions || (ui.actions = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                class AboutDialog extends controls.dialogs.Dialog {
                    constructor() {
                        super("AboutDialog");
                    }
                    createDialogArea() {
                        const activated = ide.IDEPlugin.getInstance().isLicenseActivated();
                        const element = document.createElement("div");
                        element.classList.add("DialogClientArea", "DialogSection");
                        const html = `
            <p class="Title"><b>Phaser Editor 2D ${activated ? "Premium" : "Free"}</b><br><small>v${ide.VER}</small></p>
            <p><i>A friendly IDE for HTML5 game development</i></p>

            <p>
                <p>@PhaserEditor2D</p>
                <a href="https://phasereditor2d.com" rel="noopener" target="_blank">phasereditor2d.com</a>
                <a href="https://www.twitter.com/PhaserEditor2D" rel="noopener" target="_blank">Twitter</a>
                <a href="https://www.facebook.com/PhaserEditor2D" rel="noopener" target="_blank">Facebook</a>
                <a href="https://github.com/PhaserEditor2D/PhaserEditor" rel="noopener" target="_blank">GitHub</a>
                <a href="https://www.youtube.com/c/PhaserEditor2D" rel="noopener" target="_blank">YouTube</a> <br>
            </p>

            <p>
            </p>

            <p><small>Copyright &copy; Arian Fornaris </small></p>
            `;
                        element.innerHTML = html;
                        this.getElement().appendChild(element);
                    }
                    create() {
                        super.create();
                        this.setTitle("About");
                        this.addButton("Close", () => this.close());
                    }
                }
                dialogs.AboutDialog = AboutDialog;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                var viewers = colibri.ui.controls.viewers;
                class NewProjectDialog extends controls.dialogs.Dialog {
                    constructor(workspacePath) {
                        super("NewProjectDialog");
                        this._workspacePath = workspacePath;
                        this._projectNames = new Set();
                        this._cancellable = true;
                        this.setSize(window.innerWidth / 4, window.innerHeight / 2);
                    }
                    setCancellable(cancellable) {
                        this._cancellable = cancellable;
                    }
                    createDialogArea() {
                        const clientArea = document.createElement("div");
                        clientArea.classList.add("DialogClientArea");
                        clientArea.style.display = "grid";
                        clientArea.style.gridTemplateRows = "1fr";
                        clientArea.style.gridRowGap = "5px";
                        clientArea.appendChild(this.createCenterArea());
                        clientArea.appendChild(this.createBottomArea());
                        this.getElement().appendChild(clientArea);
                    }
                    createBottomArea() {
                        const bottomArea = document.createElement("div");
                        bottomArea.classList.add("DialogSection");
                        bottomArea.style.display = "grid";
                        bottomArea.style.gridTemplateColumns = "auto 1fr";
                        bottomArea.style.gridTemplateRows = "auto";
                        bottomArea.style.columnGap = "10px";
                        bottomArea.style.rowGap = "10px";
                        bottomArea.style.alignItems = "center";
                        {
                            const label = document.createElement("label");
                            label.innerText = "Project Name";
                            bottomArea.appendChild(label);
                            const text = document.createElement("input");
                            text.type = "text";
                            text.addEventListener("keyup", e => this.validate());
                            setTimeout(() => text.focus(), 10);
                            bottomArea.appendChild(text);
                            this._projectNameText = text;
                            this.setInitialProjectName();
                        }
                        return bottomArea;
                    }
                    setInitialProjectName() {
                        let name = "Game";
                        let i = 1;
                        while (this._projectNames.has(name.toLowerCase())) {
                            name = "Game" + i;
                            i += 1;
                        }
                        this._projectNameText.value = name;
                    }
                    validate() {
                        let disabled = false;
                        const viewer = this._filteredViewer.getViewer();
                        if (viewer.getSelection().length !== 1) {
                            disabled = true;
                        }
                        if (!disabled) {
                            const obj = viewer.getSelectionFirstElement();
                            if (obj.path === undefined) {
                                disabled = true;
                            }
                        }
                        if (!disabled) {
                            const name = this._projectNameText.value;
                            if (name.trim() === ""
                                || name.startsWith(".")
                                || name.indexOf("/") >= 0
                                || name.indexOf("\\") >= 0) {
                                disabled = true;
                            }
                        }
                        if (!disabled) {
                            if (this._projectNames.has(this._projectNameText.value.toLowerCase())) {
                                disabled = true;
                            }
                        }
                        this._createBtn.disabled = disabled;
                    }
                    async requestProjectsData() {
                        const list = ((await colibri.ui.ide.FileUtils.getProjects_async(this._workspacePath)).projects).map(s => s.toLowerCase());
                        this._projectNames = new Set(list);
                    }
                    create() {
                        super.create();
                        this.setTitle("New Project");
                        this._createBtn = this.addButton("Create Project", () => {
                            const templateInfo = this._filteredViewer.getViewer().getSelectionFirstElement();
                            this.closeAll();
                            this.createProject(templateInfo);
                        });
                        this.connectInputWithButton(this._projectNameText, this._createBtn);
                        if (this._cancellable) {
                            this.addButton("Cancel", () => this.close());
                        }
                        this.requestProjectsData();
                        const projectDlg = this;
                        colibri.Platform.getWorkbench().getFileStorage().isValidAccount().then(msg => {
                            if (msg) {
                                projectDlg.close();
                                alert(msg);
                            }
                        });
                    }
                    async createProject(templateInfo) {
                        const projectName = this._projectNameText.value;
                        if (this._workspacePath) {
                            await colibri.Platform.getWorkbench().getFileStorage().changeWorkspace(this._workspacePath);
                        }
                        const ok = await colibri.ui.ide.FileUtils.createProject_async(templateInfo.path, projectName);
                        if (ok) {
                            this.closeAll();
                            await ide.IDEPlugin.getInstance().ideOpenProject(projectName);
                            const wb = colibri.Platform.getWorkbench();
                            for (const openFile of templateInfo.info.openFiles) {
                                const file = colibri.ui.ide.FileUtils.getFileFromPath(projectName + "/" + openFile);
                                wb.openEditor(file);
                            }
                        }
                    }
                    createCenterArea() {
                        const centerArea = document.createElement("div");
                        this.createFilteredViewer();
                        centerArea.appendChild(this._filteredViewer.getElement());
                        return centerArea;
                    }
                    createFilteredViewer() {
                        const viewer = new controls.viewers.TreeViewer("phasereditor2d.ide.ui.dialogs.NewProjectDialog");
                        viewer.setLabelProvider(new TemplatesLabelProvider());
                        viewer.setCellRendererProvider(new TemplatesCellRendererProvider());
                        viewer.setContentProvider(new TemplatesContentProvider());
                        viewer.setInput({
                            providers: []
                        });
                        colibri.ui.ide.FileUtils.getProjectTemplates_async().then(data => {
                            viewer.setInput(data);
                            for (const provider of data.providers) {
                                viewer.setExpanded(provider, true);
                            }
                            viewer.setSelection([data.providers[0].templates[0]]);
                            viewer.repaint();
                        });
                        viewer.eventSelectionChanged.addListener(() => {
                            this.validate();
                        });
                        this._filteredViewer = new viewers.FilteredViewerInElement(viewer, false);
                    }
                    layout() {
                        super.layout();
                        this._filteredViewer.resizeTo();
                    }
                }
                dialogs.NewProjectDialog = NewProjectDialog;
                class TemplatesContentProvider {
                    getRoots(input) {
                        const data = input;
                        return data.providers;
                    }
                    getChildren(parent) {
                        if (parent.templates) {
                            return parent.templates;
                        }
                        return [];
                    }
                }
                class TemplatesLabelProvider {
                    getLabel(obj) {
                        return obj.name;
                    }
                }
                class TemplatesCellRendererProvider {
                    getCellRenderer(element) {
                        return new controls.viewers.IconImageCellRenderer(colibri.Platform.getWorkbench().getWorkbenchIcon(colibri.ICON_FOLDER));
                    }
                    preload(element) {
                        return controls.Controls.resolveNothingLoaded();
                    }
                }
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                class NewProjectDialogExtension extends phasereditor2d.files.ui.dialogs.NewDialogExtension {
                    constructor() {
                        super({
                            dialogName: "Project",
                            dialogIconDescriptor: phasereditor2d.files.FilesPlugin.getInstance().getIconDescriptor(phasereditor2d.files.ICON_PROJECT)
                        });
                        this.setPriority(Number.MAX_VALUE);
                    }
                    createDialog(args) {
                        const dlg = new dialogs.NewProjectDialog();
                        dlg.create();
                        return dlg;
                    }
                }
                dialogs.NewProjectDialogExtension = NewProjectDialogExtension;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                class OpeningProjectDialog extends controls.dialogs.ProgressDialog {
                    create() {
                        super.create();
                        this.getDialogBackgroundElement().classList.add("DarkDialogContainer");
                    }
                }
                dialogs.OpeningProjectDialog = OpeningProjectDialog;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                class PlayDialog extends controls.dialogs.Dialog {
                    constructor(url) {
                        super("PlayDialog");
                        this._url = url;
                    }
                    resize() {
                        const width = Math.floor(window.innerWidth * 0.6);
                        const height = Math.floor(window.innerHeight * 0.75);
                        this.setBounds({
                            x: window.innerWidth / 2 - width / 2,
                            y: 10,
                            width: width,
                            height: height
                        });
                    }
                    createDialogArea() {
                        const frameElement = document.createElement("iframe");
                        frameElement.classList.add("DialogClientArea");
                        frameElement.src = this._url;
                        frameElement.addEventListener("load", e => {
                            frameElement.contentDocument.addEventListener("keydown", e2 => {
                                if (e2.key === "Escape") {
                                    this.close();
                                }
                            });
                        });
                        this.getElement().appendChild(frameElement);
                    }
                    create() {
                        super.create();
                        this.setTitle("Play");
                        this.addCancelButton();
                    }
                }
                dialogs.PlayDialog = PlayDialog;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                class ProjectsDialog extends controls.dialogs.ViewerFormDialog {
                    constructor() {
                        super(new controls.viewers.TreeViewer("phasereditor2d.ide.ui.dialogs.ProjectsDialog"), false);
                        this.setSize(undefined, Math.floor(window.innerHeight * 0.45));
                    }
                    async create() {
                        super.create();
                        const viewer = this.getViewer();
                        viewer.setLabelProvider(new controls.viewers.LabelProvider());
                        viewer.setCellRendererProvider(new ui.viewers.ProjectCellRendererProvider());
                        viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                        viewer.setInput([]);
                        viewer.eventOpenItem.addListener(() => this.openProject());
                        this.setTitle("Projects");
                        this.addButton("New Project", () => this.openNewProjectDialog());
                        const root = colibri.ui.ide.FileUtils.getRoot();
                        {
                            const btn = this.addButton("Open Project", () => this.openProject());
                            btn.disabled = true;
                            viewer.eventSelectionChanged.addListener(() => {
                                let disabled = false;
                                const sel = viewer.getSelection();
                                try {
                                    if (root) {
                                        if (sel[0] === root.getName()) {
                                            disabled = true;
                                            return;
                                        }
                                    }
                                    if (sel.length !== 1) {
                                        disabled = true;
                                        return;
                                    }
                                }
                                finally {
                                    btn.disabled = disabled;
                                }
                            });
                        }
                        this.refreshData();
                    }
                    async refreshData() {
                        const viewer = this.getViewer();
                        const root = colibri.ui.ide.FileUtils.getRoot();
                        const { projects, workspacePath } = await colibri.ui.ide.FileUtils.getProjects_async(this._workspacePath);
                        viewer.setInput(projects);
                        if (root) {
                            viewer.setSelection([root.getName()]);
                        }
                        viewer.repaint();
                        if (this._wsInputElement) {
                            this._wsInputElement.value = workspacePath;
                        }
                    }
                    createFormArea(formArea) {
                        const electron = colibri.Platform.getElectron();
                        if (!electron) {
                            formArea.remove();
                            this.layout();
                            return;
                        }
                        formArea.style.gridTemplateColumns = "auto 1fr auto";
                        const label = document.createElement("label");
                        label.innerHTML = "Workspace";
                        formArea.appendChild(label);
                        const input = document.createElement("input");
                        input.readOnly = true;
                        formArea.appendChild(input);
                        const btn = document.createElement("button");
                        btn.innerText = "Change";
                        formArea.appendChild(btn);
                        btn.addEventListener("click", async () => {
                            const dir = electron.sendMessageSync({
                                method: "open-directory",
                                body: {
                                    current: this._wsInputElement.value
                                }
                            });
                            if (dir) {
                                this._workspacePath = dir;
                                await this.refreshData();
                            }
                        });
                        this._wsInputElement = input;
                    }
                    async openProject() {
                        this.close();
                        const project = this.getViewer().getSelectionFirstElement();
                        ide.IDEPlugin.getInstance().ideOpenProject(project, this._workspacePath);
                    }
                    openNewProjectDialog() {
                        const dlg = new dialogs.NewProjectDialog(this._workspacePath);
                        dlg.create();
                    }
                }
                dialogs.ProjectsDialog = ProjectsDialog;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                class UnlockDialog extends controls.dialogs.InputDialog {
                    create() {
                        super.create();
                        this.setTitle("Unlock Phaser Editor 2D");
                        this.setMessage("Enter the License Key");
                        const btn = this.addButton("Get License Key", () => {
                            controls.Controls.openUrlInNewPage("https://gumroad.com/l/phasereditor");
                        });
                        btn.style.float = "left";
                        this.getAcceptButton().innerText = "Unlock";
                        this.setInputValidator(text => text.trim().length > 0);
                        this.validate();
                        this.setResultCallback(async (value) => {
                            const data = await colibri.core.io.apiRequest("UnlockEditor", {
                                lickey: value
                            });
                            if (data.error) {
                                alert("Error: " + data.error);
                            }
                            else {
                                alert(data.message);
                                if (data.activated) {
                                    setTimeout(() => {
                                        if (confirm("A page refresh is required. Do you want to refresh it now?")) {
                                            window.location.reload();
                                        }
                                    }, 3000);
                                }
                            }
                        });
                    }
                }
                dialogs.UnlockDialog = UnlockDialog;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ide;
    (function (ide) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class ProjectCellRendererProvider {
                    getCellRenderer(element) {
                        return new controls.viewers.IconImageCellRenderer(phasereditor2d.files.FilesPlugin.getInstance().getIcon(phasereditor2d.files.ICON_PROJECT));
                    }
                    preload(element) {
                        return controls.Controls.resolveNothingLoaded();
                    }
                }
                viewers.ProjectCellRendererProvider = ProjectCellRendererProvider;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = ide.ui || (ide.ui = {}));
    })(ide = phasereditor2d.ide || (phasereditor2d.ide = {}));
})(phasereditor2d || (phasereditor2d = {}));
