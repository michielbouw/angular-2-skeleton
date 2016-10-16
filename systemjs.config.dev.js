/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  var map = {
    'app':                                'app',
    'rxjs':                               'scripts/rxjs',
    'zonejs':                             'scripts/zone.js',
    'reflect-metadata':                   'scritps/reflect-metadata',
    'angular-in-memory-web-api':          'scripts/angular-in-memory-web-api',
    '@angular':                           'scripts/@angular'
  };

  var packages = {
    'app':                                { main: 'main', defaultExtension: 'js' },
    'rxjs':                               { defaultExtension: 'js' },
    'zonejs':                             { main: 'zone', defaultExtension: 'js' },
    'reflect-metadata':                   { main: 'Reflect', defaultExtension: 'js' },
    '@angular/core':                      { main: 'bundles/core.umd.js' },
    '@angular/compiler':                  { main: 'bundles/compiler.umd.js' },
    '@angular/common':                    { main: 'bundles/common.umd.js' },
    '@angular/forms':                     { main: 'bundles/forms.umd.js' },
    '@angular/http':                      { main: 'bundles/http.umd.js' },
    '@angular/platform-browser':          { main: 'bundles/platform-browser.umd.js' },
    '@angular/platform-browser-dynamic':  { main: 'bundles/platform-browser-dynamic.umd.js' },
    '@angular/router':                    { main: 'bundles/router.umd.js' }
  };

  System.config({
    map: map,
    packages: packages
  });
})(this);