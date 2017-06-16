/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('visiomatic.VisiomaticController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.visiomatic'



    // onAfterRender: function (sender, record) {

    //     console.log(L);
    //     zoom = 1;
    //     args = {};
    //     var map = L.map(
    //         'visiomatic_panel',
    //         {
    //             fullscreenControl: true,
    //             zoom: zoom
    //         }
    //     );

    //     map.attributionControl.setPrefix('Dark Energy Survey @ 2016 NCSA/LIneA');

    //     var host = 'http://desportal.cosmology.illinois.edu';
    //     var iip = host + '/visiomatic?FIF=data/releases/y1_supplemental_d04/images/visiomatic/DES0959%2B0126.ptif',
    //     layer = L.tileLayer.iip(iip, {
    //         center: args['center'] ? args['center'] : false,
    //         fov: args['fov'] ? parseFloat(args['fov']) : false,
    //         mixingMode: args['mode'] ? args['mode'] : 'color',
    //         defaultChannel: args['channel'] ? parseInt(args['channel'], 10) : 2,
    //         contrast: 0.7,
    //         gamma: 2.8,
    //         colorSat: 2.0,
    //         channelColors: [[0,0,1],[0,1,1],[0,1,0],[1,1,0],[1,0,0]]
    //     }).addTo(map);

    //     L.control.scale.wcs({pixels: false}).addTo(map);

    //     L.control.reticle().addTo(map);

    //     var wcsControl = L.control.wcs({
    //         coordinates: [{label: 'RA,Dec', units: 'HMS'}],
    //         position: 'topright'
    //     }).addTo(map);

    //     var navlayer = L.tileLayer.iip(iip, {
    //         channelColors: [,[0,0,1],[0,1,0],[1,0,0]]
    //     });

    //     var navmap = L.control.extraMap(navlayer, {
    //         position: 'topright',
    //         width: 128,
    //         height: 128,
    //         zoomLevelOffset: -6,
    //         nativeCelsys: true
    //     }).addTo(map);

    //     var sidebar = L.control.sidebar().addTo(map);

    //     L.control.iip.channel().addTo(sidebar);
    //     L.control.iip.image().addTo(sidebar);
    //     L.control.iip.catalog([
    //         L.Catalog['GALEX_AIS'],
    //         L.Catalog['SDSS'],
    //         L.Catalog['2MASS'],
    //         L.Catalog['AllWISE'],
    //         L.Catalog['NVSS'],
    //         L.Catalog['FIRST']
    //     ]).addTo(sidebar);


    //     // L.marker( [35.500, +36.80] ).addTo(map);
    //     // L.circle([47, +29], 1000000).addTo(map);
    //     L.circleMarker([47, +29], 1000000).addTo(map);
    //     var latlng = L.latLng(47, +29);
    //     L.circleMarker(latlng, 1000000).addTo(map);
    //     L.control.iip.profile().addTo(sidebar);
    //     sidebar.addTabList();
    // }

});
