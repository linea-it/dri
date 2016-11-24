Ext.define('visiomatic.Visiomatic', {
    extend: 'Ext.panel.Panel',

    requires: [
        'visiomatic.VisiomaticModel',
        'visiomatic.VisiomaticController'

    ],

    mixins: {
        interface: 'visiomatic.Interface'
    },

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
            'Y3A1',
            'GALEX_AIS',
            '2MASS',
            'AllWISE',
            'SDSS',
            'PPMXL',
            'Abell',
            'NVSS',
            'FIRST',
            'GAIA_DR1'
        ],

        enableMiniMap: false,
        miniMapOptions: {
            position: 'topright',
            width: 128,
            height: 128,
            zoomLevelOffset: -6,
            nativeCelsys: true
        },
        miniMap: true,

        enableWcs: true,
        wcsUnits: [
            {
                label: 'RA, Dec (Deg)',
                units: 'deg'
            },
            {
                label: 'RA, Dec (HMS)',
                units: 'HMS'
            }
        ],

        enableScale: true,

        image: null,
        imageLayer: null,
        imageOptions: {
            credentials: true,
            center: false,
            fov: false,
            mixingMode: 'color',
            defaultChannel: 2,
            contrast: 0.7,
            gamma: 2.8,
            colorSat: 2.0,
            channelLabelMatch: '[ugrizY]'
        },

        release: null,
        tag: null,
        dataset: null,

        // adicionar uma toolbar
        enableTools: true,
        auxTools: [],

        ////// buttons //////

        // Get Link
        enableLink: true,
        // Shift Visiomatic/Aladin
        enableShift: true,

        ready: false
    },

    bind: {
        release: '{release}',
        tag: '{tag}',
        dataset: '{dataset}'
    },

    initComponent: function () {
        var me = this,
            host = window.location.host,
            tollbar, btns, cmpVisiomatic;

        if (window.L) {
            me.libL  = window.L;

            // Registro do Catalogo
            me.libL.Catalog.Y3A1 = L.extend({}, L.Catalog, {
                name: 'Y3A1',
                attribution: 'Des Y3A1 COADD OBJECT SUMMARY',
                color: 'blue',
                maglim: 24.0,
                service: 'ScienceServer',
                regionType: 'box',
                authenticate: 'csrftoken',
                url: 'http://' + host + '/dri/api/visiomatic/coadd_objects/' +
                '?mime=csv' +
                '&source=Y3A1_COADD_OBJECT_SUMMARY' +
                '&columns=COADD_OBJECT_ID,RA,DEC,MAG_AUTO_G,MAG_AUTO_R,MAG_AUTO_I,MAG_AUTO_Z,MAG_AUTO_Y,A_IMAGE,B_IMAGE,THETA_J2000' +
                '&coordinate={lng},{lat}' +
                '&bounding={dlng},{dlat}' +
                '&maglim={maglim}' +
                '&limit=2000',
                properties: ['MAG_AUTO_G', 'MAG_AUTO_R', 'MAG_AUTO_I', 'MAG_AUTO_Z', 'MAG_AUTO_Y'],
                units: [],
                // objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
                draw: function (feature, latlng) {
                    return L.ellipse(latlng, {
                        majAxis: feature.properties.items[5] / 3600.0,
                        minAxis: feature.properties.items[6] / 3600.0,
                        posAngle: 90 - feature.properties.items[7]
                    });
                }
            });

        } else {
            console.log('window.L ainda nao esta carregada, incluir no app.json a biblioteca Leaflet');
        }

        cmpVisiomatic = Ext.create('Ext.Component', {
            id: me.getMapContainer(),
            width: '100%',
            height: '100%'
        });

        // Toolbar
        if (me.getEnableTools()) {
            tollbar = me.makeToolbar();
            tools = me.makeToolbarButtons();

            tollbar.add(tools);

            me.tbar = tollbar;

        }

        Ext.apply(this, {
            items: [
                cmpVisiomatic
            ]
        });

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


        // Add Events Listeners to Map
        map.on('dblclick', me.onDblClick, me);
        map.on('layeradd', me.onLayerAdd, me);
        map.on('move', me.onMove, me);

        // instancia de L.map
        me.setMap(map);

        ///////// Opcionais /////////

        // Sidebar
        if (me.getEnableSidebar()) {
            me.createSidebar();
        }

        // Wcs Control
        if (me.getEnableWcs()) {
            me.addWcsController();
        }

        if (me.getEnableScale()) {
            me.addScaleController();
        }

    },

    onResize: function () {
        this.callParent(arguments);
        var map = this.getMap();
        if (map) {
            map.invalidateSize();
        }
    },

    getMapContainer: function () {

        return this.getId() + '-placeholder';
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

        // Region
        libL.control.iip.region(
            [
            ]
        ).addTo(sidebar);

        // Profile Overlays
        libL.control.iip.profile().addTo(sidebar);

        sidebar.addTabList();

    },

    addWcsController: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            units = me.getWcsUnits();

        libL.control.wcs({
            coordinates: units,
            position: 'topright'
        }).addTo(map);
    },

    addScaleController: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap();

        libL.control.scale.wcs({pixels: false}).addTo(map);
    },

    setImage: function (image, options) {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            miniMap = me.getMiniMap(),
            imageLayer = me.getImageLayer(),
            imageOptions = me.getImageOptions(),
            args,
            navlayer,
            newImageLayer;

        me.setReady(false);

        options = options || {};

        me.image = image;

        args = Ext.Object.merge(imageOptions, options);

        if (!imageLayer) {
            imageLayer = libL.tileLayer.iip(image, args).addTo(map);

            me.setImageLayer(imageLayer);

        } else {
            me.removeImageLayer();

            newImageLayer = libL.tileLayer.iip(image, args).addTo(map);

            me.setImageLayer(newImageLayer);
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
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            latlng;

        latlng = libL.latLng(dec, ra);
        map.setView(latlng, map.options.crs.fovToZoom(map, fov, latlng));
    },

    onLayerAdd: function (e) {
        var me = this;
        if (e.layer.type === 'tilelayer') {
            me.setReady(true);

            me.fireEvent('changeimage', me);
        }

    },

    onDblClick: function () {
        var me = this,
            map = me.getMap();

        me.fireEvent('dblclick', me);
    },

    removeImageLayer: function () {
        var me = this,
            map = me.getMap(),
            imageLayer = me.getImageLayer();

        map.removeLayer(imageLayer);

    },

    getRaDec: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            wcs = map.options.crs,
            latlng = map.getCenter();

        return {
            'ra': parseFloat(latlng.lng),
            'dec': parseFloat(latlng.lat)
        };

    },

    getFov: function () {
        var me = this,
            map = me.getMap(),
            wcs = map.options.crs,
            latlng = map.getCenter(),
            fov;

        fov = wcs.zoomToFov(map, map.getZoom(), latlng);

        return fov;
    },

    onMove: function () {
        var me = this,
            radec = me.getRaDec(),
            fov = me.getFov();

        me.fireEvent('changeposition', radec, fov, me);
    },

    getLinkToPosition: function () {
        var me = this,
            map = me.getMap(),
            coordinate = me.getRaDec(),
            fov = me.getFov(),
            coord;

        if (coordinate.dec > 0) {
            coord = coordinate.ra.toFixed(3).replace('.', ',') + '+' + coordinate.dec.toFixed(3).replace('.', ',');
        } else {
            coord = coordinate.ra.toFixed(3).replace('.', ',') + coordinate.dec.toFixed(3).replace('.', ',');
        }

        if (fov) {
            fov = fov.toFixed(2).replace('.', ',');
        }

        me.fireEvent('link', encodeURIComponent(coord), fov, coordinate, me);
    },

    onShift: function () {
        this.fireEvent('shift', this.getRaDec(), this);

    },

    isReady: function () {
        return this.getReady();

    }

});
