

(function(global) {
	// map tells the System loader where to look for things
	var map = {
		"app":                        "dist/client/scripts", // "dist",
		"css":                        "node_modules/systemjs-plugin-css/css.js",
		"@angular":                   "node_modules/@angular",
		"rxjs":                       "node_modules/rxjs",
		"moment":                     "node_modules/moment",
		"ts-helpers":				  "node_modules/ts-helper",
		"bootstrap-daterangepicker":  "node_modules/bootstrap-daterangepicker",
		"@swimlane/ngx-datatable":    "node_modules/@swimlane/ngx-datatable",
		"ng2-file-upload":            "node_modules/ng2-file-upload",
		"ng2-daterangepicker":        "node_modules/ng2-daterangepicker/src/app/daterangepicker",
		"ng2-bs3-modal":              "node_modules/ng2-bs3-modal",
		"ng2-window-view":            "node_modules/ng2-window-view",
		"jquery":                     "node_modules/jquery",
		"bootstrap":                  "node_modules/bootstrap",
		"echarts":                    "node_modules/echarts"
	};
	// packages tells the System loader how to load when no filename and/or no extension
	var packages = {
		"app":                        { main: "entry.js", defaultExtension: "js" },
		"jquery":                     { main: "dist/jquery.min.js", defaultExtension: "js" },
		"echarts":                    { main: "dist/echarts.min.js", defaultExtension: "js" },
		"bootstrap":                  { main: "dist/js/bootstrap.min.js", defaultExtension: "js" },
		"rxjs":                       { defaultExtension: "js" },
		"moment":                     { main: "moment.js", defaultExtension: "js" },
		"ts-helpers":                 { main: "index.js", defaultExtension: "js" },
		"bootstrap-daterangepicker":  { main: "daterangepicker.js", defaultExtension: "js" },
		"@swimlane/ngx-datatable":    { main: "release/index.js", defaultExtension: "js" },
		"ng2-file-upload":            { main: "index.js",  defaultExtension: "js" },
		"ng2-daterangepicker":        { main: "index.js" },
		"ng2-bs3-modal":              { main: "bundles/ng2-bs3-modal.min.js",  defaultExtension: "js" },
		"ng2-window-view":            { main: "index.js",  defaultExtension: "js" },
	};
	var ngPackageNames = [
		"common",
		"compiler",
		"core",
		"forms",
		"http",
		"platform-browser",
		"platform-browser-dynamic",
		"router",
		"router-deprecated",
		"upgrade"
	];
	// Individual files (~300 requests):
	function packIndex(pkgName) {
		packages["@angular/"+ pkgName] = { main: "index.js", defaultExtension: "js" };
	}
	// Bundled (~40 requests):
	function packUmd(pkgName) {
		packages["@angular/"+ pkgName] = { main: "bundles/" + pkgName + ".umd.js", defaultExtension: "js" };
	}
	// Most environments should use UMD; some (Karma) need the individual index files
	var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
	// Add package entries for angular packages
	ngPackageNames.forEach(setPackageConfig);
	var config = {
		baseURL:"/",
		map: map,
		packages: packages,
		meta: {
			"*.css": { loader: "css" }
		}
	};
	System.config(config);
})(this);