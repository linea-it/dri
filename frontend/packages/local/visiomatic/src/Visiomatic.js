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
        miniMap: null,

        image: null,

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

    setImage: function (image, args) {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            miniMap = me.getMiniMap(),
            imageLayer, navlayer;

        args = args || {};

        me.image = image;

        imageLayer = libL.tileLayer.iip(image, {
            center: args['center'] ? args['center'] : false,
            fov: args['fov'] ? parseFloat(args['fov']) : false,
            mixingMode: args['mode'] ? args['mode'] : 'color',
            defaultChannel: args['channel'] ? parseInt(args['channel'], 10) : 2,
            contrast: 0.7,
            gamma: 2.8,
            colorSat: 2.0
        }).addTo(map);


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

    },

    createMiniMap: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            navoptions = me.getMiniMapOptions(),
            image = me.getImage(),
            navmap,
            navlayer;

        if (image) {
            navlayer = libL.tileLayer.iip(image, {});

            navmap = libL.control.extraMap(navlayer, navoptions).addTo(map);
        }
    }

});
