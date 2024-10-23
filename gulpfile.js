const { src, dest, series, parallel } = require("gulp");
const del = require("del");
const fs = require("fs");
const log = require("fancy-log");
var exec = require("child_process").exec;

const paths = {
    prod_build: "prod-build",
    angular_src: "dist/client/browser/**/*",
    angular_dist: "prod-build/client",
    api_src: "api/dist/**/*",
    api_dist: "prod-build/api",
    dockerfile: "Dockerfile",
    package_json: "api/package.json",
    package_lock_json: "api/package-lock.json",
};

function clean() {
    log("removing the old files in the directory");
    return del("prod-build/**", { force: true });
}

function createProdBuildFolder() {
    const dir = paths.prod_build;
    log(`Creating the folder if not exist  ${dir}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        log("📁  folder created:", dir);
    }

    return Promise.resolve("the value is ignored");
}

function buildAngularCodeTask(cb) {
    log("building Angular code into the directory");
    return exec(
        "cd client && npm run build-prod",
        function (err, stdout, stderr) {
            log(stdout);
            log(stderr);
            cb(err);
        }
    );
}

function buildNestJsCodeTask(cb) {
    log("building NestJs code into the directory");
    return exec(
        "cd api && npm run build",
        function (err, stdout, stderr) {
            log(stdout);
            log(stderr);
            cb(err);
        }
    );
}

function copyAngularCodeTask() {
    log("copying Angular code into the directory");
    return src(`${paths.angular_src}`).pipe(dest(`${paths.angular_dist}`));
}

function copyNestJSCodeTask() {
    log("building and copying server code into the directory");
    return src(`${paths.api_src}`).pipe(dest(`${paths.api_dist}`));
}

function copyDockerfile() {
    log("copying Dockerfile");
    return src(`${paths.dockerfile}`).pipe(dest(`${paths.prod_build}`));
}

function copyPackageJson() {
    log("copying Package.json");
    return src(`${paths.package_json}`).pipe(dest(`${paths.prod_build}`));
}

function copyPackageLockJson() {
    log("copying Package-lock.json");
    return src(`${paths.package_lock_json}`).pipe(dest(`${paths.prod_build}`));
}

function buildDockerImage(cb) {
    log("building docker image");
    return exec(
        "cd prod-build && docker build . -t polklabs/boardgame-lol",
        function (err, stdout, stderr) {
            log(stdout);
            log(stderr);
            cb(err);
        }
    );
}

exports.default = series(
    clean,
    createProdBuildFolder,
    buildAngularCodeTask,
    buildNestJsCodeTask,
    parallel(
        copyAngularCodeTask,
        copyNestJSCodeTask,
        copyDockerfile,
        copyPackageJson,
        copyPackageLockJson
    ),
    buildDockerImage
);
