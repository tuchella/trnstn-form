const fs = require('fs');
const fse = require('fs-extra');
const path = require('path')

const PATH_TO_KIRBY = "../kirby";

function build() {

    const buildDir = path.join(__dirname, "build/plugin");
    
    if (!fs.existsSync(buildDir)){
        fs.mkdirSync(buildDir, { recursive: true });
    } else {
        fse.emptyDirSync(buildDir);
    }
    
    const assetsDir = path.join(buildDir, "assets");
    fs.mkdirSync(assetsDir);
    fse.copySync(path.join(__dirname, "dist"), assetsDir, (src, dest) => {
        // exclude the index.html file
        return src != path.join(__dirname, "dist/index.html");
    });
    fse.copySync(path.join(__dirname, "dist/index.html"), path.join(buildDir, "templates/form.php"));
    fse.copySync(path.join(__dirname, "src/kirby"), buildDir);
    
    if (fs.existsSync(path.join(__dirname, PATH_TO_KIRBY))) {
        const pluginDir = path.join(__dirname, PATH_TO_KIRBY, "site/plugins/trnstnform");
        fse.emptyDirSync(pluginDir);
        fse.copySync(buildDir, pluginDir);
        console.log(buildDir + " -> " + pluginDir);
    }
}

    
if (require.main === module) {
    build();
} else {
    const buildDir = path.join(__dirname, "build/plugin");
    console.log(buildDir);
    module.exports = { build };
}
