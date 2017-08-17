Ext.define('visiomatic.Visiomatic', {
    extend: 'Ext.panel.Panel',

    requires: [
        'visiomatic.VisiomaticModel',
        'visiomatic.VisiomaticController',
        'visiomatic.catalog.CatalogOverlayWindow'
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
            zoom: 1,
            enableLineaOverlay: true
        },

        prefix: '',

        enableSidebar: true,

        // Catalog Overlays
        enableCatalogs: true,
        availableCatalogs: [
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
        miniMap: null, //true,

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

        // Draw Radius Path Options http://leafletjs.com/reference-1.0.3.html#path
        radiusOptions: {
            weight: 2, //largura da borda em pixel
            opacity: 0.8, // transparencia da borda
            fillOpacity: 0.01, // Transparencia nos marcadores.
            color: '#2db92d', //Stroke color
            dashArray: '5, 5, 1, 5', //A string that defines the stroke dash pattern.
            interactive: false
        },

        // Draw Catalog Path Options http://leafletjs.com/reference-1.0.3.html#path
        catalogOptions: {
            weight: 2, //largura da borda em pixel
            opacity: 0.8, // transparencia da borda
            fillOpacity: 0.01, // Transparencia nos marcadores.
            color: '#2db92d', //Stroke color
            interactive: true,
            radius: 0.001 // radius do marker circulo em graus
        },

        // Draw Crosshair Path Options http://leafletjs.com/reference-1.0.3.html#path
        crosshairOptions: {
            color: '#90FA3A',
            weight: 1,
            opacity: 0.8,
            smoothFactor: 1,
            centerPadding: 0.005, // Deg
            size: 0.010 // Deg
        },

        release: null,
        tag: null,
        // Dataset e o id de um dataset
        dataset: null,
        // CurrentDataset e uma instancia completa do model common.model.Dataset
        currentDataset: null,

        // adicionar uma toolbar
        enableTools: true,
        auxTools: [],

        ////// buttons //////

        // Get Link
        enableLink: true,
        // Shift Visiomatic/Aladin
        enableShift: true,

        ready: false,

        // Layer usada para exibir ou ocultar o raio de um cluster
        lradius: null,

        // Layer usada para exibir ou ocultar a crosshair
        lcrosshair: null,

        showCrosshair: false,

        mlocate:''
    },

    _winCatalogOverlay: null,

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

//            // Registro do Catalogo
//            me.libL.Catalog.Y3A1 = me.libL.extend({}, me.libL.Catalog, {
//                name: 'Y3A1',
//                attribution: 'Des Y3A1 COADD OBJECT SUMMARY',
//                color: 'blue',
//                maglim: 23.0,
//                service: 'ScienceServer',
//                regionType: 'box',
//                authenticate: 'csrftoken',
//                url: 'http://' + host + '/dri/api/visiomatic/coadd_objects/' +
//                '?mime=csv' +
//                '&source=Y3A1_COADD_OBJECT_SUMMARY' +
//                '&columns=coadd_object_id,ra,dec,mag_auto_g,mag_auto_r,mag_auto_i,mag_auto_z,mag_auto_y,a_image,b_image,theta_j2000' +
//                '&coordinate={lng},{lat}' +
//                '&bounding={dlng},{dlat}' +
//                '&maglim={maglim}' +
//                '&limit=2000',
//                properties: ['mag_auto_g', 'mag_auto_r', 'mag_auto_i', 'mag_auto_z', 'mag_auto_y'],
//                units: [],
//                objurl: 'http://' + host + '/dri/apps/explorer/#coadd/Y3A1_COADD_OBJECT_SUMMARY/{id}',
//                draw: function (feature, latlng) {
//                    return me.libL.ellipse(latlng, {
//                        majAxis: feature.properties.items[5] / 3600.0,
//                        minAxis: feature.properties.items[6] / 3600.0,
//                        posAngle: 90 - feature.properties.items[7],
//                        // Path Options http://leafletjs.com/reference-1.0.3.html#path
//                        weight: 1, //largura da borda em pixel
//                        opacity: 0.5, // transparencia da borda
//                        fillOpacity: 0.01 // Transparencia nos marcadores.
//                    });
//                }
//            });
//
//            me.libL.Catalog.Y1A1 = me.libL.extend({}, me.libL.Catalog, {
//                name: 'Y1A1',
//                attribution: 'Des Y1A1 COADD OBJECT',
//                color: 'blue',
//                maglim: 23.0,
//                service: 'ScienceServer',
//                regionType: 'box',
//                authenticate: 'csrftoken',
//                url: 'http://' + host + '/dri/api/visiomatic/coadd_objects/' +
//                '?mime=csv' +
//                '&source=y1a1_coadd_objects' +
//                '&columns=coadd_objects_id,ra,dec,mag_auto_g,mag_auto_r,mag_auto_i,mag_auto_z,mag_auto_y,a_image,b_image,theta_image' +
//                '&coordinate={lng},{lat}' +
//                '&bounding={dlng},{dlat}' +
//                '&maglim={maglim}' +
//                '&limit=2000',
//                properties: ['mag_auto_g', 'mag_auto_r', 'mag_auto_i', 'mag_auto_z', 'mag_auto_y'],
//                units: [],
//                objurl: 'http://' + host + '/dri/apps/explorer/#coadd/y1a1_coadd_objects/{id}',
//                draw: function (feature, latlng) {
//                    return me.libL.ellipse(latlng, {
//                        majAxis: feature.properties.items[5] / 3600.0,
//                        minAxis: feature.properties.items[6] / 3600.0,
//                        posAngle: feature.properties.items[7],
//                        // Path Options http://leafletjs.com/reference-1.0.3.html#path
//                        weight: 1, //largura da borda em pixel
//                        opacity: 0.5, // transparencia da borda
//                        fillOpacity: 0.01 // Transparencia nos marcadores.
//                    });
//                }
//            });

        } else {
            console.log('window.L ainda nao esta carregada, incluir no app.json a biblioteca Leaflet');
        }
        this.cmpVisiomatic = cmpVisiomatic = Ext.create('Ext.Component', {
            id: me.getMapContainer(),
            width: '100%',
            height: '100%',
            listeners: {
                deactivate: me.onDeactivate
            }
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
                cmpVisiomatic,
                //me.cmpMousePosition
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
        map.on('contextmenu', me.onContextMenuClick, me);
        map.on('layeradd', me.onLayerAdd, me);
        map.on('move', me.onMove, me);
        map.on('mousemove', me.onMouseMove, me);
        map.on('overlaycatalog', me.showCatalogOverlayWindow, me);
        map.on('mouseup', me.savePreferences, me);
        map.on('keypress', me.savePreferences, me);

        // instancia de L.map
        me.setMap(map);

        ///////// Opcionais /////////

        // Sidebar
        if (me.getEnableSidebar()) {
            me.createSidebar();
        }

        // Wcs Control
        if (me.getEnableWcs()) {
            // OBS: O controle de Copy Clipboard esta escondigo pelo css
            me.addWcsController();
        }

        if (me.getEnableScale()) {
            me.addScaleController();
        }

        me.cmpMousePosition = me.makeMousePosition();
    },

    savePreferences: function () {
        var me= this,
            imageLayer = me.getImageLayer();

        var imageOptions = {
              credentials: true,
              channelLabelMatch: "[ugrizY]",
              mixingMode: imageLayer.iipMode,
              contrast: imageLayer.iipContrast,
              gamma: imageLayer.iipGamma,
              invertCMap: imageLayer.iipInvertCMap,
              colorSat: imageLayer.iipColorSat,
              quality: imageLayer.iipQuality,
        }

        localStorage.removeItem("imageOptions")

        localStorage.setItem(
            "imageOptions",
            JSON.stringify(imageOptions)
        );
    },

    onResize: function () {
        this.callParent(arguments);
        var map = this.getMap();
        if (map) {
            map.invalidateSize();
        }
    },

    onDeactivate: function () {
        console.log('onDeactivate');

        var me = this;

        // Fechar a Janela de Overlay Catalogs caso ela esteja aberta
        if (me._winCatalogOverlay) {
            me._winCatalogOverlay.close();

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

        libL.control.iip.snapshot().addTo(sidebar);

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

    setCurrentDataset: function (currentDataset) {
        var me = this;

        me.currentDataset = currentDataset;

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

        if (imageLayer) {
              imageOptions = {
                  credentials: true,
                  channelLabelMatch: "[ugrizY]",
                  mixingMode: imageLayer.iipMode,
                  contrast: imageLayer.iipContrast,
                  gamma: imageLayer.iipGamma,
                  invertCMap: imageLayer.iipInvertCMap,
                  colorSat: imageLayer.iipColorSat,
                  quality: imageLayer.iipQuality,
            }
        }

        args = Ext.Object.merge(imageOptions, options);

        me.image = image;

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

    setView: function (ra, dec, fov, dontMoveCrosshair) {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            latlng;

        ra = parseFloat(parseFloat(ra).toFixed(3));
        dec = parseFloat(parseFloat(dec).toFixed(3));

        latlng = libL.latLng(dec, ra);
        map.setView(latlng, map.options.crs.fovToZoom(map, fov, latlng));

        if (me.getShowCrosshair()) {

            if (!dontMoveCrosshair) {
                me.drawCrosshair(ra, dec);
            }

        }
    },

    onLayerAdd: function (e) {
        var me = this;
        if (e.layer.type === 'tilelayer') {
            me.setReady(true);

            me.fireEvent('changeimage', me);
        }

    },

    onDblClick: function (event) {
        var me = this;

        me.fireEvent('dblclick', event, me);
    },

    onContextMenuClick: function (event) {
        var me = this,
            map = me.getMap();

        //evita chamar showContextMenu novamente, já foi chamada no evento contextmenu do objeto
        if (!me.isObjectContextMenu){
            me.showContextMenuImage(event);
        }
        me.isObjectContextMenu = false;

        //console.log('onContextMenuClick(%o)', event);
    },

    removeImageLayer: function () {
        var me = this,
            map = me.getMap();
        // imageLayer = me.getImageLayer();

        if (map !== null) {
            // map.removeLayer(imageLayer);

            // remover todas as layer
            map.eachLayer(function (layer) {
                    map.removeLayer(layer);
                }
            );
        }

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

    /**
     * Retonar a posicao central e a distancia entre o centro e a borda
     * o valor de bound e a distancia inteira.
     */
    getBounds: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            wcs = map.options.crs,
            sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    center = sysflag ? wcs.celsysToEq(map.getCenter()) : map.getCenter(),
		    lngfac = Math.abs(Math.cos(center.lat * Math.PI / 180.0)),
		    b = map.getPixelBounds(),
		    z = map.getZoom(),
            c, lng, lat, dlng, dlat, box;

        // Compute the search cone
        c = sysflag ?
              [wcs.celsysToEq(map.unproject(b.min, z)),
              wcs.celsysToEq(map.unproject(libL.point(b.min.x, b.max.y), z)),
              wcs.celsysToEq(map.unproject(b.max, z)),
              wcs.celsysToEq(map.unproject(libLpoint(b.max.x, b.min.y), z))] :
                        [map.unproject(b.min, z),
                         map.unproject(libL.point(b.min.x, b.max.y), z),
                         map.unproject(b.max, z),
                         map.unproject(libL.point(b.max.x, b.min.y), z)];

        lng = parseFloat(center.lng.toFixed(6));
        lat = parseFloat(center.lat.toFixed(6));

        // CDS box search
        dlng = (Math.max(wcs._deltaLng(c[0], center),
                               wcs._deltaLng(c[1], center),
                               wcs._deltaLng(c[2], center),
                               wcs._deltaLng(c[3], center)) -
                    Math.min(wcs._deltaLng(c[0], center),
                               wcs._deltaLng(c[1], center),
                               wcs._deltaLng(c[2], center),
                               wcs._deltaLng(c[3], center))) * lngfac;

        dlat = Math.max(c[0].lat, c[1].lat, c[2].lat, c[3].lat) -
              Math.min(c[0].lat, c[1].lat, c[2].lat, c[3].lat);

        if (dlat < 0.0001) {
            dlat = 0.0001;
        }
        if (dlng < 0.0001) {
            dlng = 0.0001;
        }

        return {
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
            dlat: parseFloat(dlat.toFixed(6)),
            dlng: parseFloat(dlng.toFixed(6))
        }
    },

    /**
     * Retorna um box composto pela coordenada superior e inferior. da area visivel no mapa
     * [[upper right ra, upper right dec], [lower left ra, lower left dec]]
     * Dividir o bounding por 2 para ter o valor do raio.
     * lng = RA, lat = Dec
     */
    getBox: function () {
        var me = this,
            box, urra, urdec, llra, lldec, ur, ll;

        bounding = me.getBounds();

        urra = parseFloat(bounding.lng + bounding.dlng/2).toFixed(6)
        urdec = parseFloat(bounding.lat + bounding.dlat/2).toFixed(6)
        llra = parseFloat(bounding.lng - bounding.dlng/2).toFixed(6)
        lldec = parseFloat(bounding.lat - bounding.dlat/2).toFixed(6)

        ur = [urra, urdec];
        ll = [llra, lldec];

        box = [ ur, ll ];

        // Debugar o Box, desenha um retangulo representando a area visivel
        // ldebugbox = me.drawRectangle(ur, ll, {color: '#1dff00', weight: 5});

        return box;
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

    onMouseMove: function (event) {
        var pos = String(event.latlng.lng.toFixed(5) + ', ' + event.latlng.lat.toFixed(5)),
            me = this,
            map = me.getMap();

        this.cmpMousePosition.children[0].innerHTML = 'Mouse RA, Dec ('+(pos)+')';

        me.currentPosition = {
            radec: [
                event.latlng.lng.toFixed(5),
                event.latlng.lat.toFixed(5)
            ],
            container: [
                event.containerPoint.x,
                event.containerPoint.y
            ]
        };

        if (me.cropInit && me.cropInit == me.cropEnd) {
            if (me.cropRectangle) {
                map.removeLayer(me.cropRectangle);
            }

            me.cropRectangle = me.drawRectangle(
                me.cropInit['radec'],
                me.currentPosition['radec']
            );
        }

        //me.fireEvent('changemouseposition', event, me);
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
    },

    /**
     * Define a posição do centro
     * @param value String lat, lng ou h:m:s h:m:s
     */
    panTo: function(value){
        var map = this.getMap();

        this.coordinatesToLatLng(value, function(latlng){
            if (latlng) map.panTo(latlng);
        })
    },

    coordinatesToLatLng: function(value, fn){
        visiomatic.Visiomatic.coordinatesToLatLng(value, fn);
    },

    hmsToLatLng: function(value, fn){
        visiomatic.Visiomatic.hmsToLatLng(value, fn);
    },

    /**
     * Essa funcao e usada para densenhar o raio de um cluster
     * ela esta separa para que o raio possa ser manipulado
     * independente dos demais overlays
     *
     */
    drawRadius: function (ra, dec, radius, unit, options) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            wcs = map.options.crs,
            radiusOptions = me.getRadiusOptions(),
            id = ra + '_' + dec,
            path_options,
            lradius, args;

        if (me.getLradius()) {
            map.removeLayer(me.getLradius());
            me.setLradius(null);
        }

        args = Ext.Object.merge(radiusOptions, options);

        // Conversao de unidades
        if (unit === 'arcmin') {
            // Se estiver em minutos de arco dividir por 60
            radius = radius / 60;
        }
        // TODO adicionar outras unidades

        var features = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    id: id,
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: [ra, dec]
                    }
                }
            ]
        };

        lradius = l.geoJson(features, {
            coordsToLatLng: function (coords) {
                if (wcs.forceNativeCelsys) {
                    var latLng = wcs.eqToCelsys(l.latLng(coords[1], coords[0]));
                    return new l.LatLng(latLng.lat, latLng.lng, coords[2]);
                } else {
                    return new l.LatLng(coords[1], coords[0], coords[2]);
                }
            },
            pointToLayer: function (feature, latlng) {

                path_options = Ext.Object.merge(radiusOptions, {
                    majAxis: radius,
                    minAxis: radius,
                    posAngle: 90
                });

                // Usei ellipse por ja estar em degrees a funcao circulo
                // estava em pixels
                // usei o mesmo valor de raio para os lados da ellipse para
                // gerar um circulo por ser um circulo o angulo tanto faz.
                return l.ellipse(
                    l.latLng(dec, ra),
                    path_options);

            }
        });

        me.setLradius(lradius);

        map.addLayer(lradius);

        return lradius;
    },

    showHideRadius: function (state) {
        var me = this,
            map = me.getMap(),
            lradius = me.getLradius();

        if (lradius !== null) {
            if (state) {
                map.addLayer(lradius);

            } else {
                map.removeLayer(lradius);
            }
        }
    },

    overlayCatalog: function (title, storeMembers, options, storeCommentsPosition) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            wcs = map.options.crs,
            catalogOptions = me.getCatalogOptions(),
            pathOptions, collection, feature, lCatalog;

        pathOptions = catalogOptions;

        collection = {
            type: 'FeatureCollection',
            features: []
        };

        storeMembers.each(function (record) {

            // Checar se objeto esta dentro dos limites da tile
            if (me.isInsideTile(record.get('_meta_ra'), record.get('_meta_dec'))) {

                feature = {
                    type: 'Feature',
                    id: record.get('_meta_id'),
                    title: title,
                    properties: record.data,
                    is_system: record.get('_meta_is_system'),
                    geometry: {
                        type: 'Point',
                        coordinates: [record.get('_meta_ra'), record.get('_meta_dec')]
                    }
                };

                collection.features.push(feature);
            }

        }, me);

        lCatalog = l.geoJson(collection, {
            coordsToLatLng: function (coords) {
                if (wcs.forceNativeCelsys) {
                    var latLng = wcs.eqToCelsys(l.latLng(coords[1], coords[0]));
                    return new l.LatLng(latLng.lat, latLng.lng, coords[2]);
                } else {
                    return new l.LatLng(coords[1], coords[0], coords[2]);
                }
            },

            // desenha os objetos (círculos pequenos e comentários de objeto)
            pointToLayer: function (feature, latlng) {
                var radius = pathOptions.radius,
                    opts = pathOptions, circle;

                if (feature.is_system) {
                    // se o objeto for um sistema usar a propriedade radius em arcmin
                    if (feature.properties._meta_radius) {
                        radius = feature.properties._meta_radius / 60;

                        // usar as opcoes de path do radius
                        opts = me.getRadiusOptions();
                    }
                }

                // Desenhar apenas o circulo
                majAxis = radius;
                minAxis = radius;
                posAngle = 90;

                // Desenhar ellipse.
                if ((options) && (options.ellipse == true)) {

                    try {

                        var a_image = feature.properties._meta_a_image,
                            b_image = feature.properties._meta_b_image,
                            theta_image = feature.properties._meta_theta_image

                        // Checar se tem o 3 campos
                        if ((typeof a_image == 'number') &&
                            (typeof b_image == 'number') &&
                            (typeof theta_image == 'number')) {

                            majAxis = a_image / 3600.0;
                            minAxis = b_image / 3600.0;
                            posAngle = theta_image;
                        }
                    }
                    catch(err) {}
                }

                path_options = Ext.Object.merge(opts, {
                    majAxis: majAxis,
                    minAxis: minAxis,
                    posAngle: posAngle
                });

                path_options = Ext.Object.merge(path_options, options);

                // tornar o objeto clicavel
                path_options.interactive = true

                // Usei ellipse por ja estar em degrees a funcao circulo
                // estava em pixels
                // usei o mesmo valor de raio para os lados da ellipse para
                // gerar um circulo por ser um circulo o angulo tanto faz.
                circle = l.ellipse(latlng, path_options);

                // adiciona o ícone de comentário por objeto
                if (feature.properties._meta_comments){
                    me.createCommentIcon(latlng, circle);
                }

                return circle;
            }
        })
        .bindPopup(me.createOverlayPopup)

        .on('dblclick', function () {
            alert('TODO: OPEN IN EXPLORER!');
        })

        // chama a função de exibição do menu de contexto
        .on('contextmenu', me.onLayerContextMenu, me);

        // adiciona os ícones de comentário por posição
        if (storeCommentsPosition){
            storeCommentsPosition.each(function(record){
                var latlng = {
                    lat: record.get('pst_dec'),
                    lng: record.get('pst_ra')
                };

                me.createCommentIcon(latlng);                
            });
        }

        map.addLayer(lCatalog);

        return lCatalog;
    },


    createOverlayPopup: function (layer) {
        var feature = layer.feature,
            properties = feature.properties,
            mags = ['_meta_mag_auto_g','_meta_mag_auto_r','_meta_mag_auto_i', '_meta_mag_auto_z', '_meta_mag_auto_y'],
            mag_tags = [],
            popup;

        Ext.each(mags, function (mag) {
            try {
                mag_name = mag.slice(-1);
                if (mag_name == 'y'){
                    mag_name = 'Y';

                }
                mag_value = properties[mag];

                tag = '<TR><TD><spam>' + mag_name + '</spam>: </TD><TD>' + mag_value.toFixed(2) + '</td></tr>';
                mag_tags.push(tag)

            } catch(err) {

            }
        });

        popup = '<spam style="font-weight: bold;">' + feature.title + '</spam></br>' +
           '<TABLE style="margin:auto;">' +
           '<TBODY style="vertical-align:top;text-align:left;">' +
                '<TR><TD><spam>ID</spam>: </TD><TD>' + feature.properties._meta_id + '</td></tr>' +
                '<TR><TD><spam>RA, Dec (deg)</spam>: </TD><TD>' +
                    feature.properties._meta_ra.toFixed(5) + ', ' + feature.properties._meta_dec.toFixed(5) +
                '</td></tr>' +
                mag_tags.join('') +
            '</TBODY></TABLE>';

        return popup;
    },

    onDblClickOverlay: function () {
        console.log('onDblClickOverlay(%o)', arguments);

    },

    showHideLayer: function (layer, state) {
        var me = this,
            map = me.getMap();

        if (layer !== null) {
            if (state) {
                map.addLayer(layer);

            } else {
                map.removeLayer(layer);
            }
        }
    },

    showHideComments: function (layer, state) {
        var me = this, l, q,
            map = me.getMap();

        if (layer !== null) {
            for (i in layer._layers){
                l = layer._layers[i];
                q = l.feature.properties._meta_comments;

                //se tem comentário(s), oculta ou exibe o ícone
                if (q>0){
                    l.commentMaker._icon.style.display = state ? '' : 'none';
                }
            }
        }
    },

    onLayerContextMenu: function(event){
        var me = this;

        me.isObjectContextMenu = true; //diz para cancelar o evento em onContextMenuClick

        // evento sobre um comentário de posição
        if (event.target.targetPosition){
            me.showContextMenuImage(event);
        }

        // evento sobre um objeto ou sobre o comentário de um objeto
        else{
            // sobre o comentário
            if (event.target.targetObjet){
                event.layer = {feature: event.target.targetObjet.feature};
            }

            me.showContextMenuObject(event);
        }

    },

    createCommentIcon: function(latlng, circle){
        var me = this, m, commentMaker;

        commentMaker = me.markPosition(latlng, 'mapmaker-comment comment-maker'+(circle?'':' mapmaker-comment-position'))
            .on('contextmenu', me.onLayerContextMenu, me);
        
        if (circle){
            circle.commentMaker = commentMaker;
            commentMaker.targetObjet = circle;
        }else{
            commentMaker.targetPosition = latlng
        }
    },

    updateComment: function (layer, comment, total) {
        var me     = this, circle, id,
            maps   = me.getMap(),
            layers = layer ? layer._layers : null,
            layerComment = false,
            latlng = {
                lat: comment.get('pst_dec'),
                lng: comment.get('pst_ra')
            };
        
        // se comentário de posição
        if (comment.isCommentPosition){
            maps.eachLayer(function(l){
                //comentário por posição
                if (l.targetPosition){
                    if (latlng.lat==l.targetPosition.lat && latlng.lng==l.targetPosition.lng){
                        layerComment = l;
                    }
                }
            });

            // já tem o ícone na imagem
            if (layerComment){
                // remove se não tem mais comentários
                layerComment.getElement().style.display = total==0 ? 'none' : '';
            }
            // ainda não tem o ícone na imagem
            else{
                // adiciona se tem comentário
                if (total>0){
                    me.createCommentIcon(latlng);
                }
            }
        }
        
        // se comentário de objeto
        else if (layers){
            for (i in layers){
                circle  = layers[i];
                id = circle.feature.id;

                if (id==comment.data.object_id){
                    //já tem o ícone
                    if (circle.commentMaker){
                        //remove se não tem mais comentário
                        circle.commentMaker.getElement().style.display = total==0 ? 'none' : '';
                    }
                    //não tem o ícone
                    else{
                        //adiciona se tem comentário
                        if (total>0){
                            me.createCommentIcon(circle._latlng, circle);
                        }
                    }

                    circle.feature.properties._meta_comments = total;
                }

            }
        }

    },

    /**
     * Adiciona um maker em uma determinada posição, podendo ser chamada de duas formas:
     *      markPosition(ra, dec, iconCls);
     *      markPosition(latlng, iconCls);
     */
    markPosition: function (ra, dec, iconCls) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            latlng, lmarkPosition, myIcon, iconAnchor;

        if (arguments.length==2){
            latlng = ra;
            iconCls = dec;
            iconAnchor = [12,25];//28];
        }else{
            latlng = l.latLng(dec, ra);
            iconAnchor = [8,44];
        }

        if (iconCls) {
            myIcon = l.divIcon({
                className: 'visiomatic-marker-position',
                iconAnchor: iconAnchor,
                html:'<i class="' + iconCls + '"></i>'
            });

            lmarkPosition = l.marker(latlng, {icon: myIcon});

        } else {

            lmarkPosition = l.marker(latlng);
        }

        lmarkPosition.addTo(map);

        return lmarkPosition;

    },

    setShowCrosshair: function (state) {
        var me = this,
            map = me.getMap(),
            lcrosshair = me.lcrosshair;

        me.showCrosshair = state;

        if (lcrosshair !== null) {
            if (state) {
                map.addLayer(lcrosshair);

            } else {
                map.removeLayer(lcrosshair);

            }
        }

    },

    /**
     * Desenha uma crosshair marcando a coordenada passada por parametro
     * @param {Model/Array[ra,dec]} object - uma instancia de model com
     * atributos ra e dec ou um array com [ra, dec]
     * @return {I.GroupLayer} Return crosshair a groupLayer
     */
    drawCrosshair: function (ra, dec, options) {
        // console.log("Zoomify - drawCrosshair()");
        var me = this,
            l = me.libL,
            map = me.getMap(),
            crosshairOptions = me.getCrosshairOptions(),
            layer = null,
            labelOptions, centerPadding, size, latlng,
            lineTop, lineBotton, lineLeft, lineRight;

        labelOptions = Ext.Object.merge({}, crosshairOptions);
        if (options) {
            labelOptions = Ext.Object.merge(labelOptions, options);
        }

        // Verificar se ja tem crosshair
        if (me.lcrosshair) {
            if (map.hasLayer(me.lcrosshair)) {
                // se ja houver remove do map
                map.removeLayer(me.lcrosshair);
                me.lcrosshair = null;
            }
        }

        // coordenadas
        latlng = l.latLng(dec, ra);

        // centerPadding e a distancia que as linhas vao ter a partir do centro.
        centerPadding = ((labelOptions.centerPadding) ?
                labelOptions.centerPadding : 0.005);

        size = ((labelOptions.size) ?
                labelOptions.size : 0.010);

        lineTop       = [l.latLng((dec + centerPadding), ra), l.latLng((dec + size), ra)];
        lineBotton    = [l.latLng((dec - centerPadding), ra), l.latLng((dec - size), ra)];
        lineLeft      = [l.latLng(dec, (ra + centerPadding)), l.latLng(dec, (ra + size))];
        lineRight     = [l.latLng(dec, (ra - centerPadding)), l.latLng(dec, (ra - size))];

        lineTop     = l.polyline(lineTop, options);
        lineBotton  = l.polyline(lineBotton, options);
        lineLeft    = l.polyline(lineLeft, options);
        lineRight   = l.polyline(lineRight, options);

        layer = new l.LayerGroup(
                [lineTop, lineBotton, lineLeft, lineRight]);

        me.lcrosshair = layer;

        if (me.getShowCrosshair()) {
            map.addLayer(me.lcrosshair);

        }

        return me.lcrosshair;
    },

    showCatalogOverlayWindow: function() {
        var me = this,
            currentDataset = me.getCurrentDataset(),
            win = me._winCatalogOverlay;

        if ((currentDataset !== null) && (currentDataset.get('id') > 0)) {

            if (win != null) {
                win.show();

            } else {
                win = Ext.create('visiomatic.catalog.CatalogOverlayWindow', {
                    visiomatic: me,
                });

                // Adiciona a Window como parte do componente Visiomatic,
                // Desta forma se o componete nao estiver mais visivel na tela a window tb nao estara.
                me.add(win)

                win.show();

                me._winCatalogOverlay = win;

            }

            me._winCatalogOverlay.setDataset(currentDataset);

        } else {
            // Nao tem Dataset Selecionado a funcao de Overlay necessita de um dataset.
            console.log('Dataset nao foi definido, a funcao overlay precisa de um dataset.')

            return false;
        }
    },

    /**
     * @description Exibe um menu de contexto
     */
    showContextMenuImage: function(event){
        var me     = this,
            target = event.target,
            xy     = {x:event.originalEvent.clientX, y:event.originalEvent.clientY};

        if (event.originalEvent.target.classList.contains('comment-maker') && !target.targetPosition){
            return me.showContextMenuObject(event);
        }

        if (!this.contextMenuImage){
            this.contextMenuImage = new Ext.menu.Menu({
                items: [
                    {
                        id: 'comment-position',
                        text: 'Comment Position',
                        handler: function(item) {
                            me.fireEvent('imageMenuItemClick', me.contextMenuImage.target, me.getCurrentDataset());
                        }
                    }
                  ]
            });
        }

        target.latlng = event.latlng;
        me.contextMenuImage.target = target;
        me.contextMenuImage.showAt(xy);
    },

    initCrop: function() {
        var me = this,
            map = me.getMap();
        map.on('click', me.startCrop, me);
    },

    startCrop: function(){
        var me = this,
            map = me.getMap();

        me.cropInit = me.currentPosition
        me.cropEnd = me.cropInit;

        map.off('click', me.startCrop, me);
        map.on('click', me.endCrop, me);
    },

    endCrop: function(event){
        var me = this,
            map = me.getMap();

        me.cropEnd = me.currentPosition
        map.removeLayer(me.cropRectangle);
        map.off('click', me.endCrop, me);
        me.downloadCrop(me.cropInit, me.cropEnd);
    },

    downloadCrop: function(init, end){
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            hiddenlink = document.createElement('a'),
            layer = me.getImageLayer();

        var	latlng = map.getCenter(),
            bounds = map.getPixelBounds(),
            z = map.getZoom(),
            zfac;

        if (z > layer.iipMaxZoom) {
            zfac = Math.pow(2, z - layer.iipMaxZoom);
            z = layer.iipMaxZoom;
        } else {
            zfac = 1;
        }

        var	sizex = layer.iipImageSize[z].x * zfac,
            sizey = layer.iipImageSize[z].y * zfac,
            dx = Math.abs(init.container[0] - end.container[0]),
            dy = Math.abs(init.container[1] - end.container[1]);

        var origin = {
            x: bounds.min.x + Math.min(init.container[0], end.container[0]),
            y: bounds.min.y + Math.min(init.container[1], end.container[1])
        }

        hiddenlink.href = layer.getTileUrl({x: 1, y: 1}
          ).replace(/JTL\=\d+\,\d+/g,
          'RGN=' + origin.x / sizex + ',' +
          origin.y / sizey + ',' +
          dx / sizex + ',' + dy / sizey +
          '&WID=' + (this._snapType === 0 ?
            Math.floor(dx / zfac) :
            Math.floor(dx / zfac / layer.wcs.scale(z))) + '&CVT=jpeg');
        hiddenlink.download = layer._title + '_' + libL.IIPUtils.latLngToHMSDMS(latlng).replace(/[\s\:\.]/g, '') +
          '.jpg';
        hiddenlink.click();
    },

    showContextMenuObject: function(event){
        var objectMenuItem,
            me = this,
            xy = {x:event.originalEvent.clientX, y:event.originalEvent.clientY};

        if (!this.contextMenuObject){
            this.contextMenuObject = new Ext.menu.Menu({
                items: [
                    {
                        id: 'comment-object',
                        text: 'Comment Object',
                        handler: function(item) {
                            me.fireEvent('objectMenuItemClick', event, this.feature);
                        }
                    }]
            });
        }

        objectMenuItem = me.contextMenuObject.items.get("comment-object");
        objectMenuItem.feature = event.layer ? event.layer.feature :  null;

        me.contextMenuObject.showAt(xy);
    },

    /**
     * Desenha um retangulo
     * @param upperRight = [ra, dec] coordenadas do canto superior direito
     * @param lowerLeft = [ra, dec] coordenadas do canto inferior esquerdo
     * @return layer, essa layer e uma group layer com as linhas que foram usadas para desenhar o retangulo
     */
    drawRectangle: function (upperRight, lowerLeft, options) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            urra = upperRight[0],
            urdec = upperRight[1],
            llra = lowerLeft[0],
            lldec = lowerLeft[1],
            lineTop, lineBotton, lineLeft, lineRight, lt, lb, ll, lr;


        pathOptions = Ext.Object.merge(me.getCrosshairOptions(), options)

        lineTop = [l.latLng(urdec, llra), l.latLng(urdec, urra)];
        lineBotton = [l.latLng(lldec, llra), l.latLng(lldec, urra)];
        lineLeft = [l.latLng(urdec, urra), l.latLng(lldec, urra)];
        lineRight = [l.latLng(urdec, llra), l.latLng(lldec, llra)];


        lt = l.polyline(lineTop, pathOptions);
        lb = l.polyline(lineBotton, pathOptions);
        ll = l.polyline(lineLeft, pathOptions);
        lr = l.polyline(lineRight, pathOptions);

        layer = new l.LayerGroup([lt, lb, ll, lr]);

        map.addLayer(layer);

        return layer
    },


    /**
     * Verifica se uma dada coordenada esta dentro dos limites do dataset atual.
     */
    isInsideTile: function (ra, dec) {
        var me = this,
            currentDataset = me.getCurrentDataset();

        if ((currentDataset != null) && (currentDataset.get('id') > 0)) {

            // Usa um metodo do proprio model common.model.dataset para validar se a posicao esta dentro da tile
            return currentDataset.isInsideTile(ra, dec);
        } else {
            // nao tem um dataset carregado nao da pra testar se esta dentro ou nao
            return true
        }
    },

    statics : {
        /**
         * Retorna de forma assíncrona as coordeandas latlng a partir de value
         * @param value String valor no formato "H:M:S"" ou "lat, lng"
         * @param fn Function função de retorno com o valor convertido em latlng
         */
        coordinatesToLatLng: function(value, fn){
            var a, n = visiomatic.Visiomatic.strToSystem(value);

            value = value.trim().replace(/( )+/g, ' ');
            a = value.split(',');

            if (n && n.system=='latlng'){
                return fn(n.value);

            }else if (n && n.system=='HMS'){
                //converte para latlng
                return visiomatic.Visiomatic.hmsToLatLng(value, fn);
            }

            fn(null);
        },

        /**
         * Converte de forma assícrona HMG para latlng
         * by https://github.com/astromatic/visiomatic/blob/master/src/Control.WCS.js#L143
         */
        hmsToLatLng: function(value, fn){
            var url = 'http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oI/A?'+value;

            $.get(url, function(response){
                var latlng = visiomatic.Visiomatic.parseCoords(response, true);
                if (fn) fn(latlng);
            });
        },

        // Convert degrees to HMSDMS (DMS code from the Leaflet-Coordinates plug-in)
        latLngToHMSDMS: function (latlng) {
            var lng = (latlng.lng + 360.0) / 360.0;
            lng = (lng - Math.floor(lng)) * 24.0;
            var h = Math.floor(lng),
            mf = (lng - h) * 60.0,
            m = Math.floor(mf),
            sf = (mf - m) * 60.0;
            if (sf >= 60.0) {
                m++;
                sf = 0.0;
            }
            if (m === 60) {
                h++;
                m = 0;
            }
            var str = (h < 10 ? '0' : '') + h.toString() + ':' + (m < 10 ? '0' : '') + m.toString() +
            ':' + (sf < 10.0 ? '0' : '') + sf.toFixed(3),
            lat = Math.abs(latlng.lat),
            sgn = latlng.lat < 0.0 ? '-' : '+',
            d = Math.floor(lat);
            mf = (lat - d) * 60.0;
            m = Math.floor(mf);
            sf = (mf - m) * 60.0;
            if (sf >= 60.0) {
                m++;
                sf = 0.0;
            }
            if (m === 60) {
                h++;
                m = 0;
            }
            return str + ' ' + sgn + (d < 10 ? '0' : '') + d.toString() + ':' +
            (m < 10 ? '0' : '') + m.toString() + ':' +
            (sf < 10.0 ? '0' : '') + sf.toFixed(2);
        },

        /**
         * Retorna o sistema de métrica do valor
         */
        strToSystem: function(value){
            var a;

            if (value){
                //remove excesso de espaços, à direita, à esquerda e no meio
                value = value.trim().replace(/( )+/g, ' ');

                //lnt, lng
                a = value.split(',');
                if (a.length==2 && value.split(':').length==1){
                    return {
                        value: {lng:Number(a[0]), lat:Number(a[1])},
                        system: 'latlng'
                    }
                }

                //h:m:s h:m:s
                a = value.split(' ');
                if (a.length==2 && value.split(':').length==5){
                    return {
                        value: value,
                        system: 'HMS'
                    }
                }
            }

            return null;
        },

        // Parse a string of coordinates. Return undefined if parsing failed
        // by VisioMatic
        parseCoords: function (str) {
            var result = /J\s(\d+\.?\d*)\s*,?\s*\+?(-?\d+\.?\d*)/g.exec(str);

            if (result && result.length >= 3) {
                return L.latLng(Number(result[2]), Number(result[1]));
            }

            return null;
        }
    }

});
