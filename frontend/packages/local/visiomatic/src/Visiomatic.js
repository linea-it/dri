Ext.define('visiomatic.Visiomatic', {
    extend: 'Ext.panel.Panel',

    requires: [
        'visiomatic.VisiomaticModel',
        'visiomatic.VisiomaticController',
        'visiomatic.catalog.CatalogOverlayWindow',
        'visiomatic.download.DescutDownloadWindow',
        'common.store.CommentsPosition'
    ],

    mixins: {
        interface: 'visiomatic.Interface',
        comments: 'visiomatic.Comments'
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

        prefix: null,

        enableSidebar: true,

        enableSmallCrosshair: false,

        // Catalog Overlays
        enableCatalogs: false,
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
            pointType: 'circle', //'circle', 'ellipse', 'triangle', 'square'
            pointSize: 0.001 // tamanho utilizado para criar os makers em graus
        },

        // Draw Crosshair Path Options http://leafletjs.com/reference-1.0.3.html#path
        crosshairOptions: {
            color: '#FF4500',
            weight: 2,
            // opacity: 0.8,
            smoothFactor: 1,
            centerPadding: 0.001, // Deg
            size: 0.003, // Deg
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

        // menu de contexto
        enableContextMenu: true,
        contextMenuItens: [],

        enableComments: true,
        showComments: true,
        // Layers dos comentarios.
        lComments: null,
        ////// buttons //////

        // Get Link
        enableLink: true,
        // Shift Visiomatic/Aladin
        enableShift: true,

        // Crop
        enableCrop: true,

        ready: false,

        // Layer usada para exibir ou ocultar o raio de um cluster
        lradius: null,

        // Layer usada para exibir ou ocultar a crosshair
        lcrosshair: null,

        showCrosshair: false,
        mlocate:'',
    },

    _winCatalogOverlay: null,


    bind: {
        release: '{release}',
        tag: '{tag}',
        dataset: '{dataset}'
    },

    initComponent: function () {
        var me = this;
        var tollbar, cmpVisiomatic;
            // host = window.location.host,

        if (window.L) {
            me.libL  = window.L;

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
                cmpVisiomatic
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
        if (me.getPrefix()) {
            map.attributionControl.setPrefix(me.getPrefix());
        }

        // Add a Reticle to Map
        libL.control.reticle().addTo(map);


        // Add Events Listeners to Map
        map.on('dblclick', me.onDblClick, me);
        map.on('layeradd', me.onLayerAdd, me);
        map.on('move', me.onMove, me);
        map.on('mousemove', me.onMouseMove, me);
        map.on('overlaycatalog', me.showCatalogOverlayWindow, me);
        map.on('mouseup', me.savePreferences, me);
        map.on('keypress', me.savePreferences, me);
        map.on('contextmenu', me.onContextMenuClick, me);


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
        var me = this,
            imageLayer = me.getImageLayer();

        var imageOptions = {
            credentials: true,
            channelLabelMatch: '[ugrizY]',
            mixingMode: imageLayer.iipMode,
            contrast: imageLayer.iipContrast,
            gamma: imageLayer.iipGamma,
            invertCMap: imageLayer.iipInvertCMap,
            colorSat: imageLayer.iipColorSat,
            quality: imageLayer.iipQuality
        };

        localStorage.removeItem('imageOptions');

        localStorage.setItem(
            'imageOptions',
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
        if (me.getEnableCatalogs()) {
            Ext.Array.each(availableCatalogs, function (value) {
                catalogs.push(
                    libL.Catalog[value]
                );
            });

            libL.control.iip.catalog(catalogs).addTo(sidebar);
        }

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

    createSmallCrosshair: function () {
        var me = this,
            coordinates = me.getRaDec(),
            crosshairOptions = {
                color: '#90FA3A',
                weight: 1,
                opacity: 0.8,
                smoothFactor: 1,
                centerPadding: 0.0005, // Deg
                size: 0.0015 // Deg
            };

        me.drawSmallCrosshair(coordinates.ra, coordinates.dec, crosshairOptions);
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
        
        // Carregar os commentarios toda vez que o dataset for alterado.
        me.loadComments();

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

        // Se tiver com a janela de Overlay Catalog aberta deve fechar
        if (me._winCatalogOverlay !== null) {
            me._winCatalogOverlay.close();

            me._winCatalogOverlay = null;
        }

        // Forcar a remocao da imageLayer
        me.removeImageLayer();

        options = options || {};

        if (imageLayer) {
            imageOptions = {
                credentials: imageOptions.credentials,
                channelLabelMatch: '[ugrizY]',
                mixingMode: imageLayer.iipMode,
                contrast: imageLayer.iipContrast,
                gamma: imageLayer.iipGamma,
                invertCMap: imageLayer.iipInvertCMap,
                colorSat: imageLayer.iipColorSat,
                quality: imageLayer.iipQuality

            };
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
            if (miniMap) miniMap.remove();
            me.createMiniMap();
        }
    },

    createMiniMap: function () {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            navoptions = me.getMiniMapOptions(),
            imageOptions = me.getImageOptions(),
            image = me.getImage(),
            miniMap,
            navlayer;

        if (image) {
            navlayer= libL.tileLayer.iip(image, {
                credentials:imageOptions.credentials,
                mixingMode: 'color',
                defaultChannel: 2,
                contrast: 0.7,
                gamma: 2.8,
                colorSat: 2.0,
                channelLabelMatch: '[ugrizY]'
            });
            miniMap = libL.control.extraMap(navlayer, navoptions).addTo(map);
            //miniMap._minimize();
            me.setMiniMap(miniMap);
        }
    },

    setView: function (ra, dec, fov, dontMoveCrosshair) {
        var me = this,
            libL = me.libL,
            map = me.getMap(),
            latlng;

        if (me.isReady()) {
            ra = parseFloat(parseFloat(ra).toFixed(5));
            dec = parseFloat(parseFloat(dec).toFixed(5));

            latlng = libL.latLng(dec, ra);
            map.setView(latlng, map.options.crs.fovToZoom(map, fov, latlng));

            if (me.getShowCrosshair()) {

                if (!dontMoveCrosshair) {
                    me.drawCrosshair(ra, dec);
                }

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
            map = me.getMap(),
            target = event.target,
            xy = {
                x:event.originalEvent.clientX,
                y:event.originalEvent.clientY
            },
            contextMenu;
        
        if (this.cancelBuble) return
        this.cancelBuble = true
        setTimeout(()=>{this.cancelBuble = false},100)

        if (me.getEnableContextMenu()) {
            contextMenu = me.makeContextMenu(event);
            contextMenu.showAt(xy);
        }
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

    centerTile: function () {
        var me = this,
            currentDataset = me.getCurrentDataset(),
            fov = 2; // 2 graus e o suficiente para tile ficar completa

        me.setView(
            currentDataset.get('tli_ra'),
            currentDataset.get('tli_dec'),
            fov);
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

        // Tratar RA > 360
        if (lng > 360) {
            lng = lng - 360;
        }

        return {
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
            dlat: parseFloat(dlat.toFixed(6)),
            dlng: parseFloat(dlng.toFixed(6))
        };
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

        // Tratar RA > 360
        if (bounding.lng > 360) {
            bounding.lng = bounding.lng - 360;
        }

        urra = parseFloat(bounding.lng + bounding.dlng / 2).toFixed(6);
        urdec = parseFloat(bounding.lat + bounding.dlat / 2).toFixed(6);
        llra = parseFloat(bounding.lng - bounding.dlng / 2).toFixed(6);
        lldec = parseFloat(bounding.lat - bounding.dlat / 2).toFixed(6);

        ur = [urra, urdec];
        ll = [llra, lldec];

        box = [ur, ll];

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
        var ra  = event.latlng.lng,
            dec = event.latlng.lat,
            pos = String(ra.toFixed(5) + ', ' + dec.toFixed(5)),
            me  = this,
            map = me.getMap();

        this.cmpMousePosition.children[0].innerHTML = 'Mouse RA, Dec: ' + (pos);

        me.currentPosition = {
            radec: [
                ra,
                dec
            ],
            container: [
                event.containerPoint.x,
                event.containerPoint.y
            ]
        };

        if (me.cropInit && me.cropInit == me.cropEnd && me.isCropping) {
            if (me.cropRectangle) {
                map.removeLayer(me.cropRectangle);
            }

            me.cropRectangle = me.drawRectangle(
                me.cropInit['radec'],
                me.currentPosition['radec']
            );
        }

        // Small Crosshair
        if (me.getEnableSmallCrosshair()) {
            me.createSmallCrosshair();
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
            coord = coordinate.ra.toFixed(5).replace('.', ',') + '+' + coordinate.dec.toFixed(5).replace('.', ',');
        } else {
            coord = coordinate.ra.toFixed(5).replace('.', ',') + coordinate.dec.toFixed(5).replace('.', ',');
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
    panTo: function (value) {
        var map = this.getMap();

        this.coordinatesToLatLng(value, function (latlng) {
            if (latlng) map.panTo(latlng);
        });
    },

    coordinatesToLatLng: function (value, fn) {
        visiomatic.Visiomatic.coordinatesToLatLng(value, fn);
    },

    hmsToLatLng: function (value, fn) {
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

    overlayCatalog: function (title, store, options) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            wcs = map.options.crs,
            catalogOptions = me.getCatalogOptions(),
            commentExists = {},
            pathOptions, collection, feature, lCatalog;

        pathOptions = Ext.Object.merge(catalogOptions, options);

        collection = {
            type: 'FeatureCollection',
            features: []
        };

        // transfere para collection.features somente os objetos que estão dentro da imagem (tile)
        store.each(function (record) {

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
                let pointMaker

                if (feature.is_system) {
                    // se o objeto for um sistema usar a propriedade radius em arcmin
                    if (feature.properties._meta_radius) {
                        radius = feature.properties._meta_radius / 60;

                        // usar as opcoes de path do radius
                        opts = me.getRadiusOptions();
                    }
                }

                // Desenhar ellipse.
                if (pathOptions.pointType === 'ellipse') {
                    var majAxis = 0.001,
                        minAxis = 0.001,
                        posAngle = 90;

                    try {
                        var a_image = feature.properties._meta_a_image,
                            b_image = feature.properties._meta_b_image,
                            theta_image = feature.properties._meta_theta_image;

                        // Checar se tem o 3 campos
                        if ((typeof a_image == 'number') &&
                            (typeof b_image == 'number') &&
                            (typeof theta_image == 'number')) {

                            majAxis = a_image / 3600.0;
                            minAxis = b_image / 3600.0;
                            posAngle = theta_image;
                        }
                    }
                    catch (err) {}

                    pathOptions.majAxis = majAxis,
                    pathOptions.minAxis = minAxis,
                    pathOptions.posAngle = posAngle

                    pointMaker = l.ellipse(latlng, pathOptions)

                } else if (pathOptions.pointType === 'square') {
                    // Desenha um Quadrado
                    var bounds = [
                        [latlng.lat-pathOptions.pointSize,
                            latlng.lng-pathOptions.pointSize],
                        [latlng.lat+pathOptions.pointSize,
                            latlng.lng+pathOptions.pointSize],
                    ]

                    pointMaker = l.rectangle(bounds, pathOptions)
                } else if (pathOptions.pointType === 'triangle') {
                    // Desenha um triangulo em volta do ponto
                    var baseline, leftline, rightline, bl, ll, rl;

                    // lat = dec, lng = ra
                    baseline = [
                        l.latLng(latlng.lat-pathOptions.pointSize,
                            latlng.lng-pathOptions.pointSize),
                        l.latLng(latlng.lat-pathOptions.pointSize,
                            latlng.lng+pathOptions.pointSize)
                    ]
                    rightline = [
                        l.latLng(latlng.lat - pathOptions.pointSize,
                            latlng.lng - pathOptions.pointSize),
                        l.latLng(latlng.lat + pathOptions.pointSize,
                            latlng.lng)
                    ]
                    leftline = [
                        l.latLng(latlng.lat - pathOptions.pointSize,
                            latlng.lng + pathOptions.pointSize),
                        l.latLng(latlng.lat + pathOptions.pointSize,
                            latlng.lng)
                    ]

                    bl = l.polyline(baseline, pathOptions);
                    rl = l.polyline(rightline, pathOptions);
                    ll = l.polyline(leftline, pathOptions);

                    pointMaker = new l.LayerGroup([bl, rl, ll])

                } else if (pathOptions.pointType === 'icon') {
                    let latlngId = `${latlng.lat}:${latlng.lng}`
                    let iconAnchor = [8,44]
                    let divIcon
                    
                    // evita que seja plotado vários comentários em uma mesmo posição
                    if (commentExists[latlngId]) return

                    divIcon = l.divIcon({
                        className: 'visiomatic-marker-position',
                        iconAnchor: iconAnchor,
                        html:'<i class="' + pathOptions.pointIcon + '"></i>'
                    })
                    
                    commentExists[latlngId] = true
                    pointMaker = l.marker(latlng, {icon: divIcon})
                } else {
                    // Por default marca com um circulo
                    pathOptions.pointType = 'circle'
                    pathOptions.majAxis = pathOptions.pointSize;
                    pathOptions.minAxis = pathOptions.pointSize;
                    pathOptions.posAngle = 90;
                    
                    // Usei ellipse por ja estar em degrees a funcao circulo
                    // estava em pixels
                    // usei o mesmo valor de raio para os lados da ellipse para
                    // gerar um circulo por ser um circulo o angulo tanto faz.
                    pointMaker = l.ellipse(latlng, pathOptions)
                }

                pointMaker.pointObjectType = pathOptions.pointObjectType

                return pointMaker
            }
        })
        .bindPopup(me.createOverlayPopup)

        .on('dblclick', function () {
            alert('TODO: OPEN IN EXPLORER!');
        })

        // chama a função de exibição do menu de contexto quando click em cima de um comentário, círculo, etc.
        .on('contextmenu', me.onContextMenuClick, me);

        map.addLayer(lCatalog);

        me.redraw();

        return lCatalog;
    },

    redraw() {
        var me = this,
            map = me.getMap(),
            container = $(map.getContainer()),
            width = container.width();

        if (width > 0) {
            container.css({width:width + 2});
            map.invalidateSize();
            container.css({width:'initial'});
        }

    },

    createOverlayPopup: function (layer) {
        var feature = layer.feature,
            properties = feature.properties,
            mags = ['_meta_mag_auto_g','_meta_mag_auto_r','_meta_mag_auto_i',
                '_meta_mag_auto_z', '_meta_mag_auto_y'],
            tag_mags = [],
            tag_properties = [],
            tag_id = feature.properties._meta_id,
            excludeProperties = ['RAJ2000', 'DEJ2000'],
            allProps = [],
            popup;


        Ext.each(mags, function (mag) {
            try {
                mag_name = mag.slice(-1);
                if (mag_name == 'y') {
                    mag_name = 'Y';

                }
                mag_value = properties[mag];
                if (mag_value) {
                    mag_value = parseFloat(mag_value);
                    tag = '<TR><TD><spam>' + mag_name + '</spam>: </TD><TD>' + mag_value.toFixed(2) + '</td></tr>';
                    tag_mags.push(tag);
                }
            } catch (err) {

            }
        });

        // TODO esta propriedade e do VAC essa parte precisa de um refactor.
        if (feature.properties._meta_photo_z) {
            photoz = parseFloat(feature.properties._meta_photo_z)
            tag_properties.push(
                '<TR><TD><spam>photo-z</spam>: </TD>' +
                '<TD>' + photoz.toFixed(2) + '</td></tr>');
        }

        // Link para explorer
        if (feature.properties._meta_is_system) {
            // Se o objeto e um sistema utilizar o explorer system
            tag_id = '<a href="/dri/apps/explorer/#system/' +
               feature.properties._meta_catalog_name + '/' +
               feature.properties._meta_id + '"target="_blank">' +
               feature.properties._meta_id + '</a>';

        } else {
            if (feature.properties._meta_catalog_class == 'coadd_objects') {
                // se o Objeto e um coadd object utilizar o explorer coadd
                tag_id = '<a href="/dri/apps/explorer/#coadd/' +
                   feature.properties._meta_catalog_name + '/' +
                   feature.properties._meta_id + '"target="_blank">' +
                   feature.properties._meta_id + '</a>';

            } else if (feature.properties._meta_object_url) {
                // Se o objeto tiver o atributo _meta_object_url exemplo
                // external catalogs dos vizier
                tag_id = '<a href="' + feature.properties._meta_object_url +
                    '"target="_blank">' + feature.properties._meta_id + '</a>';

                // Se o Objeto tiver poucas propriedades vale a pena lista-las
                // as propriedades nao podem comecar com _meta_ e nao podem estar
                // na lista de excluded
                // E necessario fazer 2 for para que as propriedades fiquem ordenadas
                // em ordem alfabetica
                for (property in feature.properties) {
                    if ((!property.startsWith("_meta_"))
                        && (excludeProperties.indexOf(property) == -1)) {

                        allProps.push(property);
                    }
                }

                if (allProps.length <= 15) {
                    for (key in allProps.sort()) {
                        property = allProps[key];

                        tag_properties.push(
                            '<TR><TD><spam>' + property + '</spam>: </TD>' +
                            '<TD>' + feature.properties[property] + '</td></tr>');
                    }
                }

            } else {
                // se o Objeto e um single object utilizar o explorer single

                // TODO: ou dar a opcao de visualizar o coadd_objects.
            }
        }

        ra = parseFloat(feature.properties._meta_ra)
        dec = parseFloat(feature.properties._meta_dec)

        popup = '<spam style="font-weight: bold;">' + feature.title + '</spam></br>' +
           '<TABLE style="margin:auto;">' +
           '<TBODY style="vertical-align:top;text-align:left;">' +
                '<TR><TD><spam>ID</spam>: </TD><TD>' + tag_id + '</TD></TR>' +
                '<TR><TD><spam>RA, Dec (deg)</spam>: </TD><TD>' +
                    ra.toFixed(5) + ', ' + dec.toFixed(5) +
                '</td></tr>' +
                tag_mags.join('') +
                tag_properties.join('') +
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

    // createCommentIcon: function(latlng, circle){
    //     var me = this, m, commentMaker;

    //     commentMaker = me.markPosition(latlng, 'mapmaker-comment comment-maker')//+(circle?'':' mapmaker-comment-position'))
    //         .on('contextmenu', me.onLayerContextMenu, me);

    //     if (circle){
    //         circle.commentMaker = commentMaker;
    //         commentMaker.targetObjet = circle;
    //     }else{
    //         commentMaker.targetPosition = latlng
    //     }

    //     commentMaker.getElement().style.display = me.getShowComments() ? '' : 'none';
    // },

    // updateComment: function (layer, comment, total) {
    //     // var me     = this, circle, id,
    //     //     map    = me.getMap(),
    //     //     layers = layer ? layer._layers : null,
    //     //     layerComment = false,
    //     //     latlng = {
    //     //         lat: comment.get('pst_dec'),
    //     //         lng: comment.get('pst_ra')
    //     //     };
    //     //
    //     // // se comentário de posição
    //     // if (comment.isCommentPosition){
    //     //     map.eachLayer(function(l){
    //     //         //comentário por posição
    //     //         if (l.targetPosition){
    //     //             if (latlng.lat==l.targetPosition.lat && latlng.lng==l.targetPosition.lng){
    //     //                 layerComment = l;
    //     //             }
    //     //         }
    //     //     });
    //     //
    //     //     // já tem o ícone na imagem
    //     //     if (layerComment){
    //     //         // remove se não tem mais comentários
    //     //         layerComment.getElement().style.display = total==0 ? 'none' : '';
    //     //     }
    //     //     // ainda não tem o ícone na imagem
    //     //     else{
    //     //         // adiciona se tem comentário
    //     //         if (total>0){
    //     //             me.createCommentIcon(latlng);
    //     //         }
    //     //     }
    //     // }
    //     //
    //     // // se comentário de objeto
    //     // else if (layers){
    //     //     for (i in layers){
    //     //         circle  = layers[i];
    //     //         id = circle.feature.id;
    //     //
    //     //         if (id==comment.data.object_id){
    //     //             //já tem o ícone
    //     //             if (circle.commentMaker){
    //     //                 //remove se não tem mais comentário
    //     //                 circle.commentMaker.getElement().style.display = total==0 ? 'none' : '';
    //     //             }
    //     //             //não tem o ícone
    //     //             else{
    //     //                 //adiciona se tem comentário
    //     //                 if (total>0){
    //     //                     me.createCommentIcon(circle._latlng, circle);
    //     //                 }
    //     //             }
    //     //
    //     //             circle.feature.properties._meta_comments = total;
    //     //         }
    //     //
    //     //     }
    //     // }

    // },

    /**
     * Adiciona um maker em uma determinada posição, podendo ser chamada de duas formas:
     *      markPosition(ra, dec, iconCls);
     *      markPosition(latlng, iconCls);
     */
    // markPosition: function (ra, dec, iconCls) {
    //     var me = this,
    //         l = me.libL,
    //         map = me.getMap(),
    //         latlng, lmarkPosition, myIcon, iconAnchor;

    //     if (arguments.length==2){
    //         latlng = ra;
    //         iconCls = dec;
    //         iconAnchor = [12,25];//28];
    //     }else{
    //         latlng = l.latLng(dec, ra);
    //         iconAnchor = [8,44];
    //     }

    //     if (iconCls) {
    //         myIcon = l.divIcon({
    //             className: 'visiomatic-marker-position',
    //             iconAnchor: iconAnchor,
    //             html:'<i class="' + iconCls + '"></i>'
    //         });

    //         lmarkPosition = l.marker(latlng, {icon: myIcon});

    //     } else {

    //         lmarkPosition = l.marker(latlng);
    //     }

    //     lmarkPosition.addTo(map);

    //     return lmarkPosition;

    // },

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

    onToggleCrosshair: function (ra, dec, btn) {
        var me = this;
        if (btn.pressed) {
          me.drawCrosshair(ra, dec);

        } else {
          me.removeCrosshair(ra, dec);

        }
    },

    /**
     * Desenha uma crosshair marcando a coordenada passada por parametro
     * @param {Model/Array[ra,dec]} object - uma instancia de model com
     * atributos ra e dec ou um array com [ra, dec]
     * @return {I.GroupLayer} Return crosshair a groupLayer
     */
    drawCrosshair: function (ra, dec, options) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            crosshairOptions = me.getCrosshairOptions(),
            layer = null,
            labelOptions, centerPadding, size, latlng,
            lineTop, lineBottom, lineLeft, lineRight;

        labelOptions = Ext.Object.merge({}, crosshairOptions);
        if (options) {
            labelOptions = Ext.Object.merge(labelOptions, options);
        }

        // Verificar se ja tem crosshair
        if (me.lcrosshair) {
            if (map.hasLayer(me.lcrosshair)) {
                // se ja houver remove do map
                map.removeLayer(me.lcrosshair);
                me.lsmallcrosshair = null;
            }
        }

        // coordenadas
        latlng = l.latLng(dec, ra);

        // centerPadding e a distancia que as linhas vao ter a partir do centro.
        centerPadding = ((labelOptions.centerPadding) ?
                labelOptions.centerPadding : 0.001);

        size = ((labelOptions.size) ?
                labelOptions.size : 0.005);

        lineTop       = [l.latLng((dec + centerPadding), ra), l.latLng((dec + size), ra)];
        lineBottom    = [l.latLng((dec - centerPadding), ra), l.latLng((dec - size), ra)];
        lineLeft      = [l.latLng(dec, (ra + centerPadding)), l.latLng(dec, (ra + size))];
        lineRight     = [l.latLng(dec, (ra - centerPadding)), l.latLng(dec, (ra - size))];

        lineTop     = l.polyline(lineTop, labelOptions);
        lineBottom  = l.polyline(lineBottom, labelOptions);
        lineLeft    = l.polyline(lineLeft, labelOptions);
        lineRight   = l.polyline(lineRight, labelOptions);

        layer = new l.LayerGroup(
                [lineTop, lineBottom, lineLeft, lineRight]);

        me.lcrosshair = layer;

        if (me.getShowCrosshair()) {
            map.addLayer(me.lcrosshair);

        }

        return me.lcrosshair;
    },

    removeCrosshair: function() {
        var me = this,
            map = me.getMap();

        // Verificar se ja tem crosshair
        if (me.lcrosshair) {
            if (map.hasLayer(me.lcrosshair)) {
                // se ja houver remove do map
                map.removeLayer(me.lcrosshair);
                me.lsmallcrosshair = null;
            }
        }
    },

    drawSmallCrosshair: function (ra, dec, options) {
        var me = this,
            l = me.libL,
            map = me.getMap(),
            crosshairOptions = me.getCrosshairOptions(),
            layer = null,
            labelOptions, centerPadding, size, latlng,
            lineTop, lineBottom, lineLeft, lineRight;

        labelOptions = Ext.Object.merge({}, crosshairOptions);
        if (options) {
            labelOptions = Ext.Object.merge(labelOptions, options);
        }

        // Verificar se ja tem small crosshair
        if (me.lsmallcrosshair) {
            if (map.hasLayer(me.lsmallcrosshair)) {
                // se ja houver remove do map
                map.removeLayer(me.lsmallcrosshair);
                me.lsmallcrosshair = null;
            }
        }

        // coordenadas
        latlng = l.latLng(dec, ra);

        // centerPadding e a distancia que as linhas vao ter a partir do centro.
        centerPadding = 0.005 / map._zoom;

        size = 0.01 / map._zoom;

        lineTop       = [l.latLng((dec + centerPadding), ra), l.latLng((dec + size), ra)];
        lineBottom    = [l.latLng((dec - centerPadding), ra), l.latLng((dec - size), ra)];
        lineLeft      = [l.latLng(dec, (ra + centerPadding)), l.latLng(dec, (ra + size))];
        lineRight     = [l.latLng(dec, (ra - centerPadding)), l.latLng(dec, (ra - size))];

        lineTop     = l.polyline(lineTop, options);
        lineBottom  = l.polyline(lineBottom, options);
        lineLeft    = l.polyline(lineLeft, options);
        lineRight   = l.polyline(lineRight, options);

        layerSmall = new l.LayerGroup(
                [lineTop, lineBottom, lineLeft, lineRight]);

        me.lsmallcrosshair = layerSmall;

        if (me.getEnableSmallCrosshair() && options) {
            map.addLayer(me.lsmallcrosshair);

        }

        return me.lsmallcrosshair;
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

    showDownloadWindow: function () {
        var me = this,
            currentDataset = me.getCurrentDataset(),
            tilename;

        if (currentDataset.get('tli_tilename')) {

          tilename = currentDataset.get('tli_tilename');
          tag = currentDataset.get('release_name');

          var winDownload = Ext.create('visiomatic.download.DescutDownloadWindow');
          winDownload.loadFits(tilename, tag);
          winDownload.show();

        } else {

          alert ('File not found.')

        }

    },

    /**
     * @description Exibe um menu de contexto
     */
    // showContextMenuImage: function(event){
    //     var me     = this,
    //         target = event.target,
    //         xy     = {x:event.originalEvent.clientX, y:event.originalEvent.clientY};

    //     if (!me.getEnableContextMenu()) return;

    //     if (event.originalEvent.target.classList.contains('comment-maker') && !target.targetPosition){
    //         return me.showContextMenuObject(event);
    //     }

    //     if (!this.contextMenuImage){
    //         this.contextMenuImage = new Ext.menu.Menu({
    //             items: [
    //                 {
    //                     id: 'comment-position',
    //                     text: 'Comment Position',
    //                     handler: function(item) {
    //                         me.fireEvent('imageMenuItemClick', me.contextMenuImage.target, me.getCurrentDataset());
    //                     }
    //                 }
    //               ]
    //         });
    //     }

    //     target.latlng = event.latlng;
    //     me.contextMenuImage.target = target;
    //     me.contextMenuImage.showAt(xy);
    // },

    initCrop: function() {
        var me = this,
            map = me.getMap();
        map.on('mousedown', me.startCrop, me);
        me.isCropping = true;
        map.dragging.removeHooks();
    },

    startCrop: function(){
        var me = this,
            map = me.getMap();

        me.cropInit = me.currentPosition
        me.cropEnd = me.cropInit;

        map.off('mousedown', me.startCrop, me);
        map.on('mouseup', me.endCrop, me);
    },

    endCrop: function(event){
        var me = this,
            map = me.getMap();

        me.cropEnd = me.currentPosition
        map.off('mouseup', me.endCrop, me);
        me.downloadCrop(me.cropInit, me.cropEnd);
        if (me.cropRectangle) {
          map.removeLayer(me.cropRectangle);
        }
        me.cropInit = null;
        me.isCropping = false;
        map.dragging.addHooks();
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

        var winDownload = Ext.create('visiomatic.crop.CropWindow', {
          image: hiddenlink,
          height: dy+100,
          width: dx+100,
          minWidth: 300,
          minHeight: 200
        });
        // hiddenlink.click();
    },

    // showContextMenuObject: function(event){
    //     var objectMenuItem,
    //         me = this,
    //         xy = {x:event.originalEvent.clientX, y:event.originalEvent.clientY};

    //     if (!me.getEnableContextMenu()) return;

    //     if (!this.contextMenuObject){
    //         this.contextMenuObject = new Ext.menu.Menu({
    //             items: [
    //                 {
    //                     id: 'comment-object',
    //                     text: 'Comment Object',
    //                     handler: function(item) {
    //                         me.fireEvent('objectMenuItemClick', event, this.feature);
    //                     }
    //                 }]
    //         });
    //     }

    //     objectMenuItem = me.contextMenuObject.items.get("comment-object");
    //     objectMenuItem.feature = event.layer ? event.layer.feature :  null;

    //     me.contextMenuObject.showAt(xy);
    // },

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
            lineTop, lineBottom, lineLeft, lineRight, lt, lb, ll, lr;


        pathOptions = Ext.Object.merge(me.getCrosshairOptions(), options)

        lineTop = [l.latLng(urdec, llra), l.latLng(urdec, urra)];
        lineBottom = [l.latLng(lldec, llra), l.latLng(lldec, urra)];
        lineLeft = [l.latLng(urdec, urra), l.latLng(lldec, urra)];
        lineRight = [l.latLng(urdec, llra), l.latLng(lldec, llra)];


        lt = l.polyline(lineTop, pathOptions);
        lb = l.polyline(lineBottom, pathOptions);
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
