var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_ANIMATIONS = "Phaser v3 Animations";
                class AnimationsContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.AnimationsContentTypeResolver";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                if (data.meta) {
                                    if (data.meta.contentType === contentTypes.CONTENT_TYPE_ANIMATIONS) {
                                        return contentTypes.CONTENT_TYPE_ANIMATIONS;
                                    }
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.AnimationsContentTypeResolver = AnimationsContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./core/contentTypes/AnimationsContentTypeResolver.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ide = colibri.ui.ide;
        pack.ICON_ASSET_PACK = "asset-pack";
        pack.ICON_ANIMATIONS = "animations";
        pack.ICON_TILEMAP = "tilemap";
        pack.ICON_TILEMAP_LAYER = "tilemap-layer";
        pack.CAT_ASSET_PACK = "phasereditor2d.pack.ui.editor.category";
        pack.CMD_ASSET_PACK_EDITOR_ADD_FILE = "phasereditor2d.pack.ui.editor.AddFile";
        pack.CMD_TOGGLE_SIMPLE_RENDERING_OF_TEXTURE_ATLAS = "phasereditor2d.pack.ui.editor.ToggleSimpleRenderingOfTextureAtlas";
        class AssetPackPlugin extends colibri.Plugin {
            constructor() {
                super("phasereditor2d.pack");
            }
            static getInstance() {
                return this._instance;
            }
            async started() {
                colibri.Platform.getWorkbench().eventBeforeOpenProject.addListener(() => {
                    pack.core.ImageFrameContainerAssetPackItem.resetCache();
                });
            }
            registerExtensions(reg) {
                // icons loader
                reg.addExtension(ide.IconLoaderExtension.withPluginFiles(this, [
                    pack.ICON_ASSET_PACK,
                    pack.ICON_ANIMATIONS,
                    pack.ICON_TILEMAP,
                    pack.ICON_TILEMAP_LAYER
                ]));
                // content type resolvers
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.AssetPackContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.AtlasContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.MultiatlasContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.AtlasXMLContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.UnityAtlasContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.AnimationsContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.BitmapFontContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.TilemapImpactContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.TilemapTiledJSONContentTypeResolver()], 5));
                reg.addExtension(new colibri.core.ContentTypeExtension([new pack.core.contentTypes.AudioSpriteContentTypeResolver()], 5));
                // content type icons
                reg.addExtension(ide.ContentTypeIconExtension.withPluginIcons(this, [
                    {
                        iconName: pack.ICON_ASSET_PACK,
                        contentType: pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK
                    },
                    {
                        iconName: pack.ICON_ANIMATIONS,
                        contentType: pack.core.contentTypes.CONTENT_TYPE_ANIMATIONS
                    },
                    {
                        iconName: pack.ICON_TILEMAP,
                        contentType: pack.core.contentTypes.CONTENT_TYPE_TILEMAP_TILED_JSON
                    },
                    {
                        plugin: phasereditor2d.webContentTypes.WebContentTypesPlugin.getInstance(),
                        iconName: phasereditor2d.webContentTypes.ICON_FILE_FONT,
                        contentType: pack.core.contentTypes.CONTENT_TYPE_BITMAP_FONT
                    }
                ]));
                // plugin resources loader
                reg.addExtension(new ide.PluginResourceLoaderExtension(async () => {
                    await AssetPackPlugin.getInstance().getPhaserDocs().preload();
                }));
                // project resources preloader
                reg.addExtension(new pack.core.AssetPackPreloadProjectExtension());
                // editors
                reg.addExtension(new ide.EditorExtension([
                    pack.ui.editor.AssetPackEditor.getFactory()
                ]));
                // commands
                reg.addExtension(new ide.commands.CommandExtension(manager => {
                    // category
                    manager.addCategory({
                        id: pack.CAT_ASSET_PACK,
                        name: "Asset Pack"
                    });
                    // delete
                    manager.addHandlerHelper(ide.actions.CMD_DELETE, args => pack.ui.editor.AssetPackEditor.isEditorScope(args)
                        && args.activeEditor.getSelection().length > 0, args => {
                        const editor = args.activeEditor;
                        editor.deleteSelection();
                    });
                    // add file
                    manager.add({
                        command: {
                            id: pack.CMD_ASSET_PACK_EDITOR_ADD_FILE,
                            icon: colibri.Platform.getWorkbench().getWorkbenchIcon(colibri.ICON_PLUS),
                            name: "Add File",
                            tooltip: "Add new file configuration",
                            category: pack.CAT_ASSET_PACK
                        },
                        handler: {
                            testFunc: args => pack.ui.editor.AssetPackEditor.isEditorScope(args),
                            executeFunc: args => args.activeEditor.openAddFileDialog()
                        },
                        keys: {
                            key: "A"
                        }
                    });
                }));
                // new file dialog
                reg.addExtension(new pack.ui.dialogs.NewAssetPackFileWizardExtension());
                reg.addExtension(new phasereditor2d.files.ui.views.FilePropertySectionExtension(page => new pack.ui.properties.AddFileToPackFileSection(page)));
                // files view sections
                reg.addExtension(phasereditor2d.files.ui.views.ContentTypeSectionExtension.withSection(phasereditor2d.files.ui.views.TAB_SECTION_DESIGN, pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK, pack.core.contentTypes.CONTENT_TYPE_ANIMATIONS, colibri.core.CONTENT_TYPE_PUBLIC_ROOT));
                reg.addExtension(phasereditor2d.files.ui.views.ContentTypeSectionExtension.withSection(phasereditor2d.files.ui.views.TAB_SECTION_ASSETS, pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK, pack.core.contentTypes.CONTENT_TYPE_ANIMATIONS, pack.core.contentTypes.CONTENT_TYPE_ATLAS, pack.core.contentTypes.CONTENT_TYPE_ATLAS_XML, pack.core.contentTypes.CONTENT_TYPE_MULTI_ATLAS, pack.core.contentTypes.CONTENT_TYPE_UNITY_ATLAS, colibri.core.CONTENT_TYPE_PUBLIC_ROOT));
            }
            getPhaserDocs() {
                return this._phaserDocs ?
                    this._phaserDocs :
                    (this._phaserDocs = new phasereditor2d.ide.core.PhaserDocs(this, "data/phaser-docs.json"));
            }
        }
        AssetPackPlugin._instance = new AssetPackPlugin();
        pack.AssetPackPlugin = AssetPackPlugin;
        colibri.Platform.addPlugin(AssetPackPlugin.getInstance());
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            class AnimationConfigInPackItem {
                constructor() {
                    this._frames = [];
                }
                getKey() {
                    return this._key;
                }
                setKey(key) {
                    this._key = key;
                }
                getFrames() {
                    return this._frames;
                }
            }
            core.AnimationConfigInPackItem = AnimationConfigInPackItem;
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            class AnimationFrameConfigInPackItem {
                getTextureKey() {
                    return this._textureKey;
                }
                setTextureKey(textureKey) {
                    this._textureKey = textureKey;
                }
                getFrameKey() {
                    return this._frameKey;
                }
                setFrameKey(frameKey) {
                    this._frameKey = frameKey;
                }
            }
            core.AnimationFrameConfigInPackItem = AnimationFrameConfigInPackItem;
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_1) {
        var core;
        (function (core) {
            var controls = colibri.ui.controls;
            class AssetPackItem {
                constructor(pack, data) {
                    this._pack = pack;
                    this._data = data;
                    this._editorData = {};
                }
                getFileFromAssetUrl(url) {
                    return core.AssetPackUtils.getFileFromPackUrl(this.getPack(), url);
                }
                computeUsedFiles(files) {
                    this.addFilesFromDataKey(files, "url");
                    this.addFilesFromDataKey(files, "urls");
                    this.addFilesFromDataKey(files, "normalMap");
                }
                addFilesFromDataKey(files, ...keys) {
                    const urls = [];
                    for (const key of keys) {
                        if (Array.isArray(this._data[key])) {
                            urls.push(...this._data[key]);
                        }
                        if (typeof (this._data[key]) === "string") {
                            urls.push(this._data[key]);
                        }
                    }
                    this.addFilesFromUrls(files, urls);
                }
                addFilesFromUrls(files, urls) {
                    for (const url of urls) {
                        const file = this.getFileFromAssetUrl(url);
                        if (file) {
                            files.add(file);
                        }
                    }
                }
                getEditorData() {
                    return this._editorData;
                }
                getPack() {
                    return this._pack;
                }
                getKey() {
                    return this._data["key"];
                }
                setKey(key) {
                    this._data["key"] = key;
                }
                getType() {
                    return this._data["type"];
                }
                getData() {
                    return this._data;
                }
                addToPhaserCache(game, cache) {
                    // empty
                }
                async preload() {
                    return controls.Controls.resolveNothingLoaded();
                }
                resetCache() {
                    // empty
                }
                getPackItem() {
                    return this;
                }
            }
            core.AssetPackItem = AssetPackItem;
        })(core = pack_1.core || (pack_1.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_2) {
        var core;
        (function (core) {
            var controls = colibri.ui.controls;
            class AnimationsAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                getUrl() {
                    return this.getData()["url"];
                }
                getAnimations() {
                    return this._animations || [];
                }
                async preload() {
                    if (this._animations) {
                        return controls.PreloadResult.NOTHING_LOADED;
                    }
                    this._animations = [];
                    try {
                        const file = this.getFileFromAssetUrl(this.getUrl());
                        if (file) {
                            const content = await colibri.ui.ide.FileUtils.preloadAndGetFileString(file);
                            const data = JSON.parse(content);
                            for (const animData of data.anims) {
                                const animConfig = new core.AnimationConfigInPackItem();
                                animConfig.setKey(animData.key);
                                for (const frameData of animData.frames) {
                                    const frameConfig = new core.AnimationFrameConfigInPackItem();
                                    frameConfig.setTextureKey(frameData.key);
                                    frameConfig.setFrameKey(frameData.frame);
                                    animConfig.getFrames().push(frameConfig);
                                }
                                this._animations.push(animConfig);
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                    return controls.PreloadResult.RESOURCES_LOADED;
                }
            }
            core.AnimationsAssetPackItem = AnimationsAssetPackItem;
        })(core = pack_2.core || (pack_2.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core_1) {
            var ide = colibri.ui.ide;
            core_1.IMAGE_TYPE = "image";
            core_1.ATLAS_TYPE = "atlas";
            core_1.ATLAS_XML_TYPE = "atlasXML";
            core_1.UNITY_ATLAS_TYPE = "unityAtlas";
            core_1.MULTI_ATLAS_TYPE = "multiatlas";
            core_1.SPRITESHEET_TYPE = "spritesheet";
            core_1.ANIMATION_TYPE = "animation";
            core_1.AUDIO_TYPE = "audio";
            core_1.AUDIO_SPRITE_TYPE = "audioSprite";
            core_1.BINARY_TYPE = "binary";
            core_1.BITMAP_FONT_TYPE = "bitmapFont";
            core_1.CSS_TYPE = "css";
            core_1.GLSL_TYPE = "glsl";
            core_1.HTML_TYPE = "html";
            core_1.HTML_TEXTURE_TYPE = "htmlTexture";
            core_1.JSON_TYPE = "json";
            core_1.PLUGIN_TYPE = "plugin";
            core_1.SCENE_FILE_TYPE = "sceneFile";
            core_1.SCENE_PLUGIN_TYPE = "scenePlugin";
            core_1.SCRIPT_TYPE = "script";
            core_1.SCRIPTS_TYPE = "scripts";
            core_1.SVG_TYPE = "svg";
            core_1.TEXT_TYPE = "text";
            core_1.TILEMAP_CSV_TYPE = "tilemapCSV";
            core_1.TILEMAP_IMPACT_TYPE = "tilemapImpact";
            core_1.TILEMAP_TILED_JSON_TYPE = "tilemapTiledJSON";
            core_1.VIDEO_TYPE = "video";
            core_1.XML_TYPE = "xml";
            core_1.TYPES = [
                core_1.IMAGE_TYPE,
                core_1.SVG_TYPE,
                core_1.ATLAS_TYPE,
                core_1.ATLAS_XML_TYPE,
                core_1.UNITY_ATLAS_TYPE,
                core_1.MULTI_ATLAS_TYPE,
                core_1.SPRITESHEET_TYPE,
                core_1.ANIMATION_TYPE,
                core_1.BITMAP_FONT_TYPE,
                core_1.TILEMAP_CSV_TYPE,
                core_1.TILEMAP_IMPACT_TYPE,
                core_1.TILEMAP_TILED_JSON_TYPE,
                core_1.PLUGIN_TYPE,
                core_1.SCENE_FILE_TYPE,
                core_1.SCENE_PLUGIN_TYPE,
                core_1.SCRIPT_TYPE,
                core_1.SCRIPTS_TYPE,
                core_1.AUDIO_TYPE,
                core_1.AUDIO_SPRITE_TYPE,
                core_1.VIDEO_TYPE,
                core_1.TEXT_TYPE,
                core_1.CSS_TYPE,
                core_1.GLSL_TYPE,
                core_1.HTML_TYPE,
                core_1.HTML_TEXTURE_TYPE,
                core_1.BINARY_TYPE,
                core_1.JSON_TYPE,
                core_1.XML_TYPE
            ];
            core_1.TYPES_SET = new Set(core_1.TYPES);
            class AssetPack {
                constructor(file, content) {
                    this._file = file;
                    this._items = [];
                    if (content) {
                        try {
                            const data = JSON.parse(content);
                            this.fromJSON(data);
                            if (data.meta) {
                                this._showAllFilesInBlocks = data.meta.showAllFilesInBlocks || false;
                            }
                        }
                        catch (e) {
                            console.error(e);
                            alert(e.message);
                        }
                    }
                }
                isShowAllFilesInBlocks() {
                    return this._showAllFilesInBlocks;
                }
                setShowAllFilesInBlocks(showAllFilesInBlocks) {
                    this._showAllFilesInBlocks = showAllFilesInBlocks;
                }
                computeUsedFiles(files = new Set()) {
                    files.add(this._file);
                    for (const item of this.getItems()) {
                        item.computeUsedFiles(files);
                    }
                    return files;
                }
                toJSON() {
                    return {
                        section1: {
                            files: this._items.map(item => item.getData())
                        },
                        meta: {
                            app: "Phaser Editor 2D - Asset Pack Editor",
                            contentType: pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK,
                            url: "https://phasereditor2d.com",
                            version: 2,
                            showAllFilesInBlocks: this._showAllFilesInBlocks
                        }
                    };
                }
                fromJSON(data) {
                    this._items = [];
                    for (const sectionId in data) {
                        if (data.hasOwnProperty(sectionId)) {
                            const sectionData = data[sectionId];
                            const filesData = sectionData["files"];
                            if (filesData) {
                                for (const fileData of filesData) {
                                    const item = this.createPackItem(fileData);
                                    this._items.push(item);
                                }
                            }
                        }
                    }
                    this.sortItems();
                }
                sortItems() {
                    this._items.sort((a, b) => a.getKey().localeCompare(b.getKey()));
                }
                createPackItem(data) {
                    const type = data.type;
                    switch (type) {
                        case core_1.IMAGE_TYPE:
                            return new core_1.ImageAssetPackItem(this, data);
                        case core_1.SVG_TYPE:
                            return new core_1.SvgAssetPackItem(this, data);
                        case core_1.ATLAS_TYPE:
                            return new core_1.AtlasAssetPackItem(this, data);
                        case core_1.ATLAS_XML_TYPE:
                            return new core_1.AtlasXMLAssetPackItem(this, data);
                        case core_1.UNITY_ATLAS_TYPE:
                            return new core_1.UnityAtlasAssetPackItem(this, data);
                        case core_1.MULTI_ATLAS_TYPE:
                            return new core_1.MultiatlasAssetPackItem(this, data);
                        case core_1.SPRITESHEET_TYPE:
                            return new core_1.SpritesheetAssetPackItem(this, data);
                        case core_1.ANIMATION_TYPE:
                            return new core_1.AnimationsAssetPackItem(this, data);
                        case core_1.BITMAP_FONT_TYPE:
                            return new core_1.BitmapFontAssetPackItem(this, data);
                        case core_1.TILEMAP_CSV_TYPE:
                            return new core_1.TilemapCSVAssetPackItem(this, data);
                        case core_1.TILEMAP_IMPACT_TYPE:
                            return new core_1.TilemapImpactAssetPackItem(this, data);
                        case core_1.TILEMAP_TILED_JSON_TYPE:
                            return new core_1.TilemapTiledJSONAssetPackItem(this, data);
                        case core_1.PLUGIN_TYPE:
                            return new core_1.PluginAssetPackItem(this, data);
                        case core_1.SCENE_FILE_TYPE:
                            return new core_1.SceneFileAssetPackItem(this, data);
                        case core_1.SCENE_PLUGIN_TYPE:
                            return new core_1.ScenePluginAssetPackItem(this, data);
                        case core_1.SCRIPT_TYPE:
                            return new core_1.ScriptAssetPackItem(this, data);
                        case core_1.SCRIPTS_TYPE:
                            return new core_1.ScriptsAssetPackItem(this, data);
                        case core_1.AUDIO_TYPE:
                            return new core_1.AudioAssetPackItem(this, data);
                        case core_1.AUDIO_SPRITE_TYPE:
                            return new core_1.AudioSpriteAssetPackItem(this, data);
                        case core_1.VIDEO_TYPE:
                            return new core_1.VideoAssetPackItem(this, data);
                        case core_1.TEXT_TYPE:
                            return new core_1.TextAssetPackItem(this, data);
                        case core_1.CSS_TYPE:
                            return new core_1.CssAssetPackItem(this, data);
                        case core_1.GLSL_TYPE:
                            return new core_1.GlslAssetPackItem(this, data);
                        case core_1.HTML_TYPE:
                            return new core_1.HTMLAssetPackItem(this, data);
                        case core_1.HTML_TEXTURE_TYPE:
                            return new core_1.HTMLTextureAssetPackItem(this, data);
                        case core_1.BINARY_TYPE:
                            return new core_1.BinaryAssetPackItem(this, data);
                        case core_1.JSON_TYPE:
                            return new core_1.JSONAssetPackItem(this, data);
                        case core_1.XML_TYPE:
                            return new core_1.XMLAssetPackItem(this, data);
                    }
                    throw new Error(`Unknown file type ${type}`);
                }
                static async createFromFile(file) {
                    const content = await ide.FileUtils.preloadAndGetFileString(file);
                    return new AssetPack(file, content);
                }
                getItems() {
                    return this._items;
                }
                addItem(item) {
                    this._items.push(item);
                    this.sortItems();
                }
                deleteItem(item) {
                    const i = this._items.indexOf(item);
                    if (i >= 0) {
                        this._items.splice(i, 1);
                    }
                }
                getFile() {
                    return this._file;
                }
                getUrlFromAssetFile(file) {
                    return core_1.AssetPackUtils.getUrlFromAssetFile(this, file);
                }
            }
            core_1.AssetPack = AssetPack;
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var controls = colibri.ui.controls;
            class AssetPackImageFrame extends controls.ImageFrame {
                constructor(packItem, name, frameImage, frameData) {
                    super(name, frameImage, frameData);
                    this._packItem = packItem;
                }
                equalsKeys(other) {
                    if (other) {
                        return other.getPackItem().getKey() === this.getPackItem().getKey()
                            && other.getName() === this.getName();
                    }
                    return false;
                }
                getPackItem() {
                    return this._packItem;
                }
            }
            core.AssetPackImageFrame = AssetPackImageFrame;
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_3) {
        var core;
        (function (core) {
            var ide = colibri.ui.ide;
            class AssetPackPreloadProjectExtension extends ide.PreloadProjectResourcesExtension {
                constructor() {
                    super();
                }
                async computeTotal() {
                    const packs = await core.AssetPackUtils.getAllPacks();
                    const items = packs.flatMap(pack => pack.getItems());
                    return items.length;
                }
                async preload(monitor) {
                    const finder = new core.PackFinder();
                    return finder.preload(monitor);
                }
            }
            core.AssetPackPreloadProjectExtension = AssetPackPreloadProjectExtension;
        })(core = pack_3.core || (pack_3.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_4) {
        var core;
        (function (core) {
            var ide = colibri.ui.ide;
            const ATLAS_TYPES = new Set([
                core.MULTI_ATLAS_TYPE,
                core.ATLAS_TYPE,
                core.UNITY_ATLAS_TYPE,
                core.ATLAS_XML_TYPE,
            ]);
            class AssetPackUtils {
                static distinct(packs) {
                    return [...new Set(packs)].sort((a, b) => {
                        return ide.FileUtils.compareFiles(a.getFile(), b.getFile());
                    });
                }
                static isAtlasType(type) {
                    return ATLAS_TYPES.has(type);
                }
                static isImageFrameOrImage(obj) {
                    return obj instanceof core.AssetPackImageFrame || obj instanceof core.ImageAssetPackItem;
                }
                static async getAllPacks() {
                    const files = await ide.FileUtils.getFilesWithContentType(core.contentTypes.CONTENT_TYPE_ASSET_PACK);
                    const packs = [];
                    for (const file of files) {
                        const pack = await core.AssetPack.createFromFile(file);
                        if (pack) {
                            packs.push(pack);
                        }
                    }
                    return packs;
                }
                static getUrlFromAssetFile(packOrFolder, file) {
                    const packFolder = packOrFolder instanceof core.AssetPack ? packOrFolder.getFile().getParent() : packOrFolder;
                    const root = ide.FileUtils.getPublicRoot(packFolder);
                    const rootPath = root.getFullName();
                    const filePath = file.getFullName();
                    if (filePath.startsWith(rootPath)) {
                        return filePath.substring(rootPath.length + 1);
                    }
                    return file.getProjectRelativeName();
                }
                static getFileFromPackUrl(packOrFolder, url) {
                    const folder = packOrFolder instanceof core.AssetPack ? packOrFolder.getFile().getParent() : packOrFolder;
                    const pubRoot = ide.FileUtils.getPublicRoot(folder);
                    return ide.FileUtils.getFileFromPath(url, pubRoot);
                }
                static getFilePackUrlWithNewExtension(pack, file, ext) {
                    const url = pack.getUrlFromAssetFile(file.getParent());
                    return `${url}/${file.getNameWithoutExtension()}.${ext}`;
                }
                static getFileStringFromPackUrl(packOrFolder, url) {
                    const file = this.getFileFromPackUrl(packOrFolder, url);
                    if (!file) {
                        return null;
                    }
                    const str = ide.FileUtils.getFileString(file);
                    return str;
                }
                static getFileJSONFromPackUrl(packOrFolder, url) {
                    const str = this.getFileStringFromPackUrl(packOrFolder, url);
                    return JSON.parse(str);
                }
                static getFileXMLFromPackUrl(packOrFolder, url) {
                    const str = this.getFileStringFromPackUrl(packOrFolder, url);
                    const parser = new DOMParser();
                    return parser.parseFromString(str, "text/xml");
                }
                static getImageFromPackUrl(packOrFolder, url) {
                    const file = this.getFileFromPackUrl(packOrFolder, url);
                    if (file) {
                        return ide.Workbench.getWorkbench().getFileImage(file);
                    }
                    return null;
                }
            }
            core.AssetPackUtils = AssetPackUtils;
        })(core = pack_4.core || (pack_4.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_5) {
        var core;
        (function (core) {
            var controls = colibri.ui.controls;
            class ImageFrameContainerAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                    this._frames = null;
                }
                getThumbnail() {
                    return this._thumbnail;
                }
                async preload() {
                    if (this._frames) {
                        return controls.Controls.resolveNothingLoaded();
                    }
                    const parser = this.createParser();
                    return parser.preloadFrames();
                }
                async preloadImages() {
                    let result = controls.PreloadResult.NOTHING_LOADED;
                    const frames = this.getFrames();
                    for (const frame of frames) {
                        result = Math.max(await frame.preload(), result);
                    }
                    const result2 = await this.makeThumbnail();
                    return Math.max(result, result2);
                }
                static resetCache() {
                    this._cache = new Map();
                }
                getCacheKey() {
                    const files = new Set();
                    this.computeUsedFiles(files);
                    const key = [...files]
                        .filter(file => file !== null && file !== undefined)
                        .map(file => file.getFullName() + "@" + file.getModTime()).join(",");
                    return key;
                }
                async makeThumbnail() {
                    const cache = ImageFrameContainerAssetPackItem._cache;
                    const key = this.getCacheKey();
                    if (cache.has(key)) {
                        this._thumbnail = cache.get(key);
                        return controls.PreloadResult.NOTHING_LOADED;
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = canvas.height = 256 * (window.devicePixelRatio || 1);
                    canvas.style.width = canvas.style.height = canvas.width + "px";
                    const ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    this.renderCanvas(ctx, canvas.width, this._frames);
                    const img = document.createElement("img");
                    const promise = new Promise((resolve, reject) => {
                        canvas.toBlob(blob => {
                            img.src = URL.createObjectURL(blob);
                            resolve(controls.PreloadResult.RESOURCES_LOADED);
                        }, "image/png");
                    });
                    this._thumbnail = new controls.ImageWrapper(img);
                    cache.set(key, this._thumbnail);
                    return promise;
                }
                renderCanvas(ctx, canvasSize, frames) {
                    const maxCount = 4;
                    const realCount = frames.length;
                    if (realCount === 0) {
                        return;
                    }
                    let frameCount = realCount;
                    if (frameCount === 0) {
                        return;
                    }
                    let step = 1;
                    if (frameCount > maxCount) {
                        step = frameCount / maxCount;
                        frameCount = maxCount;
                    }
                    if (frameCount === 0) {
                        frameCount = 1;
                    }
                    let cellSize = Math.floor(Math.sqrt(canvasSize * canvasSize / frameCount) * 0.8) + 1;
                    if (frameCount === 1) {
                        cellSize = canvasSize;
                    }
                    const cols = Math.floor(canvasSize / cellSize);
                    const rows = frameCount / cols + (frameCount % cols === 0 ? 0 : 1);
                    const marginX = Math.floor(Math.max(0, (canvasSize - cols * cellSize) / 2));
                    const marginY = Math.floor(Math.max(0, (canvasSize - rows * cellSize) / 2));
                    let itemX = 0;
                    let itemY = 0;
                    for (let i = 0; i < frameCount; i++) {
                        if (itemY + cellSize > canvasSize) {
                            break;
                        }
                        const index = Math.min(realCount - 1, Math.round(i * step));
                        const frame = frames[index];
                        frame.paint(ctx, marginX + itemX, marginY + itemY, cellSize, cellSize, true);
                        itemX += cellSize;
                        if (itemX + cellSize > canvasSize) {
                            itemY += cellSize;
                            itemX = 0;
                        }
                    }
                }
                resetCache() {
                    this._frames = null;
                }
                findFrame(frameName) {
                    return this.getFrames().find(f => f.getName() === frameName);
                }
                getFrames() {
                    if (this._frames === null) {
                        const parser = this.createParser();
                        this._frames = parser.parseFrames();
                    }
                    return this._frames;
                }
                addToPhaserCache(game, cache) {
                    const parser = this.createParser();
                    parser.addToPhaserCache(game, cache);
                }
            }
            ImageFrameContainerAssetPackItem._cache = new Map();
            core.ImageFrameContainerAssetPackItem = ImageFrameContainerAssetPackItem;
        })(core = pack_5.core || (pack_5.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./ImageFrameContainerAssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            class BaseAtlasAssetPackItem extends core.ImageFrameContainerAssetPackItem {
                computeUsedFiles(files) {
                    super.computeUsedFiles(files);
                    this.addFilesFromDataKey(files, "atlasURL", "textureURL");
                }
            }
            core.BaseAtlasAssetPackItem = BaseAtlasAssetPackItem;
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasAssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_6) {
        var core;
        (function (core) {
            class AtlasAssetPackItem extends core.BaseAtlasAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                createParser() {
                    return new core.parsers.AtlasParser(this);
                }
            }
            core.AtlasAssetPackItem = AtlasAssetPackItem;
        })(core = pack_6.core || (pack_6.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_7) {
        var core;
        (function (core) {
            class AtlasXMLAssetPackItem extends core.BaseAtlasAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                createParser() {
                    return new core.parsers.AtlasXMLParser(this);
                }
            }
            core.AtlasXMLAssetPackItem = AtlasXMLAssetPackItem;
        })(core = pack_7.core || (pack_7.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_8) {
        var core;
        (function (core) {
            class AudioAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.AudioAssetPackItem = AudioAssetPackItem;
        })(core = pack_8.core || (pack_8.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_9) {
        var core;
        (function (core) {
            class AudioSpriteAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                computeUsedFiles(files) {
                    super.computeUsedFiles(files);
                    this.addFilesFromDataKey(files, "jsonURL", "audioURL");
                }
            }
            core.AudioSpriteAssetPackItem = AudioSpriteAssetPackItem;
        })(core = pack_9.core || (pack_9.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_10) {
        var core;
        (function (core) {
            class BinaryAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.BinaryAssetPackItem = BinaryAssetPackItem;
        })(core = pack_10.core || (pack_10.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_11) {
        var core;
        (function (core) {
            var controls = colibri.ui.controls;
            class BitmapFontAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                async preload() {
                    const dataUrl = this.getData().fontDataURL;
                    if (dataUrl) {
                        const file = this.getFileFromAssetUrl(dataUrl);
                        if (file) {
                            const result = await colibri.ui.ide.FileUtils.preloadFileString(file);
                            if (this._fontData === undefined || result === controls.PreloadResult.RESOURCES_LOADED) {
                                const str = colibri.ui.ide.FileUtils.getFileString(file);
                                this._fontData = parseFontData(str);
                            }
                            return result;
                        }
                    }
                    return controls.Controls.resolveNothingLoaded();
                }
                getFontData() {
                    return this._fontData;
                }
                createImageAsset() {
                    const data = this.getData();
                    const imageAsset = new core.ImageAssetPackItem(this.getPack(), {
                        key: this.getKey(),
                        url: data.textureURL,
                        normalMap: data.normalMap
                    });
                    return imageAsset;
                }
                async preloadImages() {
                    const imageAsset = this.createImageAsset();
                    return imageAsset.preloadImages();
                }
                computeUsedFiles(files) {
                    super.computeUsedFiles(files);
                    this.addFilesFromDataKey(files, "fontDataURL", "textureURL");
                }
                addToPhaserCache(game, cache) {
                    const key = this.getKey();
                    if (game.cache.bitmapFont.has(key)) {
                        return;
                    }
                    const imageAsset = this.createImageAsset();
                    imageAsset.addToPhaserCache(game, cache);
                    const xmlFile = this.getFileFromAssetUrl(this.getData().fontDataURL);
                    if (!xmlFile) {
                        return;
                    }
                    const xmlString = colibri.ui.ide.FileUtils.getFileString(xmlFile);
                    if (!xmlString) {
                        return;
                    }
                    const frame = game.textures.getFrame(imageAsset.getKey());
                    if (frame) {
                        const xmlDoc = Phaser.DOM.ParseXML(xmlString);
                        const xmlData = Phaser.GameObjects.BitmapText.ParseXMLBitmapFont(xmlDoc, frame);
                        game.cache.bitmapFont.add(key, {
                            data: xmlData,
                            texture: key,
                            frame: null
                        });
                    }
                    else {
                        console.error(`Image '${imageAsset.getKey()}' key not found.`);
                    }
                    cache.addAsset(this);
                }
            }
            core.BitmapFontAssetPackItem = BitmapFontAssetPackItem;
            function getValue(node, attribute) {
                return parseInt(node.getAttribute(attribute), 10);
            }
            function parseFontData(xmlContent) {
                const data = {
                    chars: new Map()
                };
                try {
                    const xml = new DOMParser().parseFromString(xmlContent, "text/xml");
                    const letters = xml.getElementsByTagName('char');
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < letters.length; i++) {
                        const node = letters[i];
                        const charCode = getValue(node, 'id');
                        const gx = getValue(node, 'x');
                        const gy = getValue(node, 'y');
                        const gw = getValue(node, 'width');
                        const gh = getValue(node, 'height');
                        data.chars.set(charCode, {
                            x: gx,
                            y: gy,
                            width: gw,
                            height: gh,
                        });
                    }
                }
                catch (e) {
                    console.error(e);
                }
                return data;
            }
        })(core = pack_11.core || (pack_11.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_12) {
        var core;
        (function (core) {
            class CssAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.CssAssetPackItem = CssAssetPackItem;
        })(core = pack_12.core || (pack_12.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_13) {
        var core;
        (function (core) {
            class GlslAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.GlslAssetPackItem = GlslAssetPackItem;
        })(core = pack_13.core || (pack_13.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_14) {
        var core;
        (function (core) {
            class HTMLAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.HTMLAssetPackItem = HTMLAssetPackItem;
        })(core = pack_14.core || (pack_14.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_15) {
        var core;
        (function (core) {
            class HTMLTextureAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.HTMLTextureAssetPackItem = HTMLTextureAssetPackItem;
        })(core = pack_15.core || (pack_15.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_16) {
        var core;
        (function (core) {
            class ImageAssetPackItem extends core.ImageFrameContainerAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                getUrl() {
                    return this.getData()["url"];
                }
                createParser() {
                    return new core.parsers.ImageParser(this);
                }
            }
            core.ImageAssetPackItem = ImageAssetPackItem;
        })(core = pack_16.core || (pack_16.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_17) {
        var core;
        (function (core) {
            class JSONAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.JSONAssetPackItem = JSONAssetPackItem;
        })(core = pack_17.core || (pack_17.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_18) {
        var core;
        (function (core) {
            var io = colibri.core.io;
            var ide = colibri.ui.ide;
            class MultiatlasAssetPackItem extends core.BaseAtlasAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                createParser() {
                    return new core.parsers.MultiAtlasParser(this);
                }
                computeUsedFiles(files) {
                    super.computeUsedFiles(files);
                    try {
                        const urlSet = new Set();
                        const atlasUrl = this.getData().url;
                        const atlasFile = this.getFileFromAssetUrl(atlasUrl);
                        const atlasUrlElements = atlasUrl.split("/");
                        atlasUrlElements.pop();
                        const atlasUrlParent = atlasUrlElements.join("/");
                        if (atlasFile) {
                            const str = ide.FileUtils.getFileString(atlasFile);
                            const data = JSON.parse(str);
                            for (const texture of data.textures) {
                                const url = io.FilePath.join(atlasUrlParent, texture.image);
                                urlSet.add(url);
                            }
                            for (const url of urlSet) {
                                const file = this.getFileFromAssetUrl(url);
                                files.add(file);
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            core.MultiatlasAssetPackItem = MultiatlasAssetPackItem;
        })(core = pack_18.core || (pack_18.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_19) {
        var core;
        (function (core_2) {
            var controls = colibri.ui.controls;
            class PackFinder {
                constructor(...packs) {
                    this._packs = packs.filter(pack => pack !== null && pack !== undefined);
                }
                async preload(monitor) {
                    let result = controls.PreloadResult.NOTHING_LOADED;
                    this._packs = await core_2.AssetPackUtils.getAllPacks();
                    const items = this._packs.flatMap(pack => pack.getItems());
                    for (const item of items) {
                        const result2 = await item.preload();
                        result = Math.max(result, result2);
                        if (monitor) {
                            monitor.step();
                        }
                    }
                    return Promise.resolve(result);
                }
                getPacks() {
                    return this._packs;
                }
                getAssets(filter) {
                    return this.getPacks()
                        .flatMap(p => p.getItems())
                        .filter(i => !filter || filter(i));
                }
                findAssetPackItem(key) {
                    if (!key) {
                        return null;
                    }
                    return this._packs
                        .flatMap(pack => pack.getItems())
                        .find(item => item.getKey() === key);
                }
                findPackItemOrFrameWithKey(key) {
                    for (const pack of this._packs) {
                        for (const item of pack.getItems()) {
                            if (item.getKey() === key) {
                                return item;
                            }
                            if (item instanceof core_2.ImageFrameContainerAssetPackItem) {
                                for (const frame of item.getFrames()) {
                                    if (frame.getName() === key) {
                                        return frame;
                                    }
                                }
                            }
                        }
                    }
                    return null;
                }
                getAssetPackItemOrFrame(key, frame) {
                    const item = this.findAssetPackItem(key);
                    if (!item) {
                        return null;
                    }
                    if (item instanceof core_2.ImageAssetPackItem) {
                        return item;
                    }
                    else if (item instanceof core_2.ImageFrameContainerAssetPackItem) {
                        const imageFrame = item.findFrame(frame);
                        return imageFrame;
                    }
                    return item;
                }
                getAssetPackItemImage(key, frame) {
                    const asset = this.getAssetPackItemOrFrame(key, frame);
                    if (asset instanceof core_2.ImageAssetPackItem) {
                        return asset.getFrames()[0];
                    }
                    else if (asset instanceof core_2.AssetPackImageFrame) {
                        return asset;
                    }
                    return null;
                }
                async findPackItemsFor(file) {
                    const items = [];
                    for (const pack of this.getPacks()) {
                        for (const item of pack.getItems()) {
                            await item.preload();
                        }
                        for (const item of pack.getItems()) {
                            const files = new Set();
                            item.computeUsedFiles(files);
                            if (files.has(file)) {
                                items.push(item);
                            }
                        }
                    }
                    return items;
                }
            }
            core_2.PackFinder = PackFinder;
        })(core = pack_19.core || (pack_19.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_20) {
        var core;
        (function (core) {
            class PluginAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.PluginAssetPackItem = PluginAssetPackItem;
        })(core = pack_20.core || (pack_20.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_21) {
        var core;
        (function (core) {
            class SceneFileAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.SceneFileAssetPackItem = SceneFileAssetPackItem;
        })(core = pack_21.core || (pack_21.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_22) {
        var core;
        (function (core) {
            class ScenePluginAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.ScenePluginAssetPackItem = ScenePluginAssetPackItem;
        })(core = pack_22.core || (pack_22.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_23) {
        var core;
        (function (core) {
            class ScriptAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.ScriptAssetPackItem = ScriptAssetPackItem;
        })(core = pack_23.core || (pack_23.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_24) {
        var core;
        (function (core) {
            class ScriptsAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                getUrls() {
                    return this.getData().url;
                }
            }
            core.ScriptsAssetPackItem = ScriptsAssetPackItem;
        })(core = pack_24.core || (pack_24.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_25) {
        var core;
        (function (core) {
            class SpritesheetAssetPackItem extends core.ImageFrameContainerAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                getUrl() {
                    return this.getData().url;
                }
                createParser() {
                    return new core.parsers.SpriteSheetParser(this);
                }
            }
            core.SpritesheetAssetPackItem = SpritesheetAssetPackItem;
        })(core = pack_25.core || (pack_25.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_26) {
        var core;
        (function (core) {
            class SvgAssetPackItem extends core.ImageAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.SvgAssetPackItem = SvgAssetPackItem;
        })(core = pack_26.core || (pack_26.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_27) {
        var core;
        (function (core) {
            class TextAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.TextAssetPackItem = TextAssetPackItem;
        })(core = pack_27.core || (pack_27.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_28) {
        var core;
        (function (core) {
            class TilemapCSVAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.TilemapCSVAssetPackItem = TilemapCSVAssetPackItem;
        })(core = pack_28.core || (pack_28.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_29) {
        var core;
        (function (core) {
            class TilemapImpactAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.TilemapImpactAssetPackItem = TilemapImpactAssetPackItem;
        })(core = pack_29.core || (pack_29.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_30) {
        var core;
        (function (core) {
            class TilemapTiledJSONAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                    this._tilesetsData = [];
                }
                async preload() {
                    const tilesetsData = [];
                    const url = this.getUrl();
                    const file = this.getFileFromAssetUrl(url);
                    if (file) {
                        const result = await colibri.ui.ide.FileUtils.preloadFileString(file);
                        const str = colibri.ui.ide.FileUtils.getFileString(file);
                        const data = JSON.parse(str);
                        if (data.tilesets) {
                            for (const tilesetData of data.tilesets) {
                                tilesetsData.push({
                                    source: tilesetData.source,
                                    name: tilesetData.name,
                                    image: tilesetData.image
                                });
                            }
                        }
                        if (data.layers) {
                            this._layerNames = data.layers
                                .filter(layer => layer.name && layer.type === "tilelayer").map(layer => layer.name);
                        }
                        else {
                            this._layerNames = [];
                        }
                        this._tilesetsData = tilesetsData;
                        return result;
                    }
                    this._tilesetsData = tilesetsData;
                    return colibri.ui.controls.PreloadResult.NOTHING_LOADED;
                }
                getUrl() {
                    return this.getData()["url"];
                }
                getTilesetsData() {
                    return this._tilesetsData;
                }
                getLayerNames() {
                    return this._layerNames;
                }
                addToPhaserCache(game, cache) {
                    const file = this.getFileFromAssetUrl(this.getUrl());
                    if (file) {
                        const fileContent = colibri.ui.ide.FileUtils.getFileString(file);
                        const fileData = JSON.parse(fileContent);
                        const tileData = { format: Phaser.Tilemaps.Formats.TILED_JSON, data: fileData };
                        game.cache.tilemap.add(this.getKey(), tileData);
                    }
                    cache.addAsset(this);
                }
            }
            core.TilemapTiledJSONAssetPackItem = TilemapTiledJSONAssetPackItem;
        })(core = pack_30.core || (pack_30.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_31) {
        var core;
        (function (core) {
            class UnityAtlasAssetPackItem extends core.BaseAtlasAssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
                createParser() {
                    return new core.parsers.UnityAtlasParser(this);
                }
            }
            core.UnityAtlasAssetPackItem = UnityAtlasAssetPackItem;
        })(core = pack_31.core || (pack_31.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_32) {
        var core;
        (function (core) {
            class VideoAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.VideoAssetPackItem = VideoAssetPackItem;
        })(core = pack_32.core || (pack_32.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./AssetPackItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_33) {
        var core;
        (function (core) {
            class XMLAssetPackItem extends core.AssetPackItem {
                constructor(pack, data) {
                    super(pack, data);
                }
            }
            core.XMLAssetPackItem = XMLAssetPackItem;
        })(core = pack_33.core || (pack_33.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core_3) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                var core = colibri.core;
                contentTypes.CONTENT_TYPE_ASSET_PACK = "phasereditor2d.pack.core.AssetContentType";
                class AssetPackContentTypeResolver extends core.ContentTypeResolver {
                    constructor() {
                        super("phasereditor2d.pack.core.AssetPackContentTypeResolver");
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            if (content !== null) {
                                try {
                                    const data = JSON.parse(content);
                                    if (data.meta.contentType === contentTypes.CONTENT_TYPE_ASSET_PACK) {
                                        return contentTypes.CONTENT_TYPE_ASSET_PACK;
                                    }
                                }
                                catch (e) {
                                    // nothing
                                }
                            }
                        }
                        return core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.AssetPackContentTypeResolver = AssetPackContentTypeResolver;
            })(contentTypes = core_3.contentTypes || (core_3.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_ATLAS = "phasereditor2d.pack.core.atlas";
                class AtlasContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.atlasHashOrArray";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                if (data.hasOwnProperty("frames")) {
                                    const frames = data["frames"];
                                    if (typeof (frames) === "object") {
                                        return contentTypes.CONTENT_TYPE_ATLAS;
                                    }
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.AtlasContentTypeResolver = AtlasContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_ATLAS_XML = "phasereditor2d.pack.core.atlasXML";
                class AtlasXMLContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.atlasXML";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "xml") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(content, "text/xml");
                            const elements = xmlDoc.getElementsByTagName("TextureAtlas");
                            if (elements.length === 1) {
                                return contentTypes.CONTENT_TYPE_ATLAS_XML;
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.AtlasXMLContentTypeResolver = AtlasXMLContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_AUDIO_SPRITE = "phasereditor2d.pack.core.audioSprite";
                class AudioSpriteContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.contentTypes.AudioSpriteContentTypeResolver";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                if (Array.isArray(data.resources) && typeof (data.spritemap) === "object") {
                                    return contentTypes.CONTENT_TYPE_AUDIO_SPRITE;
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.AudioSpriteContentTypeResolver = AudioSpriteContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_BITMAP_FONT = "phasereditor2d.pack.core.bitmapFont";
                class BitmapFontContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.BitmapFontContentTypeResolver";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "xml") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(content, "text/xml");
                            const fontElements = xmlDoc.getElementsByTagName("font");
                            const charsElements = xmlDoc.getElementsByTagName("chars");
                            if (fontElements.length === 1 && charsElements.length === 1) {
                                return contentTypes.CONTENT_TYPE_BITMAP_FONT;
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.BitmapFontContentTypeResolver = BitmapFontContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_MULTI_ATLAS = "phasereditor2d.pack.core.multiAtlas";
                class MultiatlasContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.atlasHashOrArray";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                if (data.hasOwnProperty("textures")) {
                                    const frames = data["textures"];
                                    if (typeof (frames) === "object") {
                                        return contentTypes.CONTENT_TYPE_MULTI_ATLAS;
                                    }
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.MultiatlasContentTypeResolver = MultiatlasContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_TILEMAP_IMPACT = "phasereditor2d.pack.core.contentTypes.tilemapImpact";
                class TilemapImpactContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.contentTypes.TilemapImpactContentTypeResolver";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                if (Array.isArray(data.entities) && Array.isArray(data.layer)) {
                                    return contentTypes.CONTENT_TYPE_TILEMAP_IMPACT;
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.TilemapImpactContentTypeResolver = TilemapImpactContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                var ide = colibri.ui.ide;
                contentTypes.CONTENT_TYPE_TILEMAP_TILED_JSON = "phasereditor2d.pack.core.contentTypes.tilemapTiledJSON";
                class TilemapTiledJSONContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.contentTypes.TilemapTiledJSONContentTypeResolver";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "json") {
                            const content = await ide.FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                if (Array.isArray(data.layers)
                                    && Array.isArray(data.tilesets)
                                    && typeof (data.tilewidth === "number")
                                    && typeof (data.tileheight)) {
                                    return contentTypes.CONTENT_TYPE_TILEMAP_TILED_JSON;
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.TilemapTiledJSONContentTypeResolver = TilemapTiledJSONContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var contentTypes;
            (function (contentTypes) {
                contentTypes.CONTENT_TYPE_UNITY_ATLAS = "phasereditor2d.pack.core.unityAtlas";
                class UnityAtlasContentTypeResolver {
                    getId() {
                        return "phasereditor2d.pack.core.unityAtlas";
                    }
                    async computeContentType(file) {
                        if (file.getExtension() === "meta") {
                            return contentTypes.CONTENT_TYPE_UNITY_ATLAS;
                        }
                        return colibri.core.CONTENT_TYPE_ANY;
                    }
                }
                contentTypes.UnityAtlasContentTypeResolver = UnityAtlasContentTypeResolver;
            })(contentTypes = core.contentTypes || (core.contentTypes = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                class AssetPackCache {
                    constructor() {
                        this._imageMap = new Map();
                        this._spriteSheetMap = new Map();
                        this._assets = new Set();
                    }
                    clear() {
                        this._imageMap.clear();
                        this._spriteSheetMap.clear();
                    }
                    addAsset(asset) {
                        this._assets.add(asset);
                    }
                    getAssets() {
                        return this._assets;
                    }
                    addImage(image, key, frame) {
                        const mapKey = this.getImageMapKey(key, frame);
                        this._imageMap.set(mapKey, image);
                    }
                    getImage(key, frame) {
                        const mapKey = this.getImageMapKey(key, frame);
                        return this._imageMap.get(mapKey);
                    }
                    addSpritesheetImage(image, key) {
                        this._spriteSheetMap.set(key, image);
                    }
                    getSpritesheetImage(key) {
                        return this._spriteSheetMap.get(key);
                    }
                    getImageMapKey(key, frame) {
                        return key + "$" + (frame === null || frame === undefined ? "." : frame);
                    }
                    buildAssetsDependenciesHash(builder) {
                        const files = new Set();
                        for (const asset of this.getAssets()) {
                            files.add(asset.getPack().getFile());
                            asset.computeUsedFiles(files);
                        }
                        for (const file of files) {
                            builder.addPartialFileToken(file);
                        }
                    }
                }
                parsers.AssetPackCache = AssetPackCache;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                class ImageFrameParser {
                    constructor(packItem) {
                        this._packItem = packItem;
                    }
                    getPackItem() {
                        return this._packItem;
                    }
                }
                parsers.ImageFrameParser = ImageFrameParser;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./ImageFrameParser.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                var ide = colibri.ui.ide;
                class BaseAtlasParser extends parsers.ImageFrameParser {
                    constructor(packItem, preloadImageSize) {
                        super(packItem);
                        this._preloadImageSize = preloadImageSize;
                    }
                    addToPhaserCache(game, cache) {
                        const item = this.getPackItem();
                        cache.addAsset(item);
                        if (!game.textures.exists(item.getKey())) {
                            const atlasURL = item.getData().atlasURL;
                            const atlasData = core.AssetPackUtils.getFileJSONFromPackUrl(item.getPack(), atlasURL);
                            const textureURL = item.getData().textureURL;
                            const image = core.AssetPackUtils.getImageFromPackUrl(item.getPack(), textureURL);
                            if (image) {
                                game.textures.addAtlas(item.getKey(), image.getImageElement(), atlasData);
                                for (const frame of item.getFrames()) {
                                    cache.addImage(frame, item.getKey(), frame.getName());
                                }
                            }
                        }
                    }
                    async preloadFrames() {
                        const item = this.getPackItem();
                        const data = item.getData();
                        const dataFile = item.getFileFromAssetUrl(data.atlasURL);
                        if (!dataFile) {
                            return controls.Controls.resolveNothingLoaded();
                        }
                        let result1 = await ide.FileUtils.preloadFileString(dataFile);
                        const imageFile = item.getFileFromAssetUrl(data.textureURL);
                        if (this._preloadImageSize) {
                            const result2 = await ide.FileUtils.preloadImageSize(imageFile);
                            result1 = Math.max(result1, result2);
                        }
                        return result1;
                    }
                    parseFrames() {
                        const list = [];
                        const item = this.getPackItem();
                        const data = item.getData();
                        const dataFile = item.getFileFromAssetUrl(data.atlasURL);
                        const imageFile = item.getFileFromAssetUrl(data.textureURL);
                        const image = ide.FileUtils.getImage(imageFile);
                        if (dataFile) {
                            const str = ide.FileUtils.getFileString(dataFile);
                            try {
                                this.parseFrames2(list, image, str);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                        BaseAtlasParser.sortFrames(list);
                        return list;
                    }
                    static sortFrames(frames) {
                        frames.sort((a, b) => {
                            return a.getName().localeCompare(b.getName());
                        });
                    }
                }
                parsers.BaseAtlasParser = BaseAtlasParser;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasParser.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                class AtlasParser extends parsers.BaseAtlasParser {
                    constructor(packItem) {
                        super(packItem, false);
                    }
                    parseFrames2(imageFrames, image, atlas) {
                        try {
                            const data = JSON.parse(atlas);
                            if (data) {
                                if (Array.isArray(data.frames)) {
                                    for (const frame of data.frames) {
                                        const frameData = AtlasParser.buildFrameData(this.getPackItem(), image, frame, imageFrames.length);
                                        imageFrames.push(frameData);
                                    }
                                }
                                else {
                                    for (const name in data.frames) {
                                        if (data.frames.hasOwnProperty(name)) {
                                            const frame = data.frames[name];
                                            frame.filename = name;
                                            const frameData = AtlasParser.buildFrameData(this.getPackItem(), image, frame, imageFrames.length);
                                            imageFrames.push(frameData);
                                        }
                                    }
                                }
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                    static buildFrameData(packItem, image, frame, index) {
                        const src = new controls.Rect(frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h);
                        const dst = new controls.Rect(frame.spriteSourceSize.x, frame.spriteSourceSize.y, frame.spriteSourceSize.w, frame.spriteSourceSize.h);
                        const srcSize = new controls.Point(frame.sourceSize.w, frame.sourceSize.h);
                        const frameData = new controls.FrameData(index, src, dst, srcSize);
                        return new core.AssetPackImageFrame(packItem, frame.filename, image, frameData);
                    }
                }
                parsers.AtlasParser = AtlasParser;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasParser.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core_4) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                class AtlasXMLParser extends parsers.BaseAtlasParser {
                    constructor(packItem) {
                        super(packItem, false);
                    }
                    addToPhaserCache(game, cache) {
                        const item = this.getPackItem();
                        cache.addAsset(item);
                        if (!game.textures.exists(item.getKey())) {
                            const atlasURL = item.getData().atlasURL;
                            const atlasData = core_4.AssetPackUtils.getFileXMLFromPackUrl(item.getPack(), atlasURL);
                            const textureURL = item.getData().textureURL;
                            const image = core_4.AssetPackUtils.getImageFromPackUrl(item.getPack(), textureURL);
                            if (atlasData && image) {
                                game.textures.addAtlasXML(item.getKey(), image.getImageElement(), atlasData);
                                for (const frame of item.getFrames()) {
                                    cache.addImage(frame, item.getKey(), frame.getName());
                                }
                            }
                        }
                    }
                    parseFrames2(imageFrames, image, atlas) {
                        try {
                            const parser = new DOMParser();
                            const data = parser.parseFromString(atlas, "text/xml");
                            const elements = data.getElementsByTagName("SubTexture");
                            for (let i = 0; i < elements.length; i++) {
                                const elem = elements.item(i);
                                const name = elem.getAttribute("name");
                                const frameX = Number.parseInt(elem.getAttribute("x"), 10);
                                const frameY = Number.parseInt(elem.getAttribute("y"), 10);
                                const frameW = Number.parseInt(elem.getAttribute("width"), 10);
                                const frameH = Number.parseInt(elem.getAttribute("height"), 10);
                                let spriteX = frameX;
                                let spriteY = frameY;
                                let spriteW = frameW;
                                let spriteH = frameH;
                                if (elem.hasAttribute("frameX")) {
                                    spriteX = Number.parseInt(elem.getAttribute("frameX"), 10);
                                    spriteY = Number.parseInt(elem.getAttribute("frameY"), 10);
                                    spriteW = Number.parseInt(elem.getAttribute("frameWidth"), 10);
                                    spriteH = Number.parseInt(elem.getAttribute("frameHeight"), 10);
                                }
                                const fd = new controls.FrameData(i, new controls.Rect(frameX, frameY, frameW, frameH), new controls.Rect(spriteX, spriteY, spriteW, spriteH), new controls.Point(frameW, frameH));
                                imageFrames.push(new core_4.AssetPackImageFrame(this.getPackItem(), name, image, fd));
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
                parsers.AtlasXMLParser = AtlasXMLParser;
            })(parsers = core_4.parsers || (core_4.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                class ImageParser extends parsers.ImageFrameParser {
                    constructor(packItem) {
                        super(packItem);
                    }
                    addToPhaserCache(game, cache) {
                        const item = this.getPackItem();
                        cache.addAsset(item);
                        if (!game.textures.exists(item.getKey())) {
                            const url = item.getData().url;
                            const image = core.AssetPackUtils.getImageFromPackUrl(item.getPack(), url);
                            if (image) {
                                game.textures.addImage(item.getKey(), image.getImageElement());
                                cache.addImage(image, item.getKey());
                            }
                        }
                    }
                    async preloadFrames() {
                        const item = this.getPackItem();
                        const url = item.getData().url;
                        const img = core.AssetPackUtils.getImageFromPackUrl(item.getPack(), url);
                        if (img) {
                            return await img.preloadSize();
                        }
                        return controls.Controls.resolveNothingLoaded();
                    }
                    parseFrames() {
                        const item = this.getPackItem();
                        const url = item.getData().url;
                        const img = core.AssetPackUtils.getImageFromPackUrl(item.getPack(), url);
                        let fd;
                        if (img) {
                            fd = new controls.FrameData(0, new controls.Rect(0, 0, img.getWidth(), img.getHeight()), new controls.Rect(0, 0, img.getWidth(), img.getHeight()), new controls.Point(img.getWidth(), img.getWidth()));
                        }
                        else {
                            fd = new controls.FrameData(0, new controls.Rect(0, 0, 10, 10), new controls.Rect(0, 0, 10, 10), new controls.Point(10, 10));
                        }
                        return [new core.AssetPackImageFrame(this.getPackItem(), this.getPackItem().getKey(), img, fd)];
                    }
                }
                parsers.ImageParser = ImageParser;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core_5) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                var ide = colibri.ui.ide;
                class MultiAtlasParser extends parsers.ImageFrameParser {
                    constructor(packItem) {
                        super(packItem);
                    }
                    addToPhaserCache(game, cache) {
                        const item = this.getPackItem();
                        cache.addAsset(item);
                        if (!game.textures.exists(item.getKey())) {
                            const packItemData = item.getData();
                            const atlasDataFile = item.getFileFromAssetUrl(packItemData.url);
                            const atlasData = core_5.AssetPackUtils.getFileJSONFromPackUrl(item.getPack(), packItemData.url);
                            if (atlasData && atlasDataFile) {
                                const images = [];
                                const jsonArrayData = [];
                                for (const textureData of atlasData.textures) {
                                    const imageName = textureData.image;
                                    const imageFile = atlasDataFile.getSibling(imageName);
                                    const image = ide.FileUtils.getImage(imageFile);
                                    images.push(image.getImageElement());
                                    jsonArrayData.push(textureData);
                                }
                                game.textures.addAtlasJSONArray(this.getPackItem().getKey(), images, jsonArrayData);
                                for (const frame of item.getFrames()) {
                                    cache.addImage(frame, item.getKey(), frame.getName());
                                }
                            }
                        }
                    }
                    async preloadFrames() {
                        const item = this.getPackItem();
                        const data = item.getData();
                        const dataFile = item.getFileFromAssetUrl(data.url);
                        if (dataFile) {
                            return await ide.FileUtils.preloadFileString(dataFile);
                        }
                        return controls.Controls.resolveNothingLoaded();
                    }
                    parseFrames() {
                        const list = [];
                        const item = this.getPackItem();
                        const data = item.getData();
                        const dataFile = item.getFileFromAssetUrl(data.url);
                        if (dataFile) {
                            const str = ide.FileUtils.getFileString(dataFile);
                            try {
                                const data2 = JSON.parse(str);
                                if (data2.textures) {
                                    for (const textureData of data2.textures) {
                                        const imageName = textureData.image;
                                        const imageFile = dataFile.getSibling(imageName);
                                        const image = ide.FileUtils.getImage(imageFile);
                                        for (const frame of textureData.frames) {
                                            const frameData = parsers.AtlasParser
                                                .buildFrameData(this.getPackItem(), image, frame, list.length);
                                            list.push(frameData);
                                        }
                                    }
                                }
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                        parsers.BaseAtlasParser.sortFrames(list);
                        return list;
                    }
                }
                parsers.MultiAtlasParser = MultiAtlasParser;
            })(parsers = core_5.parsers || (core_5.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasParser.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                var ide = colibri.ui.ide;
                class SpriteSheetParser extends parsers.ImageFrameParser {
                    constructor(packItem) {
                        super(packItem);
                    }
                    addToPhaserCache(game, cache) {
                        const item = this.getPackItem();
                        cache.addAsset(item);
                        if (!game.textures.exists(item.getKey())) {
                            const data = item.getData();
                            const image = core.AssetPackUtils.getImageFromPackUrl(item.getPack(), data.url);
                            if (image) {
                                game.textures.addSpriteSheet(item.getKey(), image.getImageElement(), data.frameConfig);
                                cache.addSpritesheetImage(image, item.getKey());
                                for (const frame of item.getFrames()) {
                                    cache.addImage(frame, item.getKey(), frame.getName());
                                }
                            }
                        }
                    }
                    async preloadFrames() {
                        const item = this.getPackItem();
                        const data = item.getData();
                        const imageFile = item.getFileFromAssetUrl(data.url);
                        if (!imageFile) {
                            return controls.Controls.resolveNothingLoaded();
                        }
                        const image = ide.FileUtils.getImage(imageFile);
                        if (!image) {
                            return controls.Controls.resolveNothingLoaded();
                        }
                        return await image.preloadSize();
                    }
                    parseFrames() {
                        const frames = [];
                        const item = this.getPackItem();
                        const data = item.getData();
                        const imageFile = item.getFileFromAssetUrl(data.url);
                        const image = ide.FileUtils.getImage(imageFile);
                        if (!image) {
                            return frames;
                        }
                        const w = data.frameConfig.frameWidth;
                        const h = data.frameConfig.frameHeight;
                        const margin = data.frameConfig.margin || 0;
                        const spacing = data.frameConfig.spacing || 0;
                        const startFrame = data.frameConfig.startFrame || 0;
                        const endFrame = data.frameConfig.endFrame || -1;
                        if (w <= 0 || h <= 0 || spacing < 0 || margin < 0) {
                            // invalid values
                            return frames;
                        }
                        const start = startFrame < 0 ? 0 : startFrame;
                        const end = endFrame < 0 ? Number.MAX_VALUE : endFrame;
                        let i = 0;
                        // let row = 0;
                        // let column = 0;
                        let x = margin;
                        let y = margin;
                        const imageHeight = image.getHeight();
                        const imageWidth = image.getWidth();
                        while (true) {
                            if (i > end || y >= imageHeight || i > 1000) {
                                break;
                            }
                            if (x + w + spacing <= imageWidth) {
                                if (i >= start) {
                                    const fd = new controls.FrameData(i, new controls.Rect(x, y, w, h), new controls.Rect(0, 0, w, h), new controls.Point(w, h));
                                    frames.push(new core.AssetPackImageFrame(this.getPackItem(), i, image, fd));
                                }
                                i++;
                            }
                            x += w + spacing;
                            if (x >= imageWidth) {
                                x = margin;
                                y += h + spacing;
                            }
                        }
                        return frames;
                    }
                }
                parsers.SpriteSheetParser = SpriteSheetParser;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var core;
        (function (core) {
            var parsers;
            (function (parsers) {
                var controls = colibri.ui.controls;
                class UnityAtlasParser extends parsers.BaseAtlasParser {
                    constructor(packItem) {
                        super(packItem, true);
                    }
                    addToPhaserCache(game, cache) {
                        const item = this.getPackItem();
                        cache.addAsset(item);
                        if (!game.textures.exists(item.getKey())) {
                            const atlasURL = item.getData().atlasURL;
                            const atlasData = core.AssetPackUtils.getFileStringFromPackUrl(item.getPack(), atlasURL);
                            const textureURL = item.getData().textureURL;
                            const image = core.AssetPackUtils.getImageFromPackUrl(item.getPack(), textureURL);
                            if (image && atlasData) {
                                game.textures.addUnityAtlas(item.getKey(), image.getImageElement(), atlasData);
                                for (const frame of item.getFrames()) {
                                    cache.addImage(frame, item.getKey(), frame.getName());
                                }
                            }
                        }
                    }
                    parseFrames2(imageFrames, image, atlas) {
                        // Taken from Phaser code.
                        const data = atlas.split("\n");
                        const lineRegExp = /^[ ]*(- )*(\w+)+[: ]+(.*)/;
                        let prevSprite = "";
                        let currentSprite = "";
                        let rect = { x: 0, y: 0, width: 0, height: 0 };
                        // const pivot = { x: 0, y: 0 };
                        // const border = { x: 0, y: 0, z: 0, w: 0 };
                        // tslint:disable-next-line:prefer-for-of
                        for (let i = 0; i < data.length; i++) {
                            const results = data[i].match(lineRegExp);
                            if (!results) {
                                continue;
                            }
                            const isList = (results[1] === "- ");
                            const key = results[2];
                            const value = results[3];
                            if (isList) {
                                if (currentSprite !== prevSprite) {
                                    this.addFrame(image, imageFrames, currentSprite, rect);
                                    prevSprite = currentSprite;
                                }
                                rect = { x: 0, y: 0, width: 0, height: 0 };
                            }
                            if (key === "name") {
                                //  Start new list
                                currentSprite = value;
                                continue;
                            }
                            switch (key) {
                                case "x":
                                case "y":
                                case "width":
                                case "height":
                                    rect[key] = parseInt(value, 10);
                                    break;
                                // case 'pivot':
                                //     pivot = eval('const obj = ' + value);
                                //     break;
                                // case 'border':
                                //     border = eval('const obj = ' + value);
                                //     break;
                            }
                        }
                        if (currentSprite !== prevSprite) {
                            this.addFrame(image, imageFrames, currentSprite, rect);
                        }
                    }
                    addFrame(image, imageFrames, spriteName, rect) {
                        if (!image) {
                            return;
                        }
                        const src = new controls.Rect(rect.x, rect.y, rect.width, rect.height);
                        src.y = image.getHeight() - src.y - src.h;
                        const dst = new controls.Rect(0, 0, rect.width, rect.height);
                        const srcSize = new controls.Point(rect.width, rect.height);
                        const fd = new controls.FrameData(imageFrames.length, src, dst, srcSize);
                        imageFrames.push(new core.AssetPackImageFrame(this.getPackItem(), spriteName, image, fd));
                    }
                }
                parsers.UnityAtlasParser = UnityAtlasParser;
            })(parsers = core.parsers || (core.parsers = {}));
        })(core = pack.core || (pack.core = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/*

TextureImporter:
  spritePivot: {x: .5, y: .5}
  spriteBorder: {x: 0, y: 0, z: 0, w: 0}
  spritePixelsToUnits: 100
  spriteSheet:
    sprites:
    - name: asteroids_0
      rect:
        serializedVersion: 2
        x: 5
        y: 328
        width: 65
        height: 82
      alignment: 0
      pivot: {x: 0, y: 0}
      border: {x: 0, y: 0, z: 0, w: 0}
    - name: asteroids_1
      rect:
        serializedVersion: 2
        x: 80
        y: 322
        width: 53
        height: 88
      alignment: 0
      pivot: {x: 0, y: 0}
      border: {x: 0, y: 0, z: 0, w: 0}
  spritePackingTag: Asteroids

  */ 
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                var controls = colibri.ui.controls;
                class AssetSelectionDialog extends controls.dialogs.ViewerDialog {
                    constructor(layout = "grid") {
                        super(new controls.viewers.TreeViewer("phasereditor2d.pack.ui.dialogs.AssetSelectionDialog"), true);
                        this._viewerLayout = layout;
                        const size = this.getSize();
                        this.setSize(size.width, size.height * 1.5);
                    }
                    setSelectionCallback(callback) {
                        this._selectionCallback = callback;
                    }
                    setCancelCallback(callback) {
                        this._cancelCallback = callback;
                    }
                    async getResultPromise() {
                        const promise = new Promise((resolve, reject) => {
                            this.setSelectionCallback((sel) => {
                                resolve(sel);
                            });
                            this.setCancelCallback(() => {
                                reject();
                            });
                        });
                        return promise;
                    }
                    async getSingleResultPromise() {
                        const sel = await this.getResultPromise();
                        return sel[0];
                    }
                    create(hideParentDialog = true) {
                        const viewer = this.getViewer();
                        viewer.setLabelProvider(new pack.ui.viewers.AssetPackLabelProvider());
                        if (this._viewerLayout === "tree") {
                            viewer.setTreeRenderer(new controls.viewers.GridTreeViewerRenderer(viewer));
                        }
                        else {
                            const renderer = new controls.viewers.GridTreeViewerRenderer(viewer, false, true);
                            renderer.setPaintItemShadow(true);
                            viewer.setTreeRenderer(renderer);
                        }
                        viewer.setCellRendererProvider(new pack.ui.viewers.AssetPackCellRendererProvider(this._viewerLayout));
                        viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                        viewer.setCellSize(64 * controls.DEVICE_PIXEL_RATIO, true);
                        viewer.setInput([]);
                        super.create(hideParentDialog);
                        this.setTitle("Select Asset");
                        this.enableButtonOnlyWhenOneElementIsSelected(this.addOpenButton("Select", sel => {
                            if (this._selectionCallback) {
                                this._selectionCallback(sel);
                            }
                        }));
                        this.addButton("Cancel", () => {
                            this.close();
                            if (this._cancelCallback) {
                                this._cancelCallback();
                            }
                        });
                    }
                }
                dialogs.AssetSelectionDialog = AssetSelectionDialog;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                class NewAssetPackFileWizardExtension extends phasereditor2d.files.ui.dialogs.NewFileContentExtension {
                    constructor() {
                        super({
                            dialogName: "Asset Pack File",
                            dialogIconDescriptor: pack.AssetPackPlugin.getInstance().getIconDescriptor(pack.ICON_ASSET_PACK),
                            initialFileName: "asset-pack",
                            fileExtension: "json"
                        });
                    }
                    getCreateFileContentFunc() {
                        return (args) => JSON.stringify({
                            section1: {
                                files: []
                            },
                            meta: {
                                app: "Phaser Editor 2D - Asset Pack Editor",
                                url: "https://phasereditor2d.com",
                                contentType: pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK,
                                version: 2
                            }
                        });
                    }
                    getInitialFileLocation() {
                        return super.findInitialFileLocationBasedOnContentType(pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK);
                    }
                }
                dialogs.NewAssetPackFileWizardExtension = NewAssetPackFileWizardExtension;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var ide = colibri.ui.ide;
                var controls = colibri.ui.controls;
                var dialogs = controls.dialogs;
                class AssetPackEditor extends ide.ViewerFileEditor {
                    constructor() {
                        super("phasereditor2d.pack.ui.AssetPackEditor", AssetPackEditor.getFactory());
                        this._outlineProvider = new editor.AssetPackEditorOutlineProvider(this);
                        this._blocksProvider = new editor.AssetPackEditorBlocksProvider(this);
                        this._propertyProvider = new editor.properties.AssetPackEditorPropertyProvider(this);
                        this.addClass("AssetPackEditor");
                    }
                    static getFactory() {
                        return this._factory
                            || (this._factory = new ide.ContentTypeEditorFactory("Asset Pack Editor", pack.core.contentTypes.CONTENT_TYPE_ASSET_PACK, () => new AssetPackEditor()));
                    }
                    fillContextMenu(menu) {
                        menu.addCommand(pack.CMD_ASSET_PACK_EDITOR_ADD_FILE);
                        menu.addCommand(ide.actions.CMD_DELETE);
                        menu.addAction({
                            text: "Settings",
                            callback: () => {
                                this.getViewer().setSelection([]);
                            }
                        });
                    }
                    static isEditorScope(args) {
                        return args.activePart instanceof AssetPackEditor ||
                            args.activePart instanceof phasereditor2d.outline.ui.views.OutlineView
                                && args.activeEditor instanceof AssetPackEditor;
                    }
                    deleteSelection() {
                        const toDelete = this._viewer.getSelection().filter(obj => obj instanceof pack.core.AssetPackItem);
                        if (toDelete.length === 0) {
                            return;
                        }
                        const before = editor.undo.AssetPackEditorOperation.takeSnapshot(this);
                        for (const obj of toDelete) {
                            this._pack.deleteItem(obj);
                        }
                        const after = editor.undo.AssetPackEditorOperation.takeSnapshot(this);
                        this.getUndoManager().add(new editor.undo.AssetPackEditorOperation(this, before, after));
                        this.updateAll();
                        this.setDirty(true);
                    }
                    updateAll() {
                        this.repaintEditorAndOutline();
                        this._blocksProvider.updateBlocks_async();
                        this.setSelection([]);
                    }
                    repaintEditorAndOutline() {
                        this._viewer.repaint();
                        this._outlineProvider.repaint();
                    }
                    createViewer() {
                        const viewer = new controls.viewers.TreeViewer("phasereditor2d.pack.ui.editor.AssetPackEditor");
                        viewer.setContentProvider(new editor.AssetPackEditorContentProvider(this));
                        viewer.setLabelProvider(new ui.viewers.AssetPackLabelProvider());
                        viewer.setCellRendererProvider(new ui.viewers.AssetPackCellRendererProvider("grid"));
                        const treeRenderer = new editor.AssetPackEditorTreeViewerRenderer(this, viewer);
                        viewer.setTreeRenderer(treeRenderer);
                        viewer.setCellSize(96 * controls.DEVICE_PIXEL_RATIO);
                        viewer.setInput(this);
                        viewer.eventSelectionChanged.addListener(() => {
                            this._outlineProvider.setSelection(viewer.getSelection(), true, false);
                            this._outlineProvider.repaint();
                        });
                        return viewer;
                    }
                    createPart() {
                        super.createPart();
                        this.updateContent();
                        this.getViewer().expandRoots();
                    }
                    async updateContent() {
                        const file = this.getInput();
                        if (!file) {
                            return;
                        }
                        if (!this.getViewer()) {
                            return;
                        }
                        const content = await ide.FileUtils.preloadAndGetFileString(file);
                        this._pack = new pack.core.AssetPack(file, content);
                        this.getViewer().repaint();
                        await this.updateBlocks();
                        if (this._revealKey) {
                            this.revealKeyNow(this._revealKey);
                            this._revealKey = null;
                        }
                        this.setSelection(this.getSelection());
                    }
                    async doSave() {
                        const content = JSON.stringify(this._pack.toJSON(), null, 4);
                        try {
                            await ide.FileUtils.setFileString_async(this.getInput(), content);
                            this.setDirty(false);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                    revealKey(key) {
                        if (!this._pack) {
                            this._revealKey = key;
                        }
                        else {
                            this.revealKeyNow(key);
                        }
                    }
                    revealKeyNow(key) {
                        const item = this._pack.getItems().find(i => i.getKey() === key);
                        if (item) {
                            this.getViewer().setSelection([item]);
                            this.getViewer().reveal(item);
                        }
                    }
                    onEditorInputContentChangedByExternalEditor() {
                        this.updateContent();
                    }
                    async onPartActivated() {
                        super.onPartActivated();
                        await this.resetPackCache();
                        await this.updateBlocks();
                    }
                    async resetPackCache() {
                        if (!this._pack) {
                            return;
                        }
                        for (const item of this._pack.getItems()) {
                            item.resetCache();
                            await item.preload();
                        }
                        this._viewer.repaint();
                    }
                    getPack() {
                        return this._pack;
                    }
                    getEditorViewerProvider(key) {
                        switch (key) {
                            case phasereditor2d.outline.ui.views.OutlineView.EDITOR_VIEWER_PROVIDER_KEY:
                                return this._outlineProvider;
                            case phasereditor2d.blocks.ui.views.BlocksView.EDITOR_VIEWER_PROVIDER_KEY:
                                return this._blocksProvider;
                        }
                        return null;
                    }
                    getPropertyProvider() {
                        return this._propertyProvider;
                    }
                    createEditorToolbar(parent) {
                        const manager = new controls.ToolbarManager(parent);
                        manager.addAction({
                            text: "Add File",
                            icon: colibri.ColibriPlugin.getInstance().getIcon(colibri.ICON_PLUS),
                            callback: () => this.openAddFileDialog()
                        });
                        return manager;
                    }
                    openAddFileDialog() {
                        const viewer = new controls.viewers.TreeViewer("phasereditor2d.pack.ui.editor.AssetPackEditor.AddFileDialog");
                        viewer.setLabelProvider(new ui.viewers.AssetPackLabelProvider());
                        viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                        viewer.setCellRendererProvider(new ui.viewers.AssetPackCellRendererProvider("tree"));
                        viewer.setInput(pack.core.TYPES);
                        const dlg = new dialogs.ViewerDialog(viewer, false);
                        const selectCallback = async () => {
                            const type = viewer.getSelection()[0];
                            await this.openSelectFileDialog_async(type);
                        };
                        dlg.create();
                        dlg.setTitle("Select File Type");
                        {
                            const btn = dlg.addButton("Select", selectCallback);
                            btn.disabled = true;
                            viewer.eventSelectionChanged.addListener(() => {
                                btn.disabled = viewer.getSelection().length === 0;
                            });
                        }
                        dlg.addButton("Cancel", () => {
                            dlg.close();
                        });
                        viewer.eventOpenItem.addListener(() => selectCallback());
                    }
                    async createFilesViewer(filter) {
                        const viewer = new controls.viewers.TreeViewer(this.getId() + ".AssetPackEditor");
                        viewer.setLabelProvider(new phasereditor2d.files.ui.viewers.FileLabelProvider());
                        viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                        viewer.setCellRendererProvider(new phasereditor2d.files.ui.viewers.FileCellRendererProvider());
                        const ignoreFileSet = new editor.IgnoreFileSet(this);
                        await ignoreFileSet.updateIgnoreFileSet_async();
                        const folder = this.getInput().getParent();
                        const allFiles = folder.flatTree([], false);
                        const list = allFiles
                            .filter(file => !ignoreFileSet.has(file) && filter(file));
                        viewer.setInput(list);
                        return viewer;
                    }
                    async openSelectFileDialog_async(type) {
                        const importer = ui.importers.Importers.getImporter(type);
                        const viewer = await this.createFilesViewer(file => importer.acceptFile(file));
                        const dlg = new dialogs.ViewerDialog(viewer, true);
                        dlg.create();
                        dlg.setTitle("Select Files");
                        const importFilesCallback = async (files) => {
                            dlg.closeAll();
                            await this.importData_async({
                                importer: importer,
                                files: files
                            });
                        };
                        {
                            const btn = dlg.addButton("Select", () => {
                                importFilesCallback(viewer.getSelection());
                            });
                            btn.disabled = true;
                            viewer.eventSelectionChanged.addListener(() => {
                                btn.disabled = viewer.getSelection().length === 0;
                            });
                        }
                        dlg.addButton("Show All Files", () => {
                            const input = this.getPack().isShowAllFilesInBlocks ?
                                colibri.Platform.getWorkbench().getProjectRoot() :
                                this.getInput().getParent();
                            viewer.setInput(input.flatTree([], false));
                            viewer.repaint();
                        });
                        dlg.addButton("Cancel", () => {
                            dlg.close();
                        });
                        viewer.eventOpenItem.addListener(async () => {
                            importFilesCallback([viewer.getSelection()[0]]);
                        });
                    }
                    async importData_async(importData) {
                        const before = editor.undo.AssetPackEditorOperation.takeSnapshot(this);
                        const items = await importData.importer.autoImport(this._pack, importData.files);
                        for (const item of items) {
                            await item.preload();
                        }
                        this._viewer.repaint();
                        this.setDirty(true);
                        await this.updateBlocks();
                        this._viewer.setSelection(items);
                        this._viewer.reveal(...items);
                        const after = editor.undo.AssetPackEditorOperation.takeSnapshot(this);
                        this.getUndoManager().add(new editor.undo.AssetPackEditorOperation(this, before, after));
                    }
                    async updateBlocks() {
                        if (!this._pack) {
                            return;
                        }
                        await this._blocksProvider.updateBlocks_async();
                    }
                }
                editor.AssetPackEditor = AssetPackEditor;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_34) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_1) {
                var io = colibri.core.io;
                class AssetPackEditorBlocksContentProvider extends phasereditor2d.files.ui.viewers.FileTreeContentProvider {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                        this._ignoreFileSet = new editor_1.IgnoreFileSet(editor);
                    }
                    getIgnoreFileSet() {
                        return this._ignoreFileSet;
                    }
                    async updateIgnoreFileSet_async() {
                        await this._ignoreFileSet.updateIgnoreFileSet_async();
                    }
                    getFolders(parent, folders) {
                        for (const file of parent.getFiles()) {
                            if (file.isFile() && this.acceptFile(file)) {
                                if (folders.indexOf(parent) < 0) {
                                    folders.push(parent);
                                    break;
                                }
                            }
                            this.getFolders(file, folders);
                        }
                    }
                    getRoots(input) {
                        const pack = this._editor.getPack();
                        if (pack && pack.isShowAllFilesInBlocks()) {
                            input = colibri.Platform.getWorkbench().getFileStorage().getRoot();
                        }
                        const folders = [];
                        if (input instanceof io.FilePath && input.isFolder()) {
                            folders.push(input);
                        }
                        const roots = super.getRoots(input);
                        for (const file of roots) {
                            this.getFolders(file, folders);
                        }
                        return folders;
                    }
                    getChildren(parent) {
                        return super.getChildren(parent)
                            .filter(obj => this.acceptFile(obj));
                    }
                    acceptFile(parent) {
                        if (parent.isFile() && !this._ignoreFileSet.has(parent)) {
                            // TODO: we should create an extension point to know
                            // what files are created by the editor and are not
                            // intended to be imported in the asset pack.
                            if (parent.getExtension() === "scene" || parent.getExtension() === "components") {
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }
                }
                editor_1.AssetPackEditorBlocksContentProvider = AssetPackEditorBlocksContentProvider;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack_34.ui || (pack_34.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                class AssetPackEditorBlocksPropertySectionProvider extends phasereditor2d.files.ui.views.FilePropertySectionProvider {
                    addSections(page, sections) {
                        sections.push(new editor.ImportFileSection(page));
                        super.addSections(page, sections);
                    }
                    acceptSection(section) {
                        return !(section instanceof ui.properties.AddFileToPackFileSection);
                    }
                }
                editor.AssetPackEditorBlocksPropertySectionProvider = AssetPackEditorBlocksPropertySectionProvider;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_2) {
                var ide = colibri.ui.ide;
                var controls = colibri.ui.controls;
                class AssetPackEditorBlocksProvider extends ide.EditorViewerProvider {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                        this._contentProvider = new editor_2.AssetPackEditorBlocksContentProvider(this._editor);
                    }
                    getContentProvider() {
                        return this._contentProvider;
                    }
                    getLabelProvider() {
                        return new LabelProvider();
                    }
                    getCellRendererProvider() {
                        return new phasereditor2d.files.ui.viewers.FileCellRendererProvider("grid");
                    }
                    getTreeViewerRenderer(viewer) {
                        // return new AssetPackEditorTreeViewerRenderer(this._editor, viewer);
                        const provider = new controls.viewers.GridTreeViewerRenderer(viewer);
                        provider.setPaintItemShadow(true);
                        provider.setSectionCriteria(obj => obj instanceof colibri.core.io.FilePath && obj.isFolder());
                        return provider;
                    }
                    getPropertySectionProvider() {
                        return new editor_2.AssetPackEditorBlocksPropertySectionProvider();
                    }
                    getUndoManager() {
                        return this._editor.getUndoManager();
                    }
                    getInput() {
                        return this._editor.getInput().getParent();
                    }
                    async updateBlocks_async() {
                        await this._contentProvider.updateIgnoreFileSet_async();
                        const sel = this.getSelection().filter(obj => !this._contentProvider.getIgnoreFileSet().has(obj));
                        this.setSelection(sel, false, true);
                        this.repaint();
                    }
                    preload() {
                        return Promise.resolve();
                    }
                }
                editor_2.AssetPackEditorBlocksProvider = AssetPackEditorBlocksProvider;
                class LabelProvider {
                    getLabel(obj) {
                        if (obj.isFolder()) {
                            if (obj.isRoot()) {
                                return "/";
                            }
                            return obj.getProjectRelativeName().substring(1);
                        }
                        return obj.getName();
                    }
                }
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                class AssetPackContentProvider {
                    getChildren(parent) {
                        if (parent instanceof pack.core.AssetPack) {
                            return parent.getItems();
                        }
                        if (parent instanceof pack.core.ImageAssetPackItem) {
                            return [];
                        }
                        if (parent instanceof pack.core.ImageFrameContainerAssetPackItem) {
                            return parent.getFrames();
                        }
                        if (parent instanceof pack.core.ScriptsAssetPackItem) {
                            return parent.getUrls();
                        }
                        return [];
                    }
                }
                viewers.AssetPackContentProvider = AssetPackContentProvider;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../viewers/AssetPackContentProvider.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_3) {
                class AssetPackEditorContentProvider extends ui.viewers.AssetPackContentProvider {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                    }
                    getPack() {
                        return this._editor.getPack();
                    }
                    getRoots(input) {
                        const types = pack.core.TYPES.filter(type => type === pack.core.ATLAS_TYPE || type.toLowerCase().indexOf("atlas") < 0);
                        return types;
                    }
                    getChildren(parent) {
                        if (typeof (parent) === "string") {
                            const type = parent;
                            if (this.getPack()) {
                                const children = this.getPack().getItems()
                                    .filter(item => {
                                    if (pack.core.AssetPackUtils.isAtlasType(type)
                                        && pack.core.AssetPackUtils.isAtlasType(item.getType())) {
                                        return true;
                                    }
                                    return item.getType() === type;
                                });
                                return children;
                            }
                        }
                        return super.getChildren(parent);
                    }
                }
                editor_3.AssetPackEditorContentProvider = AssetPackEditorContentProvider;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_4) {
                class AssetPackEditorOutlineContentProvider extends editor_4.AssetPackEditorContentProvider {
                    constructor(editor) {
                        super(editor);
                    }
                    getRoots() {
                        if (this.getPack()) {
                            const types = this.getPack().getItems().map(item => item.getType());
                            const set = new Set(types);
                            const result = pack.core.TYPES.filter(type => set.has(type));
                            return result;
                        }
                        return [];
                    }
                }
                editor_4.AssetPackEditorOutlineContentProvider = AssetPackEditorOutlineContentProvider;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_5) {
                var ide = colibri.ui.ide;
                var controls = colibri.ui.controls;
                class AssetPackEditorOutlineProvider extends ide.EditorViewerProvider {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                    }
                    getUndoManager() {
                        return this._editor.getUndoManager();
                    }
                    getContentProvider() {
                        return new editor_5.AssetPackEditorOutlineContentProvider(this._editor);
                    }
                    getLabelProvider() {
                        return this._editor.getViewer().getLabelProvider();
                    }
                    getCellRendererProvider() {
                        return new ui.viewers.AssetPackCellRendererProvider("tree");
                    }
                    getTreeViewerRenderer(viewer) {
                        return new controls.viewers.TreeViewerRenderer(viewer, 64);
                    }
                    getPropertySectionProvider() {
                        return this._editor.getPropertyProvider();
                    }
                    getInput() {
                        return this._editor.getViewer().getInput();
                    }
                    preload() {
                        return Promise.resolve();
                    }
                    onViewerSelectionChanged(selection) {
                        const viewer = this._editor.getViewer();
                        viewer.setSelection(selection, false);
                        viewer.reveal(...selection);
                        viewer.repaint();
                    }
                }
                editor_5.AssetPackEditorOutlineProvider = AssetPackEditorOutlineProvider;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class AssetPackTreeViewerRenderer extends controls.viewers.GridTreeViewerRenderer {
                    constructor(viewer, flat) {
                        super(viewer, flat, false);
                        this.setSectionCriteria(obj => this.isObjectSection(obj));
                        this.setPaintItemShadow(true);
                        this.setShadowChildCriteria(obj => this.isShadowAsChild(obj));
                    }
                    isObjectSection(obj) {
                        return pack.core.TYPES_SET.has(obj)
                            || obj instanceof pack.core.AssetPack
                            || (obj instanceof colibri.core.io.FilePath && obj.isFolder());
                    }
                    isShadowAsChild(obj) {
                        return obj instanceof controls.ImageFrame;
                    }
                }
                viewers.AssetPackTreeViewerRenderer = AssetPackTreeViewerRenderer;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../viewers/AssetPackTreeViewerRenderer.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_6) {
                class AssetPackEditorTreeViewerRenderer extends ui.viewers.AssetPackTreeViewerRenderer {
                    constructor(editor, viewer) {
                        super(viewer, true);
                        this._editor = editor;
                    }
                    isChild(file) {
                        const root = this._editor.getInput().getParent();
                        return file.isFile() && file.getParent() !== root;
                    }
                    isParent(file) {
                        return file.isFolder();
                    }
                }
                editor_6.AssetPackEditorTreeViewerRenderer = AssetPackEditorTreeViewerRenderer;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_35) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_7) {
                class IgnoreFileSet extends Set {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                    }
                    async updateIgnoreFileSet_async() {
                        const packs = (await pack_35.core.AssetPackUtils.getAllPacks())
                            .filter(pack => pack.getFile() !== this._editor.getInput());
                        this.clear();
                        for (const pack of packs) {
                            pack.computeUsedFiles(this);
                        }
                        this._editor.getPack().computeUsedFiles(this);
                    }
                }
                editor_7.IgnoreFileSet = IgnoreFileSet;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack_35.ui || (pack_35.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_8) {
                var controls = colibri.ui.controls;
                var io = colibri.core.io;
                var ide = colibri.ui.ide;
                class ImportFileSection extends controls.properties.PropertySection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.editor.ImportFileSection", "Import File", false);
                    }
                    createForm(parent) {
                        const comp = this.createGridElement(parent, 1);
                        this.addUpdater(() => {
                            while (comp.children.length > 0) {
                                comp.children.item(0).remove();
                            }
                            const importList = [];
                            for (const importer of ui.importers.Importers.getAll()) {
                                const files = this.getSelection().filter(file => importer.acceptFile(file));
                                if (files.length > 0) {
                                    importList.push({
                                        importer: importer,
                                        files: files
                                    });
                                }
                            }
                            for (const importData of importList) {
                                const btn = document.createElement("button");
                                btn.innerText = `Import ${importData.importer.getType()} (${importData.files.length})`;
                                btn.addEventListener("click", async (e) => {
                                    const editor = ide.Workbench.getWorkbench().getActiveEditor();
                                    await editor.importData_async(importData);
                                });
                                comp.appendChild(btn);
                            }
                        });
                    }
                    canEdit(obj, n) {
                        return obj instanceof io.FilePath && obj.isFile();
                    }
                    canEditNumber(n) {
                        return n > 0;
                    }
                }
                editor_8.ImportFileSection = ImportFileSection;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_9) {
                var properties;
                (function (properties) {
                    var controls = colibri.ui.controls;
                    class AssetPackEditorPropertyProvider extends controls.properties.PropertySectionProvider {
                        constructor(editor) {
                            super("phasereditor2d.pack.ui.editor.properties.AssetPackEditorPropertyProvider");
                            this.editor = editor;
                        }
                        addSections(page, sections) {
                            sections.push(new properties.BlocksSection(page));
                            sections.push(new properties.ItemSection(page));
                            sections.push(new properties.ImageSection(page));
                            sections.push(new properties.SVGSection(page));
                            sections.push(new properties.AtlasSection(page));
                            sections.push(new properties.AtlasXMLSection(page));
                            sections.push(new properties.UnityAtlasSection(page));
                            sections.push(new properties.MultiatlasSection(page));
                            sections.push(new properties.SpritesheetURLSection(page));
                            sections.push(new properties.SpritesheetFrameSection(page));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.AnimationsSection", "Animations", "URL", "url", pack.core.contentTypes.CONTENT_TYPE_ANIMATIONS, pack.core.ANIMATION_TYPE));
                            sections.push(new properties.BitmapFontSection(page));
                            sections.push(new properties.TilemapCSVSection(page));
                            sections.push(new properties.TilemapImpactSection(page));
                            sections.push(new properties.TilemapTiledJSONSection(page));
                            sections.push(new properties.PluginSection(page));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.SceneFileSection", "Scene File", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack.core.SCENE_FILE_TYPE));
                            sections.push(new properties.ScenePluginSection(page));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.ScriptSection", "Script", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack.core.SCRIPT_TYPE));
                            sections.push(new properties.ScriptsSection(page));
                            sections.push(new properties.AudioSection(page));
                            sections.push(new properties.AudioSpriteSection(page));
                            sections.push(new properties.VideoSection(page));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.TextSection", "Text", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_TEXT, pack.core.TEXT_TYPE));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.CSSSection", "CSS", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_CSS, pack.core.CSS_TYPE));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.GLSLSection", "GLSL", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_GLSL, pack.core.GLSL_TYPE));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.HTMLSection", "HTML", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_HTML, pack.core.HTML_TYPE));
                            sections.push(new properties.HTMLTextureSection(page));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.BinarySection", "Binary", "URL", "url", colibri.core.CONTENT_TYPE_ANY, pack.core.BINARY_TYPE));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.JSONSection", "JSON", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_JSON, pack.core.JSON_TYPE));
                            sections.push(new properties.SimpleURLSection(page, "phasereditor2d.pack.ui.editor.properties.XMLSection", "XML", "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_XML, pack.core.XML_TYPE));
                            // info sections
                            sections.push(new ui.properties.AtlasFrameInfoSection(page));
                            sections.push(new pack.ui.properties.TilemapTiledSection(page));
                            // preview sections
                            sections.push(new ui.properties.ImagePreviewSection(page));
                            sections.push(new ui.properties.ManyImagePreviewSection(page));
                        }
                        getEmptySelectionObject() {
                            return this.editor.getPack();
                        }
                    }
                    properties.AssetPackEditorPropertyProvider = AssetPackEditorPropertyProvider;
                })(properties = editor_9.properties || (editor_9.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_36) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    var controls = colibri.ui.controls;
                    var ide = colibri.ui.ide;
                    class BaseSection extends controls.properties.PropertySection {
                        constructor(page, id, title, assetType, fillSpace) {
                            super(page, id, title, fillSpace);
                            this._assetType = assetType;
                        }
                        getPack() {
                            return this.getSelectionFirstElement().getPack();
                        }
                        getAssetType() {
                            return null;
                        }
                        hasMenu() {
                            return true;
                        }
                        createMenu(menu) {
                            let type = this.getAssetType();
                            if (!type) {
                                type = this._assetType;
                            }
                            if (type) {
                                menu.addAction({
                                    text: "Help",
                                    callback: () => {
                                        controls.Controls.openUrlInNewPage("http://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html#" + type + "__anchor");
                                    }
                                });
                            }
                        }
                        getEditor() {
                            return ide.Workbench.getWorkbench().getActiveEditor();
                        }
                        changeItemField(key, value, updateSelection = false) {
                            if (Number.isNaN(value)) {
                                this.updateWithSelection();
                                return;
                            }
                            this.getEditor().getUndoManager().add(new editor.undo.ChangeItemFieldOperation(this.getEditor(), this.getSelection(), key, value, updateSelection));
                        }
                        canEdit(obj, n) {
                            return obj instanceof pack_36.core.AssetPackItem && n === 1;
                        }
                        canEditNumber(n) {
                            return n === 1;
                        }
                        async browseFile_onlyContentType(title, contentType, selectionCallback) {
                            this.browseFile(title, f => {
                                const type = ide.Workbench.getWorkbench().getContentTypeRegistry().getCachedContentType(f);
                                return type === contentType;
                            }, selectionCallback);
                        }
                        async browseFile(title, fileFilter, selectionCallback) {
                            const viewer = await this.getEditor().createFilesViewer(fileFilter);
                            const dlg = new controls.dialogs.ViewerDialog(viewer, true);
                            dlg.create();
                            dlg.setTitle(title);
                            {
                                const btn = dlg.addButton("Select", () => {
                                    selectionCallback(viewer.getSelection());
                                    dlg.close();
                                });
                                btn.disabled = true;
                                viewer.eventSelectionChanged.addListener(() => {
                                    btn.disabled = viewer.getSelection().length === 0;
                                });
                            }
                            dlg.addButton("Show All Files", () => {
                                viewer.setInput(this.getEditor().getInput().getParent().flatTree([], false));
                                viewer.repaint();
                            });
                            dlg.addButton("Cancel", () => {
                                dlg.close();
                            });
                            viewer.eventOpenItem.addListener(async () => {
                                selectionCallback([viewer.getSelection()[0]]);
                                dlg.close();
                            });
                        }
                        getHelp(helpKey) {
                            return pack_36.AssetPackPlugin.getInstance().getPhaserDocs().getDoc(helpKey);
                        }
                        createFileField(comp, label, fieldKey, contentType, helpKey) {
                            let tooltip;
                            if (helpKey) {
                                tooltip = this.getHelp(helpKey);
                            }
                            this.createLabel(comp, label, tooltip);
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                const val = this.getSelection()[0].getData()[fieldKey];
                                text.value = val === undefined ? "" : val;
                            });
                            this.createButton(comp, "Browse", () => {
                                this.browseFile_onlyContentType("Select File", contentType, (files) => {
                                    const file = files[0];
                                    const url = this.getPack().getUrlFromAssetFile(file);
                                    this.changeItemField(fieldKey, url, true);
                                });
                            });
                        }
                        createMultiFileField(comp, label, fieldKey, contentType, helpKey) {
                            this.createLabel(comp, label, helpKey ? this.getHelp(helpKey) : undefined);
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                const val = this.getSelection()[0].getData()[fieldKey];
                                text.value = val === undefined ? "" : JSON.stringify(val);
                            });
                            this.createButton(comp, "Browse", () => {
                                this.browseFile_onlyContentType("Select Files", contentType, (files) => {
                                    const pack = this.getPack();
                                    const urls = files.map(file => pack.getUrlFromAssetFile(file));
                                    this.changeItemField(fieldKey, urls, true);
                                });
                            });
                        }
                        createSimpleTextField(parent, label, field, helpKey) {
                            this.createLabel(parent, label, helpKey ? this.getHelp(helpKey) : undefined);
                            const text = this.createText(parent, false);
                            text.style.gridColumn = "2 / span 2";
                            text.addEventListener("change", e => {
                                this.changeItemField(field, text.value, true);
                            });
                            this.addUpdater(() => {
                                const data = this.getSelection()[0].getData();
                                text.value = colibri.core.json.getDataValue(data, field);
                            });
                            return text;
                        }
                        createSimpleIntegerField(parent, label, field, helpKey) {
                            this.createLabel(parent, label, helpKey ? this.getHelp(helpKey) : undefined);
                            const text = this.createText(parent, false);
                            text.style.gridColumn = "2 / span 2";
                            text.addEventListener("change", e => {
                                const value = Number.parseInt(text.value, 10);
                                if (isNaN(value)) {
                                    this.updateWithSelection();
                                }
                                else {
                                    this.changeItemField(field, value, true);
                                }
                            });
                            this.addUpdater(() => {
                                const data = this.getSelection()[0].getData();
                                const value = colibri.core.json.getDataValue(data, field);
                                text.value = value === undefined ? 0 : value;
                            });
                            return text;
                        }
                    }
                    properties.BaseSection = BaseSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack_36.ui || (pack_36.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class AtlasSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.AtlasSection", "Atlas", pack.core.ATLAS_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.AtlasAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "Atlas URL", "atlasURL", pack.core.contentTypes.CONTENT_TYPE_ATLAS, "Phaser.Loader.LoaderPlugin.atlas(atlasURL)");
                            this.createFileField(comp, "Texture URL", "textureURL", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Loader.LoaderPlugin.atlas(textureURL)");
                            this.createFileField(comp, "Normal Map", "normalMap", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Types.Loader.FileTypes.AtlasJSONFileConfig.normalMap");
                        }
                    }
                    properties.AtlasSection = AtlasSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class AtlasXMLSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.AtlasXMLSection", "Atlas XML", pack.core.ATLAS_XML_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.AtlasXMLAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "Atlas URL", "atlasURL", pack.core.contentTypes.CONTENT_TYPE_ATLAS_XML, "Phaser.Loader.LoaderPlugin.atlasXML(atlasURL)");
                            this.createFileField(comp, "Texture URL", "textureURL", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Loader.LoaderPlugin.atlasXML(textureURL)");
                            this.createFileField(comp, "Normal Map", "normalMap", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Types.Loader.FileTypes.AtlasXMLFileConfig.normalMap");
                        }
                    }
                    properties.AtlasXMLSection = AtlasXMLSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class AudioSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.AudioSection", "Audio", pack.core.AUDIO_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.AudioAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createMultiFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_AUDIO, "Phaser.Loader.LoaderPlugin.audio(urls)");
                        }
                    }
                    properties.AudioSection = AudioSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class AudioSpriteSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.AudioSpriteSection", "Audio Sprite", pack.core.AUDIO_SPRITE_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.AudioSpriteAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "JSON URL", "jsonURL", pack.core.contentTypes.CONTENT_TYPE_AUDIO_SPRITE, "Phaser.Loader.LoaderPlugin.audioSprite(jsonURL)");
                            this.createMultiFileField(comp, "Audio URL", "audioURL", phasereditor2d.webContentTypes.core.CONTENT_TYPE_AUDIO, "Phaser.Loader.LoaderPlugin.audioSprite(audioURL)");
                        }
                    }
                    properties.AudioSpriteSection = AudioSpriteSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class BitmapFontSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.BitmapFontSection", "Bitmap Font", pack.core.BITMAP_FONT_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.BitmapFontAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "Font Data URL", "fontDataURL", pack.core.contentTypes.CONTENT_TYPE_BITMAP_FONT, "Phaser.Loader.LoaderPlugin.bitmapFont(fontDataURL)");
                            this.createFileField(comp, "Texture URL", "textureURL", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Loader.LoaderPlugin.bitmapFont(textureURL)");
                            this.createFileField(comp, "Normal Map", "normalMap", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Types.Loader.FileTypes.BitmapFontFileConfig.normalMap");
                        }
                    }
                    properties.BitmapFontSection = BitmapFontSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_10) {
                var properties;
                (function (properties) {
                    var controls = colibri.ui.controls;
                    class BlocksSection extends controls.properties.PropertySection {
                        constructor(page) {
                            super(page, "id", "Blocks", false, false);
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 2);
                            const check = this.createCheckbox(comp, this.createLabel(comp, "Show All Files In Project"));
                            check.addEventListener("change", () => {
                                this.getSelectionFirstElement().setShowAllFilesInBlocks(check.checked);
                                const editor = colibri.Platform.getWorkbench().getActiveEditor();
                                editor.updateBlocks();
                                editor.setDirty(true);
                            });
                            this.addUpdater(() => {
                                check.checked = this.getSelectionFirstElement().isShowAllFilesInBlocks();
                            });
                        }
                        canEdit(obj, n) {
                            return obj instanceof pack.core.AssetPack;
                        }
                        canEditNumber(n) {
                            return n === 1;
                        }
                    }
                    properties.BlocksSection = BlocksSection;
                })(properties = editor_10.properties || (editor_10.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class HTMLTextureSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.HTMLTextureSection", "HTML Texture", pack.core.HTML_TEXTURE_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.HTMLTextureAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_HTML, "Phaser.Loader.LoaderPlugin.htmlTexture(url)");
                            this.createSimpleIntegerField(comp, "Width", "width", "Phaser.Loader.LoaderPlugin.htmlTexture(width)");
                            this.createSimpleIntegerField(comp, "Height", "height", "Phaser.Loader.LoaderPlugin.htmlTexture(height)");
                        }
                    }
                    properties.HTMLTextureSection = HTMLTextureSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class ImageSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.ImageSection", "Image", pack.core.IMAGE_TYPE);
                        }
                        canEdit(obj, n) {
                            return obj instanceof pack.core.ImageAssetPackItem && !(obj instanceof pack.core.SvgAssetPackItem) && super.canEdit(obj, n);
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Loader.LoaderPlugin.image(url)");
                            this.createFileField(comp, "Normal Map", "normalMap", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Types.Loader.FileTypes.ImageFileConfig.normalMap");
                        }
                    }
                    properties.ImageSection = ImageSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class ItemSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.ItemSection", "Key");
                        }
                        getAssetType() {
                            return this.getSelectionFirstElement().getType();
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 2);
                            const docs = pack.AssetPackPlugin.getInstance().getPhaserDocs();
                            {
                                // Key
                                this.createLabel(comp, "Key", "The key of the file");
                                const text = this.createText(comp);
                                text.addEventListener("change", e => {
                                    this.changeItemField("key", text.value);
                                });
                                this.addUpdater(() => {
                                    text.value = this.getSelection()[0].getKey();
                                });
                            }
                        }
                        canEdit(obj, n) {
                            return obj instanceof pack.core.AssetPackItem;
                        }
                        canEditNumber(n) {
                            return n === 1;
                        }
                    }
                    properties.ItemSection = ItemSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class MultiatlasSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.MultiatlasSection", "Multiatlas", pack.core.MULTI_ATLAS_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.MultiatlasAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", pack.core.contentTypes.CONTENT_TYPE_MULTI_ATLAS, "Phaser.Loader.LoaderPlugin.multiatlas(atlasURL)");
                            this.createSimpleTextField(comp, "Path", "path", "Phaser.Loader.LoaderPlugin.multiatlas(path)");
                        }
                    }
                    properties.MultiatlasSection = MultiatlasSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class PluginSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.PluginSection", "Plugin", pack.core.PLUGIN_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.PluginAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            {
                                // URL
                                this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, "Phaser.Loader.LoaderPlugin.plugin(url)");
                            }
                            {
                                // start
                                this.createLabel(comp, "Start", this.getHelp("Phaser.Loader.LoaderPlugin.plugin(start)"));
                                const checkbox = this.createCheckbox(comp);
                                checkbox.style.gridColumn = "2 / span 2";
                                checkbox.addEventListener("change", e => {
                                    this.changeItemField("start", checkbox.checked, true);
                                });
                                this.addUpdater(() => {
                                    const data = this.getSelection()[0].getData();
                                    checkbox.checked = data.start;
                                });
                            }
                            this.createSimpleTextField(comp, "Mapping", "mapping", this.getHelp("Phaser.Loader.LoaderPlugin.plugin(mapping)"));
                        }
                    }
                    properties.PluginSection = PluginSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class SVGSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.SVGSection", "SVG", pack.core.SVG_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.SvgAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_SVG, "Phaser.Loader.LoaderPlugin.svg(url)");
                            this.createSimpleIntegerField(comp, "Scale", "svgConfig.scale", "Phaser.Types.Loader.FileTypes.SVGSizeConfig.scale");
                            this.createSimpleIntegerField(comp, "Width", "svgConfig.width", "Phaser.Types.Loader.FileTypes.SVGSizeConfig.width");
                            this.createSimpleIntegerField(comp, "Height", "svgConfig.height", "Phaser.Types.Loader.FileTypes.SVGSizeConfig.height");
                        }
                    }
                    properties.SVGSection = SVGSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class ScenePluginSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.ScenePluginSection", "Scene Plugin", pack.core.SCENE_PLUGIN_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.ScenePluginAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, "Phaser.Loader.LoaderPlugin.scenePlugin(url)");
                            this.createSimpleTextField(comp, "System Key", "systemKey", "Phaser.Loader.LoaderPlugin.scenePlugin(systemKey)");
                            this.createSimpleTextField(comp, "Scene Key", "sceneKey", "Phaser.Loader.LoaderPlugin.scenePlugin(sceneKey)");
                        }
                    }
                    properties.ScenePluginSection = ScenePluginSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_37) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    var controls = colibri.ui.controls;
                    class ScriptsSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties", "Scripts", pack_37.core.SCRIPTS_TYPE, true);
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 1);
                            comp.style.gridTemplateRows = "1fr auto";
                            const viewer = new controls.viewers.TreeViewer("phasereditor2d.pack.ui.editor.properties.ScriptSection");
                            viewer.setCellRendererProvider(new ui.viewers.AssetPackCellRendererProvider("tree"));
                            viewer.setLabelProvider(new controls.viewers.LabelProvider(obj => obj));
                            viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                            viewer.setInput([]);
                            const filteredViewer = new colibri.ui.ide.properties.FilteredViewerInPropertySection(this.getPage(), viewer, false);
                            comp.appendChild(filteredViewer.getElement());
                            this.addUpdater(async () => {
                                viewer.setInput([]);
                                viewer.repaint();
                                viewer.setInput(this.getPackItem().getUrls());
                                filteredViewer.resizeTo();
                            });
                            const btnPanel = document.createElement("div");
                            btnPanel.classList.add("PropertyButtonPanel");
                            {
                                const listener = () => {
                                    this.performChanges(urls => {
                                        const selected = new Set(viewer.getSelection());
                                        return urls.filter(url => !selected.has(url));
                                    });
                                };
                                const btn = this.createButton(btnPanel, "Delete", listener);
                                viewer.eventDeletePressed.addListener(listener);
                                viewer.eventSelectionChanged.addListener(() => {
                                    btn.disabled = viewer.getSelection().length === 0;
                                });
                                btn.disabled = true;
                                btnPanel.appendChild(btn);
                            }
                            btnPanel.appendChild(this.createButton(btnPanel, "Add Scripts", () => {
                                this.browseFile_onlyContentType("Scripts", phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, files => {
                                    const pack = this.getPack();
                                    this.performChanges(urls => {
                                        const used = new Set(urls);
                                        const newUrls = files
                                            .map(file => pack.getUrlFromAssetFile(file))
                                            .filter(url => !used.has(url));
                                        urls.push(...newUrls);
                                        viewer.setSelection(newUrls);
                                        return urls;
                                    });
                                    this.updateWithSelection();
                                });
                            }));
                            {
                                const btn = this.createButton(btnPanel, "Move Down", () => {
                                    this.performChanges(urls => {
                                        const selectionSel = new Set(viewer.getSelection());
                                        for (let i = urls.length - 1; i >= 0; i--) {
                                            const url = urls[i];
                                            if (selectionSel.has(url)) {
                                                if (i === urls.length - 1) {
                                                    break;
                                                }
                                                const temp = urls[i + 1];
                                                urls[i + 1] = url;
                                                urls[i] = temp;
                                            }
                                        }
                                        return urls;
                                    });
                                });
                                btnPanel.appendChild(btn);
                                viewer.eventSelectionChanged.addListener(() => {
                                    const selected = new Set(viewer.getSelection());
                                    btn.disabled = selected.size === 0;
                                    const urls = this.getPackItem().getUrls();
                                    if (urls.length === 0 || selected.has(urls[urls.length - 1])) {
                                        btn.disabled = true;
                                    }
                                });
                                btn.disabled = true;
                            }
                            {
                                const btn = this.createButton(btnPanel, "Move Up", () => {
                                    this.performChanges(urls => {
                                        const selectionSel = new Set(viewer.getSelection());
                                        for (let i = 0; i < urls.length; i++) {
                                            const url = urls[i];
                                            if (selectionSel.has(url)) {
                                                if (i === 0) {
                                                    break;
                                                }
                                                const temp = urls[i - 1];
                                                urls[i - 1] = url;
                                                urls[i] = temp;
                                            }
                                        }
                                        return urls;
                                    });
                                    setTimeout(() => viewer.setSelection(viewer.getSelection()), 10);
                                });
                                viewer.eventSelectionChanged.addListener(() => {
                                    const selected = new Set(viewer.getSelection());
                                    btn.disabled = selected.size === 0;
                                    const urls = this.getPackItem().getUrls();
                                    if (urls.length === 0 || selected.has(urls[0])) {
                                        btn.disabled = true;
                                    }
                                });
                                btn.disabled = true;
                                btnPanel.appendChild(btn);
                            }
                            comp.appendChild(btnPanel);
                        }
                        performChanges(operation) {
                            const item = this.getPackItem();
                            const urls = operation([...item.getUrls()]);
                            this.getEditor().getUndoManager().add(new editor.undo.ChangeItemFieldOperation(this.getEditor(), this.getSelection(), "url", urls, true));
                        }
                        getPackItem() {
                            return this.getSelectionFirstElement();
                        }
                        canEdit(obj, n) {
                            return obj instanceof pack_37.core.ScriptsAssetPackItem;
                        }
                        canEditNumber(n) {
                            return n === 1;
                        }
                    }
                    properties.ScriptsSection = ScriptsSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack_37.ui || (pack_37.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class SimpleURLSection extends properties.BaseSection {
                        constructor(page, id, title, fieldLabel, dataKey, contentType, assetPackType) {
                            super(page, id, title, assetPackType, false);
                            this._label = fieldLabel;
                            this._dataKey = dataKey;
                            this._contentType = contentType;
                            this._assetPackType = assetPackType;
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj.getType() === this._assetPackType;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, this._label, this._dataKey, this._contentType, `Phaser.Loader.LoaderPlugin.${this._assetPackType}(${this._dataKey})`);
                        }
                    }
                    properties.SimpleURLSection = SimpleURLSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class SpritesheetFrameSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.SpritesheetFrameSection", "Spritesheet Frame", pack.core.SPRITESHEET_TYPE);
                        }
                        canEdit(obj, n) {
                            return obj instanceof pack.core.SpritesheetAssetPackItem;
                        }
                        canEditNumber(n) {
                            return n > 0;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createSimpleIntegerField(comp, "Frame Width", "frameConfig.frameWidth", "Phaser.Types.Textures.SpriteSheetConfig.frameWidth");
                            this.createSimpleIntegerField(comp, "Frame Height", "frameConfig.frameHeight", "Phaser.Types.Textures.SpriteSheetConfig.frameHeight");
                            this.createSimpleIntegerField(comp, "Start Frame", "frameConfig.startFrame", "Phaser.Types.Textures.SpriteSheetConfig.startFrame");
                            this.createSimpleIntegerField(comp, "End Frame", "frameConfig.endFrame", "Phaser.Types.Textures.SpriteSheetConfig.endFrame");
                            this.createSimpleIntegerField(comp, "Margin", "frameConfig.margin", "Phaser.Types.Textures.SpriteSheetConfig.margin");
                            this.createSimpleIntegerField(comp, "Spacing", "frameConfig.spacing", "Phaser.Types.Textures.SpriteSheetConfig.spacing");
                        }
                    }
                    properties.SpritesheetFrameSection = SpritesheetFrameSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class SpritesheetURLSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.SpritesheetURLSection", "Spritesheet URL", pack.core.SPRITESHEET_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.SpritesheetAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Loader.LoaderPlugin.spritesheet(url)");
                        }
                    }
                    properties.SpritesheetURLSection = SpritesheetURLSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class TilemapCSVSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.TilemapCSVSection", "Tilemap CSV", pack.core.TILEMAP_CSV_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.TilemapCSVAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_CSV, "Phaser.Loader.LoaderPlugin.tilemapCSV(url)");
                        }
                    }
                    properties.TilemapCSVSection = TilemapCSVSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class TilemapImpactSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.TilemapImpactSection", "Tilemap Impact", pack.core.TILEMAP_IMPACT_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.TilemapImpactAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", pack.core.contentTypes.CONTENT_TYPE_TILEMAP_IMPACT, "Phaser.Loader.LoaderPlugin.tilemapImpact(url)");
                        }
                    }
                    properties.TilemapImpactSection = TilemapImpactSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class TilemapTiledJSONSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.TilemapTiledJSONSection", "Tilemap Tiled JSON", pack.core.TILEMAP_TILED_JSON_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.TilemapTiledJSONAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "URL", "url", pack.core.contentTypes.CONTENT_TYPE_TILEMAP_TILED_JSON, "Phaser.Loader.LoaderPlugin.tilemapTiledJSON(url)");
                        }
                    }
                    properties.TilemapTiledJSONSection = TilemapTiledJSONSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class UnityAtlasSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.UnityAtlasSection", "Unity Atlas", pack.core.UNITY_ATLAS_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.UnityAtlasAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createFileField(comp, "Atlas URL", "atlasURL", pack.core.contentTypes.CONTENT_TYPE_UNITY_ATLAS, "Phaser.Loader.LoaderPlugin.unityAtlas(atlasURL)");
                            this.createFileField(comp, "Texture URL", "textureURL", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Loader.LoaderPlugin.unityAtlas(textureURL)");
                            this.createFileField(comp, "Normal Map", "normalMap", phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, "Phaser.Types.Loader.FileTypes.UnityAtlasFileConfig.normalMap");
                        }
                    }
                    properties.UnityAtlasSection = UnityAtlasSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class VideoSection extends properties.BaseSection {
                        constructor(page) {
                            super(page, "phasereditor2d.pack.ui.editor.properties.VideoSection", "Video", pack.core.VIDEO_TYPE);
                        }
                        canEdit(obj, n) {
                            return super.canEdit(obj, n) && obj instanceof pack.core.VideoAssetPackItem;
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr auto";
                            this.createMultiFileField(comp, "URL", "url", phasereditor2d.webContentTypes.core.CONTENT_TYPE_VIDEO, "Phaser.Loader.LoaderPlugin.video(urls)");
                        }
                    }
                    properties.VideoSection = VideoSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_11) {
                var undo;
                (function (undo) {
                    var ide = colibri.ui.ide;
                    class AssetPackEditorOperation extends ide.undo.Operation {
                        constructor(editor, before, after) {
                            super();
                            this._editor = editor;
                            this._before = before;
                            this._after = after;
                        }
                        static takeSnapshot(editor) {
                            return editor.getPack().toJSON();
                        }
                        load(data) {
                            this._editor.getPack().fromJSON(data);
                            this._editor.updateAll();
                            this._editor.setDirty(true);
                        }
                        undo() {
                            this.load(this._before);
                        }
                        redo() {
                            this.load(this._after);
                        }
                    }
                    undo.AssetPackEditorOperation = AssetPackEditorOperation;
                })(undo = editor_11.undo || (editor_11.undo = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_12) {
                var undo;
                (function (undo) {
                    var ide = colibri.ui.ide;
                    var json = colibri.core.json;
                    class ChangeItemFieldOperation extends ide.undo.Operation {
                        constructor(editor, items, fieldKey, newValue, updateSelection = false) {
                            super();
                            this._editor = editor;
                            this._itemIndexList = items.map(item => this._editor.getPack().getItems().indexOf(item));
                            this._fieldKey = fieldKey;
                            this._updateSelection = updateSelection;
                            this._newValueList = [];
                            this._oldValueList = items.map(item => json.getDataValue(item.getData(), fieldKey));
                            // tslint:disable-next-line:prefer-for-of
                            for (let i = 0; i < items.length; i++) {
                                this._newValueList.push(newValue);
                            }
                            this.load_async(this._newValueList);
                        }
                        undo() {
                            this.load_async(this._oldValueList);
                        }
                        redo() {
                            this.load_async(this._newValueList);
                        }
                        async load_async(values) {
                            for (let i = 0; i < this._itemIndexList.length; i++) {
                                const index = this._itemIndexList[i];
                                const item = this._editor.getPack().getItems()[index];
                                json.setDataValue(item.getData(), this._fieldKey, values[i]);
                                item.resetCache();
                                await item.preload();
                            }
                            this._editor.repaintEditorAndOutline();
                            this._editor.setDirty(true);
                            if (this._updateSelection) {
                                this._editor.dispatchSelectionChanged();
                            }
                        }
                    }
                    undo.ChangeItemFieldOperation = ChangeItemFieldOperation;
                })(undo = editor_12.undo || (editor_12.undo = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_38) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                var ide = colibri.ui.ide;
                class Importer {
                    constructor(type) {
                        this._type = type;
                        this._multipleFiles = false;
                    }
                    isMultipleFiles() {
                        return this._multipleFiles;
                    }
                    setMultipleFiles(multipleFiles) {
                        this._multipleFiles = multipleFiles;
                    }
                    getType() {
                        return this._type;
                    }
                    async autoImport(pack, files) {
                        if (this.isMultipleFiles()) {
                            return [await this.importMultipleFiles(pack, files)];
                        }
                        else {
                            const items = [];
                            for (const file of files) {
                                items.push(await this.importFile(pack, file));
                            }
                            return items;
                        }
                    }
                    async importFile(pack, file) {
                        const computer = new ide.utils.NameMaker(i => i.getKey());
                        computer.update(pack.getItems());
                        const data = this.createItemData(pack, file);
                        const firstFile = Array.isArray(file) ? file[0] : file;
                        data.type = this.getType();
                        data.key = computer.makeName(firstFile.getNameWithoutExtension());
                        const item = pack.createPackItem(data);
                        pack.addItem(item);
                        await item.preload();
                        return item;
                    }
                    async importMultipleFiles(pack, files) {
                        const computer = new ide.utils.NameMaker(i => i.getKey());
                        computer.update(pack.getItems());
                        const data = this.createItemData(pack, files);
                        data.type = this.getType();
                        data.key = computer.makeName(files[0].getNameWithoutExtension());
                        const item = pack.createPackItem(data);
                        pack.addItem(item);
                        await item.preload();
                        return item;
                    }
                }
                importers.Importer = Importer;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_38.ui || (pack_38.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Importer.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                var ide = colibri.ui.ide;
                class ContentTypeImporter extends importers.Importer {
                    constructor(contentType, assetPackItemType) {
                        super(assetPackItemType);
                        this._contentType = contentType;
                    }
                    getContentType() {
                        return this._contentType;
                    }
                    acceptFile(file) {
                        const fileContentType = ide.Workbench.getWorkbench().getContentTypeRegistry().getCachedContentType(file);
                        return fileContentType === this._contentType;
                    }
                }
                importers.ContentTypeImporter = ContentTypeImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./ContentTypeImporter.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_39) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                var io = colibri.core.io;
                var ide = colibri.ui.ide;
                class BaseAtlasImporter extends importers.ContentTypeImporter {
                    acceptFile(file) {
                        const contentType = ide.Workbench.getWorkbench().getContentTypeRegistry().getCachedContentType(file);
                        return contentType === this.getContentType();
                    }
                    createItemData(pack, file) {
                        let textureURL;
                        if (file.getNameWithoutExtension().endsWith(".png")) {
                            textureURL = io.FilePath.join(pack.getUrlFromAssetFile(file.getParent()), file.getNameWithoutExtension());
                        }
                        else {
                            textureURL = pack_39.core.AssetPackUtils.getFilePackUrlWithNewExtension(pack, file, "png");
                        }
                        const altTextureFile = file.getParent().getFile(file.getName() + ".png");
                        if (altTextureFile) {
                            textureURL = pack.getUrlFromAssetFile(altTextureFile);
                        }
                        return {
                            atlasURL: pack.getUrlFromAssetFile(file),
                            textureURL: textureURL
                        };
                    }
                }
                importers.BaseAtlasImporter = BaseAtlasImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_39.ui || (pack_39.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasImporter.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class AtlasImporter extends importers.BaseAtlasImporter {
                    constructor() {
                        super(pack.core.contentTypes.CONTENT_TYPE_ATLAS, pack.core.ATLAS_TYPE);
                    }
                }
                importers.AtlasImporter = AtlasImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasImporter.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class AtlasXMLImporter extends importers.BaseAtlasImporter {
                    constructor() {
                        super(pack.core.contentTypes.CONTENT_TYPE_ATLAS_XML, pack.core.ATLAS_XML_TYPE);
                    }
                }
                importers.AtlasXMLImporter = AtlasXMLImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_40) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                var ide = colibri.ui.ide;
                class AudioSpriteImporter extends importers.ContentTypeImporter {
                    constructor() {
                        super(pack_40.core.contentTypes.CONTENT_TYPE_AUDIO_SPRITE, pack_40.core.AUDIO_SPRITE_TYPE);
                    }
                    createItemData(pack, file) {
                        const reg = ide.Workbench.getWorkbench().getContentTypeRegistry();
                        const baseName = file.getNameWithoutExtension();
                        const urls = file.getParent().getFiles()
                            .filter(f => reg.getCachedContentType(f) === phasereditor2d.webContentTypes.core.CONTENT_TYPE_AUDIO)
                            .filter(f => f.getNameWithoutExtension() === baseName)
                            .map(f => pack.getUrlFromAssetFile(f));
                        return {
                            jsonURL: pack.getUrlFromAssetFile(file),
                            audioURL: urls
                        };
                    }
                }
                importers.AudioSpriteImporter = AudioSpriteImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_40.ui || (pack_40.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_41) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class BitmapFontImporter extends importers.ContentTypeImporter {
                    constructor() {
                        super(pack_41.core.contentTypes.CONTENT_TYPE_BITMAP_FONT, pack_41.core.BITMAP_FONT_TYPE);
                    }
                    createItemData(pack, file) {
                        return {
                            textureURL: pack_41.core.AssetPackUtils.getFilePackUrlWithNewExtension(pack, file, "png"),
                            fontDataURL: pack.getUrlFromAssetFile(file)
                        };
                    }
                }
                importers.BitmapFontImporter = BitmapFontImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_41.ui || (pack_41.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Importer.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_42) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class MultiatlasImporter extends importers.ContentTypeImporter {
                    constructor() {
                        super(pack_42.core.contentTypes.CONTENT_TYPE_MULTI_ATLAS, pack_42.core.MULTI_ATLAS_TYPE);
                    }
                    createItemData(pack, file) {
                        return {
                            type: pack_42.core.MULTI_ATLAS_TYPE,
                            url: pack.getUrlFromAssetFile(file),
                            path: pack.getUrlFromAssetFile(file.getParent()),
                        };
                    }
                }
                importers.MultiatlasImporter = MultiatlasImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_42.ui || (pack_42.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./BaseAtlasImporter.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class UnityAtlasImporter extends importers.BaseAtlasImporter {
                    constructor() {
                        super(pack.core.contentTypes.CONTENT_TYPE_UNITY_ATLAS, pack.core.UNITY_ATLAS_TYPE);
                    }
                }
                importers.UnityAtlasImporter = UnityAtlasImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Importer.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_43) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                var ide = colibri.ui.ide;
                class SingleFileImporter extends importers.ContentTypeImporter {
                    constructor(contentType, assetPackType, urlIsArray = false, defaultValues = {}) {
                        super(contentType, assetPackType);
                        this._urlIsArray = urlIsArray;
                        this._defaultValues = defaultValues;
                    }
                    acceptFile(file) {
                        const fileContentType = ide.Workbench.getWorkbench().getContentTypeRegistry().getCachedContentType(file);
                        return fileContentType === this.getContentType();
                    }
                    createItemData(pack, file) {
                        const url = pack.getUrlFromAssetFile(file);
                        const data = {
                            url: this._urlIsArray ? [url] : url
                        };
                        for (const k in this._defaultValues) {
                            if (this._defaultValues.hasOwnProperty(k)) {
                                data[k] = this._defaultValues[k];
                            }
                        }
                        return data;
                    }
                }
                importers.SingleFileImporter = SingleFileImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_43.ui || (pack_43.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_44) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class SpritesheetImporter extends importers.SingleFileImporter {
                    constructor() {
                        super(phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, pack_44.core.SPRITESHEET_TYPE);
                    }
                    createItemData(pack, file) {
                        const data = super.createItemData(pack, file);
                        data.frameConfig = {
                            frameWidth: 32,
                            frameHeight: 32,
                            startFrame: 0,
                            endFrame: -1,
                            spacing: 0,
                            margin: 0
                        };
                        return data;
                    }
                }
                importers.SpritesheetImporter = SpritesheetImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_44.ui || (pack_44.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_45) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class ScenePluginImporter extends importers.SingleFileImporter {
                    constructor() {
                        super(phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack_45.core.SCENE_PLUGIN_TYPE);
                    }
                    createItemData(pack, file) {
                        const data = super.createItemData(pack, file);
                        const key = file.getNameWithoutExtension();
                        data.systemKey = key;
                        data.sceneKey = key;
                        return data;
                    }
                }
                importers.ScenePluginImporter = ScenePluginImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_45.ui || (pack_45.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./MultiatlasImporter.ts" />
/// <reference path="./AtlasXMLImporter.ts" />
/// <reference path="./UnityAtlasImporter.ts" />
/// <reference path="./SingleFileImporter.ts" />
/// <reference path="./SpritesheetImporter.ts" />
/// <reference path="./BitmapFontImporter.ts" />
/// <reference path="../../core/contentTypes/TilemapImpactContentTypeResolver.ts" />
/// <reference path="../../core/contentTypes/TilemapTiledJSONContentTypeResolver.ts" />
/// <reference path="./AudioSpriteImporter.ts" />
/// <reference path="./ScenePluginImporter.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class Importers {
                    static getAll() {
                        if (!this._list) {
                            this._list = [
                                new importers.AtlasImporter(),
                                new importers.MultiatlasImporter(),
                                new importers.AtlasXMLImporter(),
                                new importers.UnityAtlasImporter(),
                                new importers.BitmapFontImporter(),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_IMAGE, pack.core.IMAGE_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_SVG, pack.core.IMAGE_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_SVG, pack.core.SVG_TYPE, false, {
                                    svgConfig: {
                                        width: 0,
                                        height: 0,
                                        scale: 0
                                    }
                                }),
                                new importers.SpritesheetImporter(),
                                new importers.SingleFileImporter(pack.core.contentTypes.CONTENT_TYPE_ANIMATIONS, pack.core.ANIMATION_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_CSV, pack.core.TILEMAP_CSV_TYPE),
                                new importers.SingleFileImporter(pack.core.contentTypes.CONTENT_TYPE_TILEMAP_IMPACT, pack.core.TILEMAP_IMPACT_TYPE),
                                new importers.SingleFileImporter(pack.core.contentTypes.CONTENT_TYPE_TILEMAP_TILED_JSON, pack.core.TILEMAP_TILED_JSON_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack.core.PLUGIN_TYPE, false, {
                                    start: false,
                                    mapping: ""
                                }),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack.core.SCENE_FILE_TYPE),
                                new importers.ScenePluginImporter(),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack.core.SCRIPT_TYPE),
                                new importers.ScriptsImporter(),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_AUDIO, pack.core.AUDIO_TYPE, true),
                                new importers.AudioSpriteImporter(),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_VIDEO, pack.core.VIDEO_TYPE, true),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_TEXT, pack.core.TEXT_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_CSS, pack.core.CSS_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_HTML, pack.core.HTML_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_HTML, pack.core.HTML_TEXTURE_TYPE, false, {
                                    width: 512,
                                    height: 512
                                }),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_GLSL, pack.core.GLSL_TYPE),
                                new importers.SingleFileImporter(colibri.core.CONTENT_TYPE_ANY, pack.core.BINARY_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_JSON, pack.core.JSON_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_XML, pack.core.XML_TYPE),
                                new importers.SingleFileImporter(phasereditor2d.webContentTypes.core.CONTENT_TYPE_GLSL, pack.core.GLSL_TYPE),
                            ];
                        }
                        return this._list;
                    }
                    static getImporter(type) {
                        return this.getAll().find(i => i.getType() === type);
                    }
                }
                importers.Importers = Importers;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_46) {
        var ui;
        (function (ui) {
            var importers;
            (function (importers) {
                class ScriptsImporter extends importers.ContentTypeImporter {
                    constructor() {
                        super(phasereditor2d.webContentTypes.core.CONTENT_TYPE_JAVASCRIPT, pack_46.core.SCRIPTS_TYPE);
                        this.setMultipleFiles(true);
                    }
                    createItemData(pack, files) {
                        const data = {
                            url: files.map(file => pack.getUrlFromAssetFile(file))
                        };
                        return data;
                    }
                }
                importers.ScriptsImporter = ScriptsImporter;
            })(importers = ui.importers || (ui.importers = {}));
        })(ui = pack_46.ui || (pack_46.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_47) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                var io = colibri.core.io;
                class AddFileToPackFileSection extends controls.properties.PropertySection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.AddFileToPackFileSection", "Asset Pack File", false);
                    }
                    async getPackItems(finder) {
                        const packItems = [];
                        for (const file of this.getSelection()) {
                            const items = await finder.findPackItemsFor(file);
                            packItems.push(...items);
                        }
                        return packItems;
                    }
                    createForm(parent) {
                        const comp = this.createGridElement(parent, 1);
                        this.addUpdater(async () => {
                            const finder = new pack_47.core.PackFinder();
                            await finder.preload();
                            const packItems = await this.getPackItems(finder);
                            comp.innerHTML = "";
                            const used = new Set();
                            for (const item of packItems) {
                                const btn = document.createElement("button");
                                const key = item.getKey();
                                const packPath = item.getPack().getFile().getProjectRelativeName();
                                const hash = `${key}@${packPath}`;
                                if (used.has(hash)) {
                                    continue;
                                }
                                used.add(hash);
                                btn.innerHTML =
                                    `${key} at ${packPath}`;
                                btn.addEventListener("click", async (e) => {
                                    const editor = colibri.Platform.getWorkbench()
                                        .openEditor(item.getPack().getFile());
                                    editor.revealKey(item.getKey());
                                });
                                comp.appendChild(btn);
                            }
                            if (packItems.length === 0) {
                                const importList = this.buildImportList();
                                for (const importData of importList) {
                                    const btn = document.createElement("button");
                                    btn.innerText = `Import ${importData.importer.getType()} (${importData.files.length})`;
                                    btn.addEventListener("click", async (e) => {
                                        const packs = finder.getPacks();
                                        const menu = new controls.Menu();
                                        for (const pack of packs) {
                                            const validFiles = importData.files
                                                .filter(file => {
                                                const publicRoot = colibri.ui.ide.FileUtils.getPublicRoot(pack.getFile().getParent());
                                                return file.getFullName().startsWith(publicRoot.getFullName());
                                            });
                                            menu.add(new controls.Action({
                                                text: "Add To " + pack.getFile().getProjectRelativeName(),
                                                enabled: validFiles.length > 0,
                                                callback: () => {
                                                    this.importWithImporter(importData, pack);
                                                }
                                            }));
                                        }
                                        menu.add(new controls.Action({
                                            text: "Add To New Pack File",
                                            callback: () => {
                                                const ext = new pack.ui.dialogs.NewAssetPackFileWizardExtension();
                                                const dlg = ext.createDialog({
                                                    initialFileLocation: this.getSelectionFirstElement().getParent()
                                                });
                                                dlg.setTitle("New " + ext.getDialogName());
                                                const callback = dlg.getFileCreatedCallback();
                                                dlg.setFileCreatedCallback(async (file) => {
                                                    await callback(file);
                                                    const content = colibri.ui.ide.FileUtils.getFileString(file);
                                                    const pack = new pack_47.core.AssetPack(file, content);
                                                    this.importWithImporter(importData, pack);
                                                });
                                            }
                                        }));
                                        menu.createWithEvent(e);
                                    });
                                    comp.appendChild(btn);
                                }
                            }
                        });
                    }
                    async importWithImporter(importData, pack) {
                        const packFile = pack.getFile();
                        const importer = importData.importer;
                        await importer.autoImport(pack, importData.files);
                        const newContent = JSON.stringify(pack.toJSON(), null, 4);
                        await colibri.ui.ide.FileUtils.setFileString_async(packFile, newContent);
                        this.updateWithSelection();
                        phasereditor2d.blocks.BlocksPlugin.getInstance().refreshBlocksView();
                    }
                    buildImportList() {
                        const importList = [];
                        for (const importer of ui.importers.Importers.getAll()) {
                            const files = this.getSelection().filter(file => importer.acceptFile(file));
                            if (files.length > 0) {
                                importList.push({
                                    importer: importer,
                                    files: files
                                });
                            }
                        }
                        return importList;
                    }
                    canEdit(obj, n) {
                        return obj instanceof io.FilePath && obj.isFile();
                    }
                    canEditNumber(n) {
                        for (const obj of this.getSelection()) {
                            if (!(obj instanceof io.FilePath)) {
                                return false;
                            }
                        }
                        if (n > 0) {
                            const list = this.buildImportList();
                            return list.length > 0;
                        }
                        return false;
                    }
                }
                properties.AddFileToPackFileSection = AddFileToPackFileSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack_47.ui || (pack_47.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                class AssetPackItemSection extends controls.properties.PropertySection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.AssetPackItemPropertySection", "File Key", false);
                    }
                    createForm(parent) {
                        const comp = this.createGridElement(parent, 3);
                        comp.style.gridTemplateColumns = "auto 1fr auto";
                        {
                            // Key
                            this.createLabel(comp, "Key");
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                text.value = this.getPackItem().getKey();
                            });
                            this.createButton(comp, "Open", () => {
                                const item = this.getPackItem();
                                const file = item.getPack().getFile();
                                const editor = colibri.Platform.getWorkbench().openEditor(file);
                                editor.revealKey(item.getKey());
                            });
                        }
                    }
                    getPackItem() {
                        const obj = this.getSelectionFirstElement();
                        if (obj instanceof pack.core.AssetPackImageFrame) {
                            return obj.getPackItem();
                        }
                        return obj;
                    }
                    canEdit(obj) {
                        return obj instanceof pack.core.AssetPackItem || obj instanceof pack.core.AssetPackImageFrame;
                    }
                    canEditNumber(n) {
                        return n === 1;
                    }
                }
                properties.AssetPackItemSection = AssetPackItemSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                class AssetPackPreviewPropertyProvider extends controls.properties.PropertySectionProvider {
                    addSections(page, sections) {
                        sections.push(new pack.ui.properties.AssetPackItemSection(page));
                        sections.push(new pack.ui.properties.AtlasFrameInfoSection(page));
                        sections.push(new pack.ui.properties.ImagePreviewSection(page));
                        sections.push(new pack.ui.properties.ManyImagePreviewSection(page));
                        sections.push(new pack.ui.properties.BitmapFontPreviewSection(page));
                        sections.push(new pack.ui.properties.ManyBitmapFontPreviewSection(page));
                        sections.push(new pack.ui.properties.TilemapTiledSection(page));
                        const provider = new phasereditor2d.files.ui.views.FilePropertySectionProvider();
                        provider.addSections(page, sections);
                    }
                }
                properties.AssetPackPreviewPropertyProvider = AssetPackPreviewPropertyProvider;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                class AtlasFrameInfoSection extends controls.properties.PropertySection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.AtlasFrameInfoSection", "Frame Info", false);
                    }
                    createForm(parent) {
                        const comp = this.createGridElement(parent, 2);
                        {
                            // Key
                            this.createLabel(comp, "Name", "Frame name");
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                text.value = this.getFrame().getName().toString();
                            });
                        }
                        {
                            // Width
                            this.createLabel(comp, "Width", "Frame width");
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                text.value = this.getFrame().getWidth().toString();
                            });
                        }
                        {
                            // Height
                            this.createLabel(comp, "Height", "Frame height");
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                text.value = this.getFrame().getHeight().toString();
                            });
                        }
                    }
                    getFrame() {
                        const obj = this.getSelectionFirstElement();
                        if (obj instanceof pack.core.ImageAssetPackItem) {
                            return obj.getFrames()[0];
                        }
                        return obj;
                    }
                    canEdit(obj) {
                        return obj instanceof pack.core.AssetPackImageFrame || obj instanceof pack.core.ImageAssetPackItem;
                    }
                    canEditNumber(n) {
                        return n === 1;
                    }
                }
                properties.AtlasFrameInfoSection = AtlasFrameInfoSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                class BitmapFontPreviewSection extends colibri.ui.ide.properties.BaseImagePreviewSection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.BitmapFontPreviewSection", "Bitmap Font Preview", true);
                    }
                    getSelectedImage() {
                        const obj = this.getSelection()[0];
                        const img = pack.core.AssetPackUtils.getImageFromPackUrl(obj.getPack(), obj.getData().textureURL);
                        return img;
                    }
                    canEdit(obj) {
                        return obj instanceof pack.core.BitmapFontAssetPackItem;
                    }
                }
                properties.BitmapFontPreviewSection = BitmapFontPreviewSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                class ImagePreviewSection extends colibri.ui.ide.properties.BaseImagePreviewSection {
                    constructor(page) {
                        super(page, "pack.ImageSection", "Image Preview", true);
                    }
                    getSelectedImage() {
                        const obj = this.getSelection()[0];
                        let img;
                        if (obj instanceof pack.core.AssetPackItem) {
                            img = pack.core.AssetPackUtils.getImageFromPackUrl(obj.getPack(), obj.getData().url);
                        }
                        else {
                            img = obj;
                        }
                        return img;
                    }
                    canEdit(obj) {
                        return obj instanceof pack.core.ImageAssetPackItem || obj instanceof controls.ImageFrame;
                    }
                }
                properties.ImagePreviewSection = ImagePreviewSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                class ManyBitmapFontPreviewSection extends colibri.ui.ide.properties.BaseManyImagePreviewSection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.ManyBitmapFontPreviewSection", "Bitmap Font Preview", true);
                    }
                    async getViewerInput() {
                        return this.getSelection();
                    }
                    prepareViewer(viewer) {
                        viewer.setCellRendererProvider(new ui.viewers.AssetPackCellRendererProvider("grid"));
                        viewer.setLabelProvider(new ui.viewers.AssetPackLabelProvider());
                    }
                    canEdit(obj, n) {
                        return obj instanceof pack.core.BitmapFontAssetPackItem;
                    }
                }
                properties.ManyBitmapFontPreviewSection = ManyBitmapFontPreviewSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                class ManyImagePreviewSection extends colibri.ui.ide.properties.BaseManyImagePreviewSection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.ManyImagePreviewSection", "Image Preview", true);
                    }
                    async getViewerInput() {
                        const frames = this.getSelection().flatMap(obj => {
                            if (obj instanceof pack.core.ImageFrameContainerAssetPackItem) {
                                return obj.getFrames();
                            }
                            return [obj];
                        });
                        return frames;
                    }
                    prepareViewer(viewer) {
                        viewer.setLabelProvider(new ui.viewers.AssetPackLabelProvider());
                        viewer.setCellRendererProvider(new ui.viewers.AssetPackCellRendererProvider("grid"));
                    }
                    canEdit(obj, n) {
                        if (n === 1) {
                            return obj instanceof pack.core.AssetPackItem
                                && !(obj instanceof pack.core.ImageAssetPackItem) && obj instanceof pack.core.ImageFrameContainerAssetPackItem;
                        }
                        return obj instanceof controls.ImageFrame
                            || obj instanceof pack.core.AssetPackItem && obj instanceof pack.core.ImageFrameContainerAssetPackItem;
                    }
                    canEditNumber(n) {
                        return n > 0;
                    }
                }
                properties.ManyImagePreviewSection = ManyImagePreviewSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var properties;
            (function (properties) {
                var controls = colibri.ui.controls;
                class TilemapTiledSection extends controls.properties.PropertySection {
                    constructor(page) {
                        super(page, "phasereditor2d.pack.ui.properties.TilemapTiledSection", "Tilemap Info", true, false);
                    }
                    createForm(parent) {
                        const comp = document.createElement("div");
                        this.addUpdater(async () => {
                            const tilemap = this.getSelectionFirstElement();
                            await tilemap.preload();
                            let html = `
                <b>Tilesets</b>
                <p>
                <table class="TilemapTable" border="1" cellspacing="0">
                    <tr>
                        <th>Name</th><th>Image</th>
                    </tr>
                `;
                            for (const tileset of tilemap.getTilesetsData()) {
                                html += `
                    <tr>
                        <td>${tileset.name}</td>
                        <td>${tileset.image}</td>
                    </tr>
                    `;
                            }
                            html += `
                </table>
                </p>`;
                            html += `
                <br>
                <b>Tilemaps</b>
                <p>
                    <table class="TilemapTable" border="1" cellspacing="0">
                        ${tilemap.getLayerNames().map(name => `<tr><td>${name}</td></tr>`).join("")}
                    </table>
                </p>
                `;
                            comp.innerHTML = html;
                        });
                        parent.appendChild(comp);
                    }
                    canEdit(obj, n) {
                        return obj instanceof pack.core.TilemapTiledJSONAssetPackItem;
                    }
                    canEditNumber(n) {
                        return n === 1;
                    }
                }
                properties.TilemapTiledSection = TilemapTiledSection;
            })(properties = ui.properties || (ui.properties = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack_48) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var ide = colibri.ui.ide;
                class AbstractAssetPackClientBlocksProvider extends ide.EditorViewerProvider {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                        this._packs = [];
                    }
                    getPacks() {
                        return this._packs;
                    }
                    getEditor() {
                        return this._editor;
                    }
                    async preload(complete) {
                        const finder = await this.preloadAndGetFinder(complete);
                        this._packs = finder.getPacks();
                    }
                    prepareViewerState(state) {
                        if (state.expandedObjects) {
                            state.expandedObjects = this.getFreshItems(state.expandedObjects);
                        }
                        if (state.selectedObjects) {
                            state.selectedObjects = this.getFreshItems(state.selectedObjects);
                        }
                    }
                    getFreshItems(items) {
                        const set = new Set();
                        for (const obj of items) {
                            if (obj instanceof pack.core.AssetPack) {
                                const pack = this._packs.find(p => p.getFile() === obj.getFile());
                                if (pack) {
                                    set.add(pack);
                                }
                            }
                            else if (obj instanceof pack.core.AssetPackItem) {
                                const item = this.getFreshItem(obj);
                                if (item) {
                                    set.add(item);
                                }
                            }
                            else if (obj instanceof pack.core.AssetPackImageFrame) {
                                const item = this.getFreshItem(obj.getPackItem());
                                if (item instanceof pack.core.ImageFrameContainerAssetPackItem) {
                                    const frame = item.findFrame(obj.getName());
                                    if (frame) {
                                        set.add(frame);
                                    }
                                }
                            }
                            else {
                                set.add(obj);
                            }
                        }
                        return set;
                    }
                    getFreshItem(item) {
                        const freshPack = this._packs.find(pack => pack.getFile() === item.getPack().getFile());
                        const finder = new pack.core.PackFinder(freshPack);
                        return finder.findAssetPackItem(item.getKey());
                    }
                    getLabelProvider() {
                        return new viewers.AssetPackLabelProvider();
                    }
                    getCellRendererProvider() {
                        return new viewers.AssetPackCellRendererProvider("grid");
                    }
                    getUndoManager() {
                        return this._editor.getUndoManager();
                    }
                }
                viewers.AbstractAssetPackClientBlocksProvider = AbstractAssetPackClientBlocksProvider;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack_48.ui || (pack_48.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                var ide = colibri.ui.ide;
                var io = colibri.core.io;
                class AssetPackCellRendererProvider {
                    constructor(layout) {
                        this._layout = layout;
                        this._fileRendererProvider = new phasereditor2d.files.ui.viewers.FileCellRendererProvider(layout);
                    }
                    getCellRenderer(element) {
                        if (element instanceof pack.core.AssetPack) {
                            return this.getIconRenderer(pack.AssetPackPlugin.getInstance().getIcon(pack.ICON_ASSET_PACK));
                        }
                        else if (typeof (element) === "string" && pack.core.TYPES.indexOf(element) >= 0) {
                            return new controls.viewers.IconImageCellRenderer(colibri.ColibriPlugin.getInstance().getIcon(colibri.ICON_FOLDER));
                        }
                        if (element instanceof io.FilePath) {
                            return this._fileRendererProvider.getCellRenderer(element);
                        }
                        else if (element instanceof pack.core.AssetPackItem) {
                            const type = element.getType();
                            const webPlugin = phasereditor2d.webContentTypes.WebContentTypesPlugin.getInstance();
                            switch (type) {
                                case pack.core.IMAGE_TYPE:
                                case pack.core.SVG_TYPE:
                                    return new viewers.ImageAssetPackItemCellRenderer();
                                case pack.core.MULTI_ATLAS_TYPE:
                                case pack.core.ATLAS_TYPE:
                                case pack.core.UNITY_ATLAS_TYPE:
                                case pack.core.ATLAS_XML_TYPE: {
                                    return new viewers.AtlasItemCellRenderer();
                                }
                                case pack.core.SPRITESHEET_TYPE:
                                    return new viewers.ImageFrameContainerIconCellRenderer();
                                case pack.core.AUDIO_TYPE:
                                    return this.getIconRenderer(webPlugin.getIcon(phasereditor2d.webContentTypes.ICON_FILE_SOUND));
                                case pack.core.SCRIPT_TYPE:
                                case pack.core.SCENE_FILE_TYPE:
                                    return this.getScriptUrlCellRenderer(element);
                                case pack.core.SCRIPTS_TYPE:
                                    return new controls.viewers.FolderCellRenderer();
                                case pack.core.SCENE_PLUGIN_TYPE:
                                case pack.core.PLUGIN_TYPE:
                                case pack.core.CSS_TYPE:
                                case pack.core.GLSL_TYPE:
                                case pack.core.XML_TYPE:
                                case pack.core.HTML_TYPE:
                                case pack.core.JSON_TYPE:
                                    return this.getIconRenderer(webPlugin.getIcon(phasereditor2d.webContentTypes.ICON_FILE_SCRIPT));
                                case pack.core.TEXT_TYPE:
                                    return this.getIconRenderer(webPlugin.getIcon(phasereditor2d.webContentTypes.ICON_FILE_TEXT));
                                case pack.core.HTML_TEXTURE_TYPE:
                                    return this.getIconRenderer(webPlugin.getIcon(phasereditor2d.webContentTypes.ICON_FILE_IMAGE));
                                case pack.core.BITMAP_FONT_TYPE:
                                    return new viewers.BitmapFontAssetCellRenderer();
                                case pack.core.VIDEO_TYPE:
                                    return this.getIconRenderer(webPlugin.getIcon(phasereditor2d.webContentTypes.ICON_FILE_VIDEO));
                                case pack.core.ANIMATION_TYPE:
                                    return this.getIconRenderer(pack.AssetPackPlugin.getInstance().getIcon(pack.ICON_ANIMATIONS));
                                case pack.core.TILEMAP_CSV_TYPE:
                                case pack.core.TILEMAP_IMPACT_TYPE:
                                case pack.core.TILEMAP_TILED_JSON_TYPE:
                                    return this.getIconRenderer(pack.AssetPackPlugin.getInstance().getIcon(pack.ICON_TILEMAP));
                                default:
                                    break;
                            }
                        }
                        else if (element instanceof controls.ImageFrame) {
                            return new controls.viewers.ImageCellRenderer();
                        }
                        else if (element instanceof pack.core.AnimationConfigInPackItem) {
                            return this.getIconRenderer(pack.AssetPackPlugin.getInstance().getIcon(pack.ICON_ANIMATIONS));
                        }
                        return this.getIconRenderer(ide.Workbench.getWorkbench().getWorkbenchIcon(colibri.ICON_FILE));
                    }
                    getScriptUrlCellRenderer(item) {
                        const file = item.getFileFromAssetUrl(item.getData().url);
                        if (file) {
                            const sceneFile = file.getParent().getFile(file.getNameWithoutExtension() + ".scene");
                            if (sceneFile) {
                                return new viewers.SceneScriptCellRenderer(this._layout);
                            }
                        }
                        return this.getIconRenderer(phasereditor2d.webContentTypes.WebContentTypesPlugin
                            .getInstance().getIcon(phasereditor2d.webContentTypes.ICON_FILE_SCRIPT));
                    }
                    getIconRenderer(icon) {
                        if (this._layout === "grid") {
                            return new controls.viewers.IconGridCellRenderer(icon);
                        }
                        return new controls.viewers.IconImageCellRenderer(icon);
                    }
                    preload(element) {
                        return controls.Controls.resolveNothingLoaded();
                    }
                }
                viewers.AssetPackCellRendererProvider = AssetPackCellRendererProvider;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                class AssetPackGrouping {
                    static setGroupingPreference(groupType) {
                        window.localStorage["phasereditor2d.scene.ui.blocks.SceneEditorBlocksProvider.assetGrouping"] = groupType;
                    }
                    static getGroupingPreference() {
                        return window.localStorage["phasereditor2d.scene.ui.blocks.SceneEditorBlocksProvider.assetGrouping"]
                            || AssetPackGrouping.GROUP_ASSETS_BY_TYPE;
                    }
                    static getItemFolder(item) {
                        const data = item.getData();
                        let file = item.getFileFromAssetUrl(data.url);
                        if (!file) {
                            file = item.getFileFromAssetUrl(data.atlasURL);
                        }
                        if (!file) {
                            file = item.getPack().getFile();
                        }
                        return file.getParent();
                    }
                    static getAssetsFolders(packs) {
                        return [...new Set(packs.flatMap(p => p.getItems())
                                .map(item => this.getItemFolder(item)))]
                            .sort((a, b) => a.getFullName().length - b.getFullName().length);
                    }
                    static fillMenu(menu, callback) {
                        const currentType = this.getGroupingPreference();
                        for (const type of this.GROUP_ASSET_TYPES) {
                            menu.addAction({
                                text: "Group Assets By " + this.GROUP_ASSET_TYPE_LABEL_MAP[type],
                                callback: () => {
                                    this.setGroupingPreference(type);
                                    callback(type);
                                },
                                selected: type === currentType
                            });
                        }
                    }
                }
                AssetPackGrouping.GROUP_ASSETS_BY_TYPE = "type";
                AssetPackGrouping.GROUP_ASSETS_BY_PACK = "pack";
                AssetPackGrouping.GROUP_ASSETS_BY_LOCATION = "location";
                AssetPackGrouping.GROUP_ASSET_TYPES = [
                    AssetPackGrouping.GROUP_ASSETS_BY_TYPE,
                    AssetPackGrouping.GROUP_ASSETS_BY_PACK,
                    AssetPackGrouping.GROUP_ASSETS_BY_LOCATION,
                ];
                AssetPackGrouping.GROUP_ASSET_TYPE_LABEL_MAP = {
                    [AssetPackGrouping.GROUP_ASSETS_BY_TYPE]: "Type",
                    [AssetPackGrouping.GROUP_ASSETS_BY_PACK]: "Asset Pack File",
                    [AssetPackGrouping.GROUP_ASSETS_BY_LOCATION]: "Location"
                };
                viewers.AssetPackGrouping = AssetPackGrouping;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                var io = colibri.core.io;
                const ASSET_PACK_TYPE_DISPLAY_NAME = {
                    image: "Image",
                    svg: "SVG",
                    atlas: "Atlas",
                    atlasXML: "Atlas XML",
                    unityAtlas: "Unity Atlas",
                    multiatlas: "Multiatlas",
                    spritesheet: "Spritesheet",
                    animation: "Animation",
                    bitmapFont: "Bitmap Font",
                    tilemapCSV: "Tilemap CSV",
                    tilemapImpact: "Tilemap Impact",
                    tilemapTiledJSON: "Tilemap Tiled JSON",
                    plugin: "Plugin",
                    sceneFile: "Scene File",
                    scenePlugin: "Scene Plugin",
                    script: "Script",
                    scripts: "Scripts (Predictable Order)",
                    audio: "Audio",
                    audioSprite: "Audio Sprite",
                    video: "Video",
                    text: "Text",
                    css: "CSS",
                    glsl: "GLSL",
                    html: "HTML",
                    htmlTexture: "HTML Texture",
                    binary: "Binary",
                    json: "JSON",
                    xml: "XML"
                };
                class AssetPackLabelProvider {
                    getLabel(obj) {
                        if (obj instanceof io.FilePath) {
                            if (obj.isFolder()) {
                                if (obj.isRoot()) {
                                    return "/";
                                }
                                return obj.getProjectRelativeName().substring(1);
                            }
                        }
                        if (obj instanceof pack.core.AssetPack) {
                            return obj.getFile().getProjectRelativeName().substring(1);
                        }
                        if (obj instanceof pack.core.AssetPackItem) {
                            return obj.getKey();
                        }
                        if (obj instanceof controls.ImageFrame) {
                            if (obj instanceof pack.core.AssetPackImageFrame) {
                                let name = obj.getName().toString();
                                const item = obj.getPackItem();
                                if (item instanceof pack.core.SpritesheetAssetPackItem) {
                                    const len = item.getFrames().length;
                                    if (len > 0) {
                                        const spaces = Math.ceil(Math.log10(len));
                                        while (name.length < spaces) {
                                            name = "0" + name;
                                        }
                                    }
                                }
                                return name;
                            }
                            return obj.getName() + "";
                        }
                        if (obj instanceof pack.core.AnimationConfigInPackItem) {
                            return obj.getKey();
                        }
                        if (obj instanceof pack.core.AnimationFrameConfigInPackItem) {
                            return obj.getFrameKey() !== undefined ?
                                obj.getFrameKey() + " / " + obj.getTextureKey()
                                : obj.getTextureKey();
                        }
                        if (typeof (obj) === "string") {
                            if (obj in ASSET_PACK_TYPE_DISPLAY_NAME) {
                                return ASSET_PACK_TYPE_DISPLAY_NAME[obj];
                            }
                            return obj;
                        }
                        return "";
                    }
                }
                viewers.AssetPackLabelProvider = AssetPackLabelProvider;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class AtlasItemCellRenderer extends controls.viewers.ImageCellRenderer {
                    getImage(obj) {
                        return obj.getThumbnail();
                    }
                    async preload(args) {
                        const container = args.obj;
                        await container.preload();
                        const r1 = container.getThumbnail() ? controls.PreloadResult.NOTHING_LOADED : controls.PreloadResult.RESOURCES_LOADED;
                        const r2 = await container.preloadImages();
                        const result = Math.max(r1, r2);
                        return result;
                    }
                }
                viewers.AtlasItemCellRenderer = AtlasItemCellRenderer;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class BitmapFontAssetCellRenderer {
                    renderCell(args) {
                        const img = this.getImage(args.obj);
                        if (img) {
                            const item = args.obj;
                            const data = item.getFontData();
                            let renderImage = true;
                            if (data && data.chars.size > 0) {
                                renderImage = renderBitmapFontChar(args, "aAbBfF1", data, img);
                            }
                            if (renderImage) {
                                img.paint(args.canvasContext, args.x, args.y, args.w, args.h, false);
                            }
                        }
                    }
                    async preload(args) {
                        const item = args.obj;
                        const result1 = await item.preload();
                        const img = this.getImage(args.obj);
                        if (img) {
                            const result2 = await img.preload();
                            return Math.max(result1, result2);
                        }
                        return controls.Controls.resolveNothingLoaded();
                    }
                    getImage(item) {
                        const url = item.getData().textureURL;
                        const img = pack.core.AssetPackUtils.getImageFromPackUrl(item.getPack(), url);
                        return img;
                    }
                    cellHeight(args) {
                        return args.viewer.getCellSize();
                    }
                }
                viewers.BitmapFontAssetCellRenderer = BitmapFontAssetCellRenderer;
                function renderBitmapFontChar(args, chars, fontData, img) {
                    for (let i = 0; i < chars.length; i++) {
                        const charCode = chars.charCodeAt(i);
                        const charData = fontData.chars.get(charCode);
                        if (charData) {
                            const { x, y, width, height } = charData;
                            img.paintFrame(args.canvasContext, x, y, width, height, args.x, args.y, args.w, args.h);
                            return false;
                        }
                    }
                    return true;
                }
                ;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class ImageAssetPackItemCellRenderer extends controls.viewers.ImageCellRenderer {
                    getImage(obj) {
                        const item = obj;
                        const data = item.getData();
                        return pack.core.AssetPackUtils.getImageFromPackUrl(item.getPack(), data.url);
                    }
                }
                viewers.ImageAssetPackItemCellRenderer = ImageAssetPackItemCellRenderer;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class ImageFrameContainerIconCellRenderer {
                    renderCell(args) {
                        const img = this.getFrameImage(args.obj);
                        if (img) {
                            img.paint(args.canvasContext, args.x, args.y, args.w, args.h, args.center);
                        }
                    }
                    getFrameImage(obj) {
                        const packItem = obj;
                        if (packItem instanceof pack.core.ImageFrameContainerAssetPackItem) {
                            const frames = packItem.getFrames();
                            if (frames.length > 0) {
                                const img = frames[0].getImage();
                                return img;
                            }
                        }
                        return null;
                    }
                    cellHeight(args) {
                        return args.viewer.getCellSize();
                    }
                    async preload(args) {
                        const img = this.getFrameImage(args.obj);
                        if (img) {
                            return img.preload();
                        }
                        return controls.Controls.resolveNothingLoaded();
                    }
                }
                viewers.ImageFrameContainerIconCellRenderer = ImageFrameContainerIconCellRenderer;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var pack;
    (function (pack) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                var controls = colibri.ui.controls;
                class SceneScriptCellRenderer {
                    constructor(layout) {
                        this._layout = layout;
                    }
                    getIconRenderer(icon) {
                        if (this._layout === "grid") {
                            return new controls.viewers.IconGridCellRenderer(icon);
                        }
                        return new controls.viewers.IconImageCellRenderer(icon);
                    }
                    renderCell(args) {
                        const result = this.getSceneFile(args.obj);
                        if (result) {
                            const args2 = args.clone();
                            args2.obj = result.sceneFile;
                            result.renderer.renderCell(args2);
                            return;
                        }
                        const icon = colibri.Platform.getWorkbench().getWorkbenchIcon(colibri.ICON_FILE);
                        const iconRenderer = this.getIconRenderer(icon);
                        iconRenderer.renderCell(args);
                    }
                    getSceneFile(obj) {
                        const file = obj.getFileFromAssetUrl(obj.getData().url);
                        if (file) {
                            const sceneFile = file.getParent().getFile(file.getNameWithoutExtension() + ".scene");
                            if (sceneFile) {
                                const provider = new phasereditor2d.files.ui.viewers.FileCellRendererProvider(this._layout);
                                const renderer = provider.getCellRenderer(sceneFile);
                                return {
                                    renderer: renderer,
                                    sceneFile: sceneFile
                                };
                            }
                        }
                        return null;
                    }
                    async preload(args) {
                        const result = this.getSceneFile(args.obj);
                        if (result) {
                            const args2 = args.clone();
                            args2.obj = result.sceneFile;
                            return result.renderer.preload(args2);
                        }
                        return controls.Controls.resolveNothingLoaded();
                    }
                    cellHeight(args) {
                        return args.viewer.getCellSize();
                    }
                }
                viewers.SceneScriptCellRenderer = SceneScriptCellRenderer;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = pack.ui || (pack.ui = {}));
    })(pack = phasereditor2d.pack || (phasereditor2d.pack = {}));
})(phasereditor2d || (phasereditor2d = {}));
