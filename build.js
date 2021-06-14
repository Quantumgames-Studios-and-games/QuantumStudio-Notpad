const download = require("download");
const child_process = require("child_process");
const os = require("os");
const rimraf = require("rimraf");

async function main() {

    console.log("Cleaning folders");
    rimraf.sync("editor");
    rimraf.sync("develop");

    const ver = "3.14.0";
    const platform = { "win32": "windows", "darwin": "macos", "linux": "linux" }[os.platform()];
    const installZipUrl = `https://updates.phasereditor2d.com/v${ver}/PhaserEditor2D-${ver}-${platform}.zip`;
    console.log(`Fetching ${installZipUrl}`);
    await download(installZipUrl, "editor", { extract: true });

    const srcZipUrl = "https://github.com/PhaserEditor2D/PhaserEditor2D-v3/archive/develop.zip";
    console.log(`Fetching ${srcZipUrl}`);
    await download(srcZipUrl, "develop", { extract: true });

    console.log("Building Phaser Editor 2D workbench");
    child_process.execSync("npm run tsc develop/PhaserEditor2D-v3-develop/source/editor");

    console.log();
    console.log("Done! Now you can launch the editor with this command:");
    console.log();
    console.log("\tnpm run PhaserEditor2D");
    console.log();
}

main();

