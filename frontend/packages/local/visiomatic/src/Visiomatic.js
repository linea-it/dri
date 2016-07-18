Ext.define('visiomatic.Visiomatic', {
    extend: 'Ext.container.Container',

    requires: [
        'visiomatic.VisiomaticModel',
        'visiomatic.VisiomaticController'
    ],

    xtype: 'visiomatic',

    controller: 'visiomatic',

    viewModel: 'visiomatic',

    // id: 'visiomatic_panel',

    height: '100%',

    width: '100%',

    /**
     * Instancia da biblioteca Leaflet window.L
     */
    libL: null,

    config: {

        map: null,
        mapOptions: {
            fullscreenControl: true,
            zoom: 1
        },

        prefix: 'Dark Energy Survey @ 2016 NCSA/LIneA',

        enableSidebar: true,

        // Catalog Overlays
        enableCatalogs: true,
        availableCatalogs: [
            'GALEX_AIS',
            'SDSS',
            '2MASS',
            'AllWISE',
            'NVSS',
            'FIRST'
        ],

        enableMiniMap: false,
        miniMapOptions: {
            position: 'topright',
            width: 128,
            height: 128,
            zoomLevelOffset: -6,
            nativeCelsys: true
        },
        miniMap: false,

        image: null,
        imageLayer: null,
        imageOptions: {
            center: false,
            fov: false,
            mixingMode: 'color',
            defaultChannel: 2,
            contrast: 0.7,
            gamma: 2.8,
            colorSat: 2.0
        },

        release: null,
        tag: null,
        dataset: null
    },

    bind: {
        release: '{release}',
        tag: '{tag}',
        dataset: '{dataset}'
    },

    // listeners: {
    //     afterrender: 'onAfterRender',
    //     click: 'testando'
    // },

    initComponent: function () {
        var me = this;

        if (window.L) {
            me.libL  = window.L;
        } else {
            console.log('window.L ainda nao esta carregada, incluir no app.json a biblioteca Leaflet');
        }

        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this,
            libL = me.libL,
            mapContainer = me.getMapContainer(),
            mapOptions = me.getMapOptions(),
            map;

        me.callParent(arguments);

        // Criar uma instacia de L.Map
        map = libL.map(mapContainer, mapOptions);

        // set Prefix
        map.attributionControl.setPrefix(me.getPrefix());

        // Add a Reticle to Map
        libL.control.reticle().addTo(map);

        // instancia de L.map
        me.setMap(map);

        ///////// Opcionais /////////

        // Sidebar
        if (me.getEnableSidebar()) {
            me.createSidebar();
        }

    },

    getMapContainer: function () {

        return this.getId();
    },

    createSidebar: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            availableCatalogs = me.getAvailableCatalogs(),
            sidebar,
            catalogs = [];

        sidebar = libL.control.sidebar().addTo(map);

        // Channel Mixing
        libL.control.iip.channel().addTo(sidebar);

        // Image Preference
        libL.control.iip.image().addTo(sidebar);

        // Catalog Overlays
        Ext.Array.each(availableCatalogs, function (value) {
            catalogs.push(
                libL.Catalog[value]
            );
        });

        libL.control.iip.catalog(catalogs).addTo(sidebar);

        // Profile Overlays
        libL.control.iip.profile().addTo(sidebar);

        sidebar.addTabList();

    },

    setImage: function (image, options) {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            miniMap = me.getMiniMap(),
            imageLayer = me.getImageLayer(),
            imageOptions = me.getImageOptions(),
            args,
            navlayer;

        options = options || {};

        me.image = image;

        console.log(image);

        args = Ext.Object.merge(imageOptions, options);

        // SETAR COORDENADAS PROCURAR POR ESSA FUNCAO
        // var latlng = newcrs.parseCoords(this.options.center);
        // usar o map.setView passando a latlog

        if (!imageLayer) {
            imageLayer = libL.tileLayer.iip(image, args).addTo(map);

            me.setImageLayer(imageLayer);

        } else {
            imageLayer.setUrl(image);
        }

        // Mini Map
        if (me.getEnableMiniMap()) {
            if (!miniMap) {
                // se nao existir minimap cria
                me.createMiniMap();

            } else {
                navlayer = libL.tileLayer.iip(image, {});
                miniMap.changeLayer(navlayer);
            }
        }

        me.fireEvent('changeimage', me);
    },

    createMiniMap: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            navoptions = me.getMiniMapOptions(),
            image = me.getImage(),
            miniMap,
            navlayer;

        if (image) {
            navlayer = libL.tileLayer.iip(image, {});

            miniMap = libL.control.extraMap(navlayer, navoptions).addTo(map);

            me.setMiniMap(miniMap);
        }
    },

    setView: function (ra, dec, fov) {
        console.log('setView(%o, %o, %o)', ra, dec, fov);
        // var me = this,
        //     imageLayer = me.getImageLayer(),
        //     wcs = imageLayer.wcs,
        //     center = Ext.String.format('{0} {1}', ra, dec),
        //     latlng;

        // console.log(imageLayer);
        // console.log(imageLayer.wcs);
        // console.log(wcs);

        // latlng = wcs.parseCoords(center);

        // console.log('latlng: %o', latlng);
    }

});
