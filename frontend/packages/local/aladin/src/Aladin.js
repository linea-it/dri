Ext.define('aladin.Aladin', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.aladin',

    requires: [
        'common.BandFilter'
    ],

    mixins: {
        events: 'aladin.Events',
        interface: 'aladin.Interfaces'
    },

    layout: 'fit',

    libA: null,

    // verde, azul, vermelho, amarelo, laranja, roxo, rosa,
    colorsDefault: ['#A0F65A', '#00BFFF', '#FF0000', '#FFFF00', '#FF7F00', '#7D26CD', '#FF1493'],
    colorsAvailable: [],

    config: {

        // Id da div que vai receber o aladin
        aladinId: null,

        // Instancia do Componente Ext que e a div.
        cmpAladin: null,

        // Instancia do aladin
        aladin: null,

        // flag que indica que o componete aladin ja foi renderizado.
        aladinReady: false,

        // Diretorio das imagens HIPS ex: '/static/stripeHiPS'
        hipsDir: '/static/stripeHiPS',

        // Opcoes iniciais do aladin
        aladinOptions: {
            fov: 180,
            target: '02 23 11.851 -09 40 21.59',
            cooFrame: 'J2000',
            survey: 'empty_survey',
            showReticle: true,
            showZoomControl: true,
            showFullscreenControl: true,
            showLayersControl: false,
            showGotoControl: false,
            showShareControl: false,
            showCatalog: true,
            showFrame: false,
            showCooGrid: false,
            fullScreen: false,
            reticleColor: 'rgb(178, 50, 178)',
            reticleSize: 28,
            log: true,
            allowFullZoomout: true
        },

        // largura e altura do aladin, para que o tamanho fique fixo
        // e necessario que o autoSize seja falso.
        aladinWidth: 300,
        aladinHeight: 300,
        autoSize: true,

        storeSurveys: null,
        storeMaps: null,

        surveys: [],
        maps: [],

        colorMaps: [],

        emptySurvey: {
            'id': 'empty_survey',
            'url': '',
            'name': '',
            'filter': '',
            'maxOrder': 11,
            'frame': 'equatorial',
            'options': {
                imgFormat: 'png'
            }
        },

        // LayersControl
        enableLayersControl: true,

        // Habilitar a toolbar
        enableToolbar: true,

        // Barra com botoes para escolher a banda da imagem
        showFilters: false,
        bandFilter: null,
        // array de filtros disponiveis baseado no array surveys
        availableFilters: [],

        // Menu para controle dos layers
        enableViewMenu: true,

        // Botao para exportar para PNG
        enableExportPng: true,

        // Botao para mostrar ou ocultar a crosshair
        enableReticle: true,

        // Botao para mostrar ou ocultar a healpixgrid
        enableHealpixGrid: true,

        // Menu que permite trocar as cores da imagem
        enableColorMap: true,

        // Botao para mostrar ou ocultar o footprint
        enableFootprint: true,

        // Parametro para mostrar ou ocultar o footprint por default
        hideFootprint: true,

        // habilitar o campo de GoTo
        enableGoto: false,
        // esse parametro determina se o campo de GoTo, vai posicionar a imagem na coordenada
        // ou se vai disparar um evento.
        gotoSetPosition: true,

        // Este array permite adicionar mais items na toolbar.
        auxTools: [],

        // Instancia de uma Store com os tags disponiveis,
        // sera usada para criar um menu view com os tags disponiveis para tile grid.
        storeTags: null,

        // Instancia de uma Store com a lista de tiles que sera usada para
        // a tile grid e para saber a tile baseada na posicao.
        storeTiles: null,

        // Estado inicial Tile Grid true para visivel.
        tilesGridVisible: false,

        // Habilita o menu Info, que exibe informacoes adicionais sobre a coordenada atual.
        enableInfo: true,

        // true para  opcao Info ligada por default e false para iniciar desmarcada.
        infoEnabled: true,

        // String ra, dec da posicao atual do reticle.
        location: '',
        mlocation: '',

        // FoV inicial tem preferencia sobre o FoV do survey.
        initialFov: null,

        // habilitar ou desabilitar a exibicao de mapas
        enableMaps: true,

        // habilitar botao que permite troca entre Visiomatic / Aladin
        enableShift: false,

        // toolbar position (left or top)
        toolbarPosition: 'left',

        // Aladin default surveys
        externalSurveys: [
            {
                "id": "P/2MASS/color",
                "url": "http://alasky.u-strasbg.fr/2MASS/Color",
                "name": "2MASS colored",
                "maxOrder": 9,
                "frame": "equatorial",
                "format": "jpeg"
            },
            {
                "id": "P/DSS2/color",
                "url": "http://alasky.u-strasbg.fr/DSS/DSSColor",
                "name": "DSS colored",
                "maxOrder": 9,
                "frame": "equatorial",
                "format": "jpeg"
            },
            {
                "id": "P/DSS2/red",
                "url": "http://alasky.u-strasbg.fr/DSS/DSS2Merged",
                "name": "DSS2 Red (F+R)",
                "maxOrder": 9,
                "frame": "equatorial",
                "format": "jpeg fits"
            },
            {
                "id": "P/Fermi/color",
                "url": "http://alasky.u-strasbg.fr/Fermi/Color",
                "name": "Fermi color",
                "maxOrder": 3,
                "frame": "equatorial",
                "format": "jpeg"
            },
            {
                "id": "P/Finkbeiner",
                "url": "http://alasky.u-strasbg.fr/FinkbeinerHalpha",
                "maxOrder": 3,
                "frame": "galactic",
                "format": "jpeg fits",
                "name": "Halpha"
            },
            // {
            //     "id": "P/GALEXGR6/AIS/color",
            //     "url": "http://alasky.u-strasbg.fr/GALEX/GR6-02-Color",
            //     "name": "GALEX Allsky Imaging Survey colored",
            //     "maxOrder": 8,
            //     "frame": "equatorial",
            //     "format": "jpeg"
            // },
            {
                "id": "P/IRIS/color",
                "url": "http://alasky.u-strasbg.fr/IRISColor",
                "name": "IRIS colored",
                "maxOrder": 3,
                "frame": "galactic",
                "format": "jpeg"
            },
            {
                "id": "P/Mellinger/color",
                "url": "http://alasky.u-strasbg.fr/MellingerRGB",
                "name": "Mellinger colored",
                "maxOrder": 4,
                "frame": "galactic",
                "format": "jpeg"
            },
            {
                "id": "P/SDSS9/color",
                "url": "http://alasky.u-strasbg.fr/SDSS/DR9/color",
                "name": "SDSS9 colored",
                "maxOrder": 10,
                "frame": "equatorial",
                "format": "jpeg"
            },
            // {
            //     "id": "P/SPITZER/color",
            //     "url": "http://alasky.u-strasbg.fr/SpitzerI1I2I4color",
            //     "name": "IRAC color I1,I2,I4 - (GLIMPSE, SAGE, SAGE-SMC, SINGS)",
            //     "maxOrder": 9,
            //     "frame": "galactic",
            //     "format": "jpeg"
            // },
            {
                "id": "P/VTSS/Ha",
                "url": "http://alasky.u-strasbg.fr/VTSS/Ha",
                "maxOrder": 3,
                "frame": "galactic",
                "format": "png jpeg fits",
                "name": "VTSS-Ha"
            },
            // {
            //     "id": "P/XMM/EPIC",
            //     "url": "http://saada.u-strasbg.fr/xmmallsky",
            //     "name": "XMM-Newton stacked EPIC images (no phot. normalization)",
            //     "maxOrder": 7,
            //     "frame": "equatorial",
            //     "format": "png fits"
            // },
            {
                "id": "P/XMM/PN/color",
                "url": "http://saada.unistra.fr/xmmpnsky",
                "name": "XMM PN colored",
                "maxOrder": 7,
                "frame": "equatorial",
                "format": "png jpeg"
            },
            {
                "id": "P/allWISE/color",
                "url": "http://alasky.u-strasbg.fr/AllWISE/RGB-W4-W2-W1/",
                "name": "AllWISE color",
                "maxOrder": 8,
                "frame": "equatorial",
                "format": "jpeg"
            },
            {
                "id": "P/GLIMPSE360",
                "url": "http://www.spitzer.caltech.edu/glimpse360/aladin/data",
                "name": "GLIMPSE360",
                "maxOrder": 9,
                "frame": "equatorial",
                "format": "jpeg"
            }
        ]
    },

    /**
     * @property {Boolean} isFirstSurvey
     * true somente a primeira vez que um survey for exibido
     * essa variavel e resetada toda vez que e setado um novo array de surveys
     */
    isFirstSurvey: true,

    viewModel: {
        data: {
            location: '',
            mlocation: '',
            tile: null,
            tag: null,
            release: null,
            release_name: '',
        }
    },

    session: true,

    preventDbClickFire: false,

    runner: null,

    initComponent: function () {
        // console.log('Aladin - initComponent()');

        var me = this,
            cmpAladin,
            tollbar,
            btns;

        if (window.A) {
            me.libA = window.A;
        } else {
            console.log('window.A ainda nao esta carregada');
        }

        me.setAladinId(me.getId() + '-placeholder');

        cmpAladin = Ext.create('Ext.Component', {
            id: me.getAladinId(),
            width: me.getAladinWidth(),
            height: me.getAladinHeight()
        });

        if (me.getEnableToolbar()) {
            tollbar = me.leftToolBar = me.makeToolbar();
            btns = me.makeToolbarButtons();
            tollbar.add(btns);

            if (me.getToolbarPosition() === 'left') {
                me.lbar = tollbar;
            } else if (me.getToolbarPosition() === 'top') {
                me.tbar = tollbar;
            }
        }

        Ext.apply(this, {
            items: [
                cmpAladin
            ],
            listeners: {
                scope: me,
                afterrender: 'onAfterrender'
                //onpanend: 'onPanEnd'
            }
        });

        me.runner = Ext.create('Ext.util.TaskRunner', {});

        me.callParent(arguments);
    },

    onAfterrender: function () {
        var me = this,
            aladinId = '#' + me.getAladinId(),
            libA = me.libA,
            aladinOptions = me.getAladinOptions(),
            aladin, el;

        aladin = libA.aladin(
            // Id da div que recebera o aladin
            aladinId,
            // opcoes do aladin
            aladinOptions
        );

        // override native aladin setUnknownSurveyIfNeeded method
        // o método fosobrescrito pq adiciona uma survey vazia após a apolicação adicionar a sua própria survey
        aladin.view.setUnknownSurveyIfNeeded = function () { };

        aladin._setImageSurvey = aladin.setImageSurvey;
        aladin.setImageSurvey = function (surveyId, callback) {
            return aladin._setImageSurvey(surveyId, function () {
                me.onChangeImageSurvey();
                if (callback) callback();
            });
        };

        me.setAladin(aladin);

        me.createImageSurveys();

        if (me.getEnableColorMap()) {
            me.updateColorMapMenu();
        }

        if (me.getInfoEnabled()) {
            me.enableDisableInfo(null, me.getInfoEnabled());
        }

        // Custom events
        me.addCustomEvents();

        me.setAladinReady(true);
        me.fireEvent('aladinready', me);

    },

    onChangeImageSurvey: function () {
        //console.log('ImageSurvey Changed');
        // Custom events
        this.addCustomEvents();
    },

    aladinIsReady: function () {
        var me = this;

        return me.getAladinReady();
    },

    getRaDec: function () {
        var me = this,
            aladin = me.getAladin();

        return aladin.getRaDec();
    },

    getEmptySurvey: function () {

        return Ext.clone(this.emptySurvey);
    },

    readProperties: function (rootUrl, successCallback, errorCallback) {
        ProgressiveCat.readProperties(rootUrl, successCallback, errorCallback);
    },

    onResize: function () {
        var me = this,
            aladin = me.getAladin();

        if (me.getAutoSize()) {
            aladin.view.fixLayoutDimensions();
        }
    },

    setSurveys: function (surveys) {
        this.surveys = null;
        this.surveys = surveys;

        if ((this.getAladin()) && (surveys.length > 0)) {
            // Apagar todas as layer
            this.removeLayers();

            this.createImageSurveys();
        }
    },

    createImageSurvey: function (survey) {
        var me = this,
            empty = me.getEmptySurvey(),
            aladin = me.getAladin(),
            newSurvey,
            alSurvey,
            token;

        newSurvey = Ext.Object.merge(empty, survey);

        alSurvey = aladin.createImageSurvey(
            String(newSurvey.id),
            newSurvey.name,
            newSurvey.url,
            newSurvey.cooFrame,
            newSurvey.maxOrder,
            newSurvey.options
        );

        return alSurvey;
    },

    createImageSurveys: function () {
        var me = this,
            surveys = me.getSurveys(),
            filter = me.getFilter(),
            empty = me.getEmptySurvey(),
            sv,
            selectedSurvey;

        if (surveys.length === 0) {
            surveys.push(empty);
        }

        for (var i in surveys) {
            sv = surveys[i];

            me.createImageSurvey(sv);
        }

        if (filter) {
            selectedSurvey = me.getSurveyByFilter(filter);

        } else {
            // quando nao houver o bandFilter retornar o primeiro survey
            selectedSurvey = surveys[0];
        }

        // Adicionar esses surveys ao menu Image Survey
        me.updateImageLayersMenuItems();

        me.setImageSurvey(selectedSurvey);

    },

    getSurveyByFilter: function (filter) {
        var me = this,
            surveys = me.getSurveys(),
            sv;

        for (var i in surveys) {
            sv = surveys[i];

            if (sv.filter.toLowerCase() == filter.toLowerCase()) {
                return sv;

            }
        }
    },

    getImageSurvey: function () {
        var me = this,
            aladin = me.getAladin();

        if (aladin) {
            return aladin.getBaseImageLayer();
        } else {
            return null;
        }
    },

    setImageSurvey: function (imageSurvey) {
        var me = this,
            aladin = me.getAladin(),
            empty = me.getEmptySurvey();

        if (imageSurvey) {

            aladin.setImageSurvey(imageSurvey.id);

            if (me.isFirstSurvey) {

                if (imageSurvey.target !== '') {
                    me.goToPosition(imageSurvey.target);

                }

                // Verificar se tem start FoV esse paramtro tem preferencia
                // sobre o FoV do survey.
                if (me.getInitialFov()) {
                    me.setFov(me.getInitialFov());

                } else {
                    if (imageSurvey.fov) {
                        me.setFov(imageSurvey.fov);

                    }
                }

                me.isFirstSurvey = false;
            }

            // Mostrar o footprint
            me.showDesFootprint();

            // Custom events
            me.addCustomEvents();

            // Disparar evento changeimage
            me.fireEvent('changeimage', imageSurvey, me);

        } else {
            // TODO NAO MOSTRAR SURVEY NENHUM
            aladin.setImageSurvey(empty.id);
        }
    },

    setStoreSurveys: function (store) {
        var me = this;

        if (store) {
            store.on(
                {
                    scope: this,
                    load: 'onStoreSurveysLoad',
                    beforeload: 'onStoreSurveysBeforeLoad'
                }
            );

            me.storeSurveys = store;
        }
    },

    /**
     * Toda vez que a store for ser carregada
     * e adicionado o layer de load.
     * @param {Object} store - insatancia da store Surveys
     */
    onStoreSurveysBeforeLoad: function (store) {
        var me = this;

        me.setLoading({
            store: store

        });

    },

    onStoreSurveysLoad: function (store) {
        var me = this,
            aladin = me.getAladin(),
            empty = me.getEmptySurvey(),
            surveys = [],
            filters = [],
            s;

        if (store.count() === 0) {
            console.log('NAO TEM SURVEY');
            me.setImageSurvey(empty);
        }

        // criar um array com os elementos da store
        // fazendo um parse para o formato usado pelo aladin
        store.each(function (record) {
            s = {
                id: String(record.get('id')),
                url: record.get('srv_url'),
                name: record.get('srv_display_name'),
                filter: record.get('filter'),
                target: record.get('srv_target'),
                fov: record.get('srv_fov')
            };

            surveys.push(s);

            filters.push(record.get('filter'));
        });

        me.setSurveys(surveys);

        me.setAvailableFilters(filters);
    },

    setLocation: function (location, mlocation) {
        var me = this,
            vm = me.getViewModel();

        me.location = location;
        me.mlocation = mlocation;

        vm.set('location', location);
        vm.set('mlocation', mlocation);

        if (me.getAladin()) {
            me.onChangeLocation();
        }

    },

    onChangeLocation: function (radec) {
        var me = this;

        if (!radec) {
            radec = me.getRaDec();
        }

        me.identifyTile(radec);

        me.updateInfoData();

    },

    setAvailableFilters: function (filters) {
        var me = this,
            bandFilter = me.getBandFilter();

        if (filters.length > 0) {
            // testar se o bandfilter esta ativo
            if (me.getShowFilters()) {
                bandFilter.setAvailableFilters(filters);

            }
        }
    },

    setStoreTags: function (store) {
        var me = this;

        if (store) {
            me.storeTags = store;

            store.on('load', 'onLoadStoreTags', this);
        }
    },

    onLoadStoreTags: function (store) {
        var me = this;

        // verficar se o menu view esta ativo,
        // se tiver criar uma nova entrada com os tags disponivies.
        if (me.getEnableViewMenu()) {
            if (store.count() > 0) {
                me.createTileGridMenu();

            }
        }
    },

    setStoreTiles: function (store) {
        var me = this;

        me.storeTiles = store;

        store.on('beforeload', 'onBeforeloadStoreTiles', this);
        store.on('load', 'onLoadStoreTiles', this);

    },

    /**
     * Executado antes da Store Tiles fazer a requisicao
     * esta sendo usado para adicionar a mensagem de load que sera removida
     * apos o load. dessa forma travando a tela ate que as informacoes das
     * tiles sejam carregadas, impedindo que o usuario possa fazer outra acao
     * antes do termino do carregamento.
     */
    onBeforeloadStoreTiles: function () {
        //console.log('onBeforeloadStoreTiles()');
        var me = this;

        me.setLoading(true);
    },

    /**
     * Executado toda vez que a store tiles e carregada,
     * - verifica se o menu tilegrid esta habilitado e se estiver
     * executa o metodo para fazer o plot da tile grid.
     */
    onLoadStoreTiles: function () {
        // console.log('onLoadStoreTiles');
        var me = this,
            menu;

        me.setLoading(false);

        // recuperar o menu tileGrid e verificar se tem tags marcadas
        if (me.getEnableViewMenu()) {
            menu = me.down('#TileGridMenu');

            if (menu.checked) {
                me.onCheckTileGridMenu(menu, menu.checked);

            }
        }

        // Identificar se a posicao atual esta sobre uma tile
        me.identifyTile();

    },

    /**
     * Retorna a tile que contiver a coordenada.
     * Verifica se uma coordenada esta dentro de uma das tiles
     * carregadas na store Tiles.
     *
     * @param {Array} position Opicinal - array com ra e dec [float(ra), float(dec)]
     * caso nao seja passado o parametro position sera usado a posicao atual do reticle.
     *
     * @return {object} tile - retorna a tile correspondente a coordenada ou undefined
     * caso nao encontre.
     **/
    getTileByPosition: function (position) {
        var me = this,
            store = me.getStoreTiles(),
            radec = position,
            tile;

        if (!position) {
            radec = me.getRaDec();

        }

        if ((store) && (store.count())) {
            tile = store.filterByRaDec(radec[0], radec[1]);

        }

        return tile;
    },

    /**
     * Identifica uma tile pela sua posicao
     * e seta no view model as informacoes da tile que combina com a coordenada.
     * @param  {Array} radec coordenada a ser usada na busca da tile.
     */
    identifyTile: function (radec) {
        var me = this,
            vm = me.getViewModel(),
            oldtile = vm.get('tileid'),
            tile, tag;

        tile = me.getTileByPosition(radec);

        if (tile) {
            if (tile.get('id') !== oldtile) {
                tag = me.getStoreTags().getById(tile.get('tag'));

                vm.set('release_name', tile.get('release_display_name'));
                vm.set('tile', tile);
                vm.set('tag', tag);

                me.fireEvent('changetile', tile, tag, me);
            }

        } else {
            vm.set('tile', null);
            vm.set('tag', null);

            me.fireEvent('changetile', tile, tag, me);
        }
    },

    onFilter: function (filter) {
        var me = this,
            survey;

        survey = me.getSurveyByFilter(filter);

        me.setImageSurvey(survey);

        me.fireEvent('changefilter', filter, me);
    },

    getFilter: function () {
        var me = this,
            bandFilter = me.getBandFilter();

        if (me.getShowFilters()) {
            return bandFilter.getFilter();

        }
    },

    setFilter: function (filter) {
        var me = this,
            bandFilter = me.getBandFilter();

        bandFilter.setFilter(filter);
    },

    changeMapSurvey: function (menuitem) {
        // console.log('menuitem: %o', menuitem);

        var me = this,
            aladin = me.getAladin(),
            survey;

        survey = {
            id: String(menuitem.map_id),
            url: menuitem.map_url,
            name: menuitem.map_name,
            filter: menuitem.map_filter,
            maxOrder: 3
        };

        mapSurvey = me.createImageSurvey(survey);

        aladin.setImageSurvey(mapSurvey.id);
    },

    selectExternalSurvey: function (menuitem) {
        // console.log('selectExternalSurvey(%o)', menuitem);
        var me = this,
            aladin = me.getAladin(),
            externalSurvey = menuitem.survey;

        aladin.setImageSurvey(externalSurvey.id);
    },

    exportAsPng: function () {
        var me = this,
            aladin = me.getAladin();

        aladin.exportAsPNG();
    },

    showReticle: function (btn, state) {
        var me = this,
            aladin = me.getAladin();

        aladin.showReticle(state);
    },

    showHealpixGrid: function (btn, state) {
        var me = this,
            aladin = me.getAladin();

        aladin.showHealpixGrid(state);
    },

    showDesFootprint: function (menu, state) {
        var me = this;

        if (!menu) {
            menu = me.down('#DesFootprint');
            state = menu.checked;
        }

        me.plotDesFootprint(state);
    },

    reverseColor: function () {
        var me = this,
            aladin = me.getAladin();

        aladin.getBaseImageLayer().getColorMap().reverse();
    },

    changeColorMap: function (menu) {
        var me = this,
            aladin = me.getAladin();

        aladin.getBaseImageLayer().getColorMap().update(menu.mapName);

    },

    plotDesFootprint: function (visible) {
        var me = this,
            aladin = me.getAladin();

        des = me.getDesFootprintCoordinates();

        if (aladin.view.overlays[0] != undefined) {
            overlays = aladin.view.overlays;

            plotDes = false;

            for (var i = overlays.length - 1; i >= 0; i--) {
                if (overlays[i].name == 'des') {
                    plotDes = true;

                    if (visible) {
                        overlays[i].show();

                    } else {
                        overlays[i].hide();

                    }
                }
            }
            if (plotDes == false) {
                var overlay = A.graphicOverlay({ color: '#ee2345', lineWidth: 2, name: 'des' });

                aladin.addOverlay(overlay);
                overlay.add(A.polyline(des));

            }
        } else {
            var overlay = A.graphicOverlay({ color: '#ee2345', lineWidth: 2, name: 'des' });

            aladin.addOverlay(overlay);
            overlay.add(A.polyline(des));

        }
    },

    /**
     * Mostra ou esconde todas as tiles disponiveis no Release.
     * Ao selecionar ou deselecionar o menu Tile Grid
     * todos os subitems do menu devem ficar com o mesmo status.
     * @param {Object} item - menuitem TileGridMenu
     * @param {boolean} checked - status true mostra as tiles false esconde.
     **/
    onCheckTileGridMenu: function (item, checked) {
        var me = this,
            submenu = item.getMenu();

        if (submenu) {
            submenu.items.each(function (i) {
                i.setChecked(checked);

            }, me);
        }
    },

    onCheckTileGrid: function (item, checked) {
        this.showTileGrid(item.tag, checked);
    },

    showTileGrid: function (tagId, show) {
        var me = this,
            storeTiles = me.getStoreTiles(),
            storeTags = me.getStoreTags(),
            tag = storeTags.getById(tagId),
            tiles;

        if (show) {
            tiles = storeTiles.query('tag', tagId);

            if (tiles.count() > 0) {
                me.plotFootprint(tag, tiles);
            }

        } else {
            me.setVisibleFootprint(tag.get('tag_name'), false);

        }

    },

    plotFootprint: function (tag, data) {
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            overlay, catalog, news;

        catalog = libA.catalog({
            name: 'Recent tiles',
            sourceSize: 14,
            color: '#e67e22'
        });

        // checar se estas tiles ja foram plotadas
        overlay = me.getFootprintByName(tag.get('tag_name'));

        if (overlay) {
            // Se ja existir exibir
            overlay.show();

        } else {
            // se nao existir criar
            overlay = libA.graphicOverlay(
                {
                    color: me.getColor(),
                    lineWidth: 1,
                    name: String(tag.get('tag_name'))
                }
            );

            aladin.addOverlay(overlay);

            data.each(function (tile) {
                var tPath = [
                    [tile.get('raul'), tile.get('decul')],
                    [tile.get('rall'), tile.get('decll')],
                    [tile.get('ralr'), tile.get('declr')],
                    [tile.get('raur'), tile.get('decur')]
                ];

                overlay.addFootprints(
                    libA.polygon(tPath));

                if (tile.get('is_new')) {
                    news = true;
                    catalog.addSources([
                        libA.marker(
                            tile.get('tli_ra'),
                            tile.get('tli_dec'),
                            {
                                popupTitle: 'Tile Recently Added',
                                popupDesc: 'Creation date: ' + tile.get('date')
                            })
                    ]);
                }

            }, this);

            if ((news) && (!tag.get('is_new'))) {
                aladin.addCatalog(catalog);
            }
        }
    },

    parsePosition: function (position) {
        var ra, dec, newposition;

        if (position) {
            // Fix if value in degrees need a space between values
            if (position.indexOf(',') != -1) {
                position = position.split(',');
                ra = parseFloat(position[0].trim());
                dec = parseFloat(position[1].trim());

                // Converter RA para 0-360
                if (ra < 0) {
                    ra = ra + 360;
                }

                newposition = [ra, dec];
                position = newposition.join(', ');
            } else {
                position = newposition;
            }

            return position
        }
    },

    goToPosition: function (position) {
        // console.log('goToPosition(%o)', position);
        var me = this,
            aladin = me.getAladin(),
            newposition;

        if (position) {
            // Fix if value in degrees need a space between values
            newposition = me.parsePosition(position);

            aladin.gotoObject(newposition);
        }
    },

    setFov: function (fovDegrees) {
        var me = this,
            aladin = me.getAladin(),
            fov = parseFloat(fovDegrees);

        if (fov) {
            aladin.setFoV(fov);
        }
    },

    getFov: function () {
        var me = this,
            aladin = me.getAladin();

        return aladin.getFov()[0];
    },

    getFootprintByName: function (name) {
        var me = this,
            aladin = me.getAladin(),
            overlays = aladin.view.overlays,
            result = null;

        if (overlays.length > 0) {
            overlays.forEach(function (item) {
                if (item.name == name) {
                    result = item;
                }
            });
        }

        return result;
    },

    setVisibleFootprint: function (name, visible) {
        var me = this,
            overlay;

        if (visible == 'undefined') {
            visible = true;

        }

        overlay = me.getFootprintByName(name);

        if (overlay) {
            if (visible) {
                overlay.show();

            } else {
                overlay.hide();

            }
        }
    },

    removeLayers: function () {
        var me = this,
            aladin = me.getAladin();

        aladin.removeLayers();
    },

    getColor: function () {
        var me = this,
            colors = me.colorsDefault,
            color;

        if (me.colorsAvailable.length === 0) {
            me.colorsAvailable = Ext.clone(colors);

        }

        color = me.colorsAvailable.shift();

        return color;

    },

    onShift: function () {
        this.fireEvent('shift', this.getRaDec(), this);

    },

    onShowLayerBox: function () {
        var me = this,
            aladin = me.getViewModel().getView().getAladin();

        aladin.hideBoxes();
        aladin.showLayerBox();

        return false;
    },


    overlayDrawCircle: function (source, canvasCtx, viewParams) {
        // define custom draw function
        // http://aladin.unistra.fr/AladinLite/doc/API/examples/cat-custom-draw-function/
        canvasCtx.beginPath();
        canvasCtx.arc(source.x, source.y, source.data['size'] * 2, 0, 2 * Math.PI, false);
        canvasCtx.closePath();
        canvasCtx.strokeStyle = '#c38';
        canvasCtx.lineWidth = 3;
        canvasCtx.globalAlpha = 0.7,
            canvasCtx.stroke();
        var fov = Math.max(viewParams['fov'][0], viewParams['fov'][1]);

        return;
    },

    getDesFootprintCoordinates: function () {
        var area = [[23.00000, -7.00000],
        [22.00000, -7.00000],
        [21.00000, -7.00000],
        [20.00000, -7.00000],
        [19.00000, -7.00000],
        [18.00000, -7.00000],
        [17.00000, -7.00000],
        [16.00000, -7.00000],
        [15.00000, -7.00000],
        [14.00000, -7.00000],
        [13.00000, -7.00000],
        [12.00000, -7.00000],
        [11.00000, -7.00000],
        [10.00000, -7.00000],
        [9.00000, -7.00000],
        [8.00000, -7.00000],
        [7.00000, -7.00000],
        [6.00000, -7.00000],
        [5.00000, -7.00000],
        [4.00000, -7.00000],
        [3.00000, -7.00000],
        [2.00000, -7.00000],
        [1.00000, -7.00000],
        [0.00000, -7.00000],
        [0.00000, -6.00000],
        [0.00000, -5.00000],
        [0.00000, -4.00000],
        [0.00000, -3.00000],
        [0.00000, -2.00000],
        [-1.00000, -2.00000],
        [-2.00000, -2.00000],
        [-3.00000, -2.00000],
        [-4.00000, -2.00000],
        [-5.00000, -2.00000],
        [-6.00000, -2.00000],
        [-7.00000, -2.00000],
        [-8.00000, -2.00000],
        [-9.00000, -2.00000],
        [-10.00000, -2.00000],
        [-11.00000, -2.00000],
        [-12.00000, -2.00000],
        [-13.00000, -2.00000],
        [-14.00000, -2.00000],
        [-15.00000, -2.00000],
        [-16.00000, -2.00000],
        [-17.00000, -2.00000],
        [-18.00000, -2.00000],
        [-19.00000, -2.00000],
        [-20.00000, -2.00000],
        [-21.00000, -2.00000],
        [-22.00000, -2.00000],
        [-23.00000, -2.00000],
        [-24.00000, -2.00000],
        [-25.00000, -2.00000],
        [-26.00000, -2.00000],
        [-27.00000, -2.00000],
        [-28.00000, -2.00000],
        [-29.00000, -2.00000],
        [-30.00000, -2.00000],
        [-31.00000, -2.00000],
        [-32.00000, -2.00000],
        [-33.00000, -2.00000],
        [-34.00000, -2.00000],
        [-35.00000, -2.00000],
        [-36.00000, -2.00000],
        [-37.00000, -2.00000],
        [-38.00000, -2.00000],
        [-39.00000, -2.00000],
        [-40.00000, -2.00000],
        [-41.00000, -2.00000],
        [-42.00000, -2.00000],
        [-43.00000, -2.00000],
        [-43.00000, -1.00000],
        [-43.00000, 0.00000],
        [-43.00000, 1.00000],
        [-43.00000, 2.00000],
        [-42.00000, 2.00000],
        [-41.00000, 2.00000],
        [-40.00000, 2.00000],
        [-39.00000, 2.00000],
        [-38.00000, 2.00000],
        [-37.00000, 2.00000],
        [-36.00000, 2.00000],
        [-35.00000, 2.00000],
        [-34.00000, 2.00000],
        [-33.00000, 2.00000],
        [-32.00000, 2.00000],
        [-31.00000, 2.00000],
        [-30.00000, 2.00000],
        [-29.00000, 2.00000],
        [-28.00000, 2.00000],
        [-27.00000, 2.00000],
        [-26.00000, 2.00000],
        [-25.00000, 2.00000],
        [-24.00000, 2.00000],
        [-23.00000, 2.00000],
        [-22.00000, 2.00000],
        [-21.00000, 2.00000],
        [-20.00000, 2.00000],
        [-19.00000, 2.00000],
        [-18.00000, 2.00000],
        [-17.00000, 2.00000],
        [-16.00000, 2.00000],
        [-15.00000, 2.00000],
        [-14.00000, 2.00000],
        [-13.00000, 2.00000],
        [-12.00000, 2.00000],
        [-11.00000, 2.00000],
        [-10.00000, 2.00000],
        [-9.00000, 2.00000],
        [-8.00000, 2.00000],
        [-7.00000, 2.00000],
        [-6.00000, 2.00000],
        [-5.00000, 2.00000],
        [-4.00000, 2.00000],
        [-3.00000, 2.00000],
        [-2.00000, 2.00000],
        [-1.00000, 2.00000],
        [0.00000, 2.00000],
        [0.00000, 2.00000],
        [0.00000, 3.00000],
        [0.00000, 4.00000],
        [0.00000, 5.00000],
        [1.00000, 5.00000],
        [2.00000, 5.00000],
        [3.00000, 5.00000],
        [4.00000, 5.00000],
        [5.00000, 5.00000],
        [6.00000, 5.00000],
        [7.00000, 5.00000],
        [8.00000, 5.00000],
        [9.00000, 5.00000],
        [10.00000, 5.00000],
        [11.00000, 5.00000],
        [12.00000, 5.00000],
        [13.00000, 5.00000],
        [14.00000, 5.00000],
        [15.00000, 5.00000],
        [16.00000, 5.00000],
        [17.00000, 5.00000],
        [18.00000, 5.00000],
        [19.00000, 5.00000],
        [20.00000, 5.00000],
        [21.00000, 5.00000],
        [22.00000, 5.00000],
        [23.00000, 5.00000],
        [24.00000, 5.00000],
        [25.00000, 5.00000],
        [26.00000, 5.00000],
        [27.00000, 5.00000],
        [28.00000, 5.00000],
        [29.00000, 5.00000],
        [30.00000, 5.00000],
        [31.00000, 5.00000],
        [32.00000, 5.00000],
        [33.00000, 5.00000],
        [34.00000, 5.00000],
        [35.00000, 5.00000],
        [36.00000, 5.00000],
        [37.00000, 5.00000],
        [38.00000, 5.00000],
        [39.00000, 5.00000],
        [40.00000, 5.00000],
        [41.00000, 5.00000],
        [42.00000, 5.00000],
        [43.00000, 5.00000],
        [44.00000, 5.00000],
        [45.00000, 5.00000],
        [45.00000, 5.00000],
        [45.00000, 4.00000],
        [45.00000, 3.00000],
        [45.00000, 2.00000],
        [45.00000, 1.00000],
        [45.00000, 0.00000],
        [45.00000, -1.00000],
        [45.00000, -2.00000],
        [45.00000, -3.00000],
        [45.00000, -4.00000],
        [45.00000, -5.00000],
        [45.00000, -6.00000],
        [45.00000, -7.00000],
        [45.00000, -8.00000],
        [45.00000, -9.00000],
        [45.83584, -9.06842],
        [46.36744, -9.14567],
        [46.89697, -9.22888],
        [47.42429, -9.31810],
        [47.94928, -9.41337],
        [48.47183, -9.51474],
        [48.99181, -9.62226],
        [49.50912, -9.73598],
        [50.02364, -9.85594],
        [50.53529, -9.98221],
        [51.04396, -10.11482],
        [51.54955, -10.25382],
        [52.05199, -10.39926],
        [52.55118, -10.55119],
        [53.04706, -10.70965],
        [53.53954, -10.87467],
        [54.02856, -11.04630],
        [54.51405, -11.22457],
        [54.99596, -11.40952],
        [55.47423, -11.60118],
        [55.94881, -11.79957],
        [56.41965, -12.00471],
        [56.88672, -12.21663],
        [57.34998, -12.43534],
        [57.80939, -12.66086],
        [58.26493, -12.89318],
        [58.71657, -13.13232],
        [59.16429, -13.37827],
        [59.60807, -13.63102],
        [60.04790, -13.89057],
        [60.48377, -14.15689],
        [60.91568, -14.42997],
        [61.34360, -14.70979],
        [61.76755, -14.99631],
        [62.18753, -15.28950],
        [62.60354, -15.58931],
        [63.01557, -15.89572],
        [63.42365, -16.20866],
        [63.82778, -16.52808],
        [64.22797, -16.85393],
        [66.00000, -18.00000],
        [67.00000, -18.00000],
        [68.00000, -18.00000],
        [69.00000, -18.00000],
        [70.00000, -18.00000],
        [71.00000, -18.00000],
        [72.00000, -18.00000],
        [73.00000, -18.00000],
        [74.00000, -18.00000],
        [75.00000, -18.00000],
        [76.00000, -18.00000],
        [77.00000, -18.00000],
        [78.00000, -18.00000],
        [79.00000, -18.00000],
        [80.00000, -18.00000],
        [81.00000, -18.00000],
        [82.00000, -18.00000],
        [83.00000, -18.00000],
        [84.00000, -18.00000],
        [85.00000, -18.00000],
        [86.00000, -18.00000],
        [86.66667, -19.00000],
        [87.33333, -20.00000],
        [88.00000, -21.00000],
        [88.66667, -22.00000],
        [89.41596, -23.13170],
        [89.68146, -24.36550],
        [89.95879, -25.59111],
        [90.24749, -26.80814],
        [90.54705, -28.01619],
        [90.85690, -29.21488],
        [91.17643, -30.40381],
        [91.50499, -31.58263],
        [91.84185, -32.75095],
        [92.18623, -33.90841],
        [92.53729, -35.05464],
        [92.89409, -36.18931],
        [93.25565, -37.31205],
        [93.62088, -38.42252],
        [93.98862, -39.52040],
        [94.35759, -40.60535],
        [94.72643, -41.67704],
        [95.09367, -42.73517],
        [95.45771, -43.77942],
        [95.81685, -44.80949],
        [96.16922, -45.82508],
        [96.51286, -46.82590],
        [96.84562, -47.81168],
        [97.16521, -48.78213],
        [97.46918, -49.73698],
        [97.75487, -50.67597],
        [98.01948, -51.59884],
        [98.25999, -52.50536],
        [98.47317, -53.39526],
        [98.65561, -54.26832],
        [98.80364, -55.12430],
        [98.91339, -55.96299],
        [98.98075, -56.78417],
        [99.00136, -57.58762],
        [98.97062, -58.37314],
        [98.88371, -59.14055],
        [98.73552, -59.88964],
        [98.52073, -60.62023],
        [98.23379, -61.33214],
        [98.00000, -61.50000],
        [97.00000, -61.50000],
        [96.00000, -61.50000],
        [95.00000, -61.50000],
        [94.00000, -61.50000],
        [93.00000, -61.50000],
        [92.00000, -61.50000],
        [91.00000, -61.50000],
        [90.00000, -61.50000],
        [89.00000, -61.50000],
        [88.00000, -61.50000],
        [87.00000, -61.50000],
        [86.00000, -61.50000],
        [85.00000, -61.50000],
        [84.00000, -61.50000],
        [83.00000, -62.00000],
        [78.66667, -63.00000],
        [74.33333, -64.00000],
        [69.19220, -65.62708],
        [68.29300, -65.99135],
        [67.35218, -66.34555],
        [66.36917, -66.68914],
        [65.34355, -67.02152],
        [64.27503, -67.34210],
        [63.16350, -67.65026],
        [62.00905, -67.94540],
        [60.81197, -68.22686],
        [59.57280, -68.49402],
        [58.29235, -68.00000],
        [56.97169, -68.00000],
        [55.61220, -67.00000],
        [54.21558, -66.00000],
        [52.78381, -65.50000],
        [51.31925, -65.00000],
        [49.82454, -65.00000],
        [48.30265, -65.00000],
        [46.75683, -65.00000],
        [45.19062, -65.00000],
        [43.60779, -65.00000],
        [42.01230, -65.00000],
        [40.40830, -65.00000],
        [38.80000, -65.00000],
        [37.19170, -65.00000],
        [35.58770, -65.00000],
        [33.99221, -65.00000],
        [32.40938, -65.00000],
        [30.84317, -65.00000],
        [29.29735, -65.00000],
        [27.77546, -65.00000],
        [26.28075, -65.00000],
        [24.81619, -65.00000],
        [23.38442, -65.00000],
        [21.98780, -65.00000],
        [20.62831, -65.00000],
        [19.30765, -65.00000],
        [18.02720, -65.00000],
        [16.78803, -65.00000],
        [15.59095, -65.00000],
        [14.43650, -65.00000],
        [13.32497, -65.00000],
        [12.25645, -65.00000],
        [11.23083, -65.00000],
        [10.24782, -65.00000],
        [9.30700, -65.00000],
        [8.40780, -65.00000],
        [7.54955, -65.00000],
        [4.00000, -65.00000],
        [3.00000, -65.00000],
        [2.00000, -65.00000],
        [1.00000, -65.00000],
        [0.00000, -65.00000],
        [-1.00000, -65.00000],
        [-2.00000, -65.00000],
        [-3.00000, -65.00000],
        [-4.00000, -65.00000],
        [-5.00000, -65.00000],
        [-6.00000, -65.00000],
        [-7.00000, -65.00000],
        [-8.00000, -65.00000],
        [-9.00000, -65.00000],
        [-10.00000, -65.00000],
        [-11.00000, -65.00000],
        [-12.00000, -65.00000],
        [-13.00000, -65.00000],
        [-14.00000, -65.00000],
        [-15.00000, -65.00000],
        [-16.00000, -65.00000],
        [-17.00000, -65.00000],
        [-18.00000, -65.00000],
        [-19.00000, -65.00000],
        [-20.00000, -65.00000],
        [-21.00000, -65.00000],
        [-22.00000, -65.00000],
        [-23.00000, -65.00000],
        [-24.00000, -65.00000],
        [-25.00000, -65.00000],
        [-26.00000, -65.00000],
        [-27.00000, -65.00000],
        [-28.00000, -65.00000],
        [-29.00000, -65.00000],
        [-30.00000, -65.00000],
        [-31.00000, -65.00000],
        [-32.00000, -65.00000],
        [-33.00000, -65.00000],
        [-34.00000, -65.00000],
        [-35.00000, -65.00000],
        [-36.00000, -65.00000],
        [-37.00000, -65.00000],
        [-38.00000, -65.00000],
        [-39.00000, -65.00000],
        [-40.00000, -65.00000],
        [-41.00000, -65.00000],
        [-42.00000, -65.00000],
        [-43.00000, -65.00000],
        [-44.00000, -65.00000],
        [-45.00000, -65.00000],
        [-46.00000, -65.00000],
        [-47.00000, -65.00000],
        [-48.00000, -65.00000],
        [-49.00000, -65.00000],
        [-50.00000, -65.00000],
        [-51.00000, -65.00000],
        [-52.00000, -65.00000],
        [-53.00000, -65.00000],
        [-54.00000, -65.00000],
        [-55.00000, -65.00000],
        [-56.00000, -65.00000],
        [-57.00000, -65.00000],
        [-56.80000, -64.00000],
        [-56.60000, -63.00000],
        [-56.40000, -62.00000],
        [-56.20000, -61.00000],
        [-56.00000, -60.00000],
        [-60.97560, -58.52000],
        [-60.77920, -55.26850],
        [-60.27960, -52.49310],
        [-59.92660, -50.92070],
        [-58.35500, -50.41540],
        [-56.60890, -49.56360],
        [-54.96150, -48.77660],
        [-54.80000, -48.00000],
        [-54.70000, -47.00000],
        [-54.60000, -46.00000],
        [-54.50000, -45.00000],
        [-54.40000, -44.00000],
        [-54.30000, -43.00000],
        [-54.20000, -42.00000],
        [-54.10000, -41.00000],
        [-54.00000, -40.00000],
        [-53.00000, -40.00000],
        [-52.00000, -40.00000],
        [-51.00000, -40.00000],
        [-50.00000, -40.00000],
        [-49.00000, -40.00000],
        [-48.00000, -40.00000],
        [-47.00000, -40.00000],
        [-46.00000, -40.00000],
        [-45.00000, -40.00000],
        [-44.00000, -40.00000],
        [-43.00000, -40.00000],
        [-42.00000, -40.00000],
        [-41.00000, -40.00000],
        [-40.00000, -40.00000],
        [-39.00000, -40.00000],
        [-38.00000, -40.00000],
        [-37.00000, -40.00000],
        [-36.00000, -40.00000],
        [-35.00000, -40.00000],
        [-34.00000, -40.00000],
        [-33.00000, -40.00000],
        [-32.00000, -40.00000],
        [-31.00000, -40.00000],
        [-30.00000, -40.00000],
        [-29.00000, -40.00000],
        [-28.00000, -40.00000],
        [-27.00000, -40.00000],
        [-26.00000, -40.00000],
        [-25.00000, -40.00000],
        [-24.00000, -40.00000],
        [-23.00000, -40.00000],
        [-22.00000, -40.00000],
        [-21.00000, -40.00000],
        [-20.00000, -40.00000],
        [-19.00000, -40.00000],
        [-18.00000, -40.00000],
        [-17.00000, -40.00000],
        [-16.00000, -40.00000],
        [-15.00000, -40.00000],
        [-14.00000, -40.00000],
        [-13.00000, -40.00000],
        [-12.00000, -40.00000],
        [-11.00000, -40.00000],
        [-10.00000, -40.00000],
        [-9.00000, -40.00000],
        [-8.00000, -40.00000],
        [-7.00000, -40.00000],
        [-6.00000, -40.00000],
        [-5.00000, -40.00000],
        [-4.00000, -40.00000],
        [-3.00000, -40.00000],
        [-1.47219, -38.64048],
        [-1.27518, -38.12814],
        [-1.07231, -37.61674],
        [-0.86376, -37.10640],
        [-0.64970, -36.59723],
        [-0.43028, -36.08933],
        [-0.20564, -35.58282],
        [0.02406, -35.07782],
        [0.25871, -34.57444],
        [0.49818, -34.07280],
        [0.74235, -33.57301],
        [0.99113, -33.07520],
        [1.24441, -32.57950],
        [1.50209, -32.08601],
        [1.76410, -31.59488],
        [2.03036, -31.10621],
        [2.30079, -30.62015],
        [2.57532, -30.13681],
        [2.85391, -29.65632],
        [3.13648, -29.17881],
        [3.42300, -28.70441],
        [3.71342, -28.23325],
        [4.00770, -27.76546],
        [4.30581, -27.30116],
        [4.60772, -26.84048],
        [4.91340, -26.38355],
        [5.22284, -25.93051],
        [5.53601, -25.48147],
        [5.85290, -25.03656],
        [6.17351, -24.59591],
        [6.49782, -24.15964],
        [6.82584, -23.72788],
        [7.15756, -23.30074],
        [7.49299, -22.87835],
        [7.83212, -22.46081],
        [8.17498, -22.04826],
        [8.52155, -21.64080],
        [8.87186, -21.23855],
        [9.22592, -20.84160],
        [9.58374, -20.45008],
        [9.94533, -20.06407],
        [10.31070, -19.68369],
        [10.67989, -19.30903],
        [11.05289, -18.94018],
        [11.42973, -18.57723],
        [11.81042, -18.22027],
        [12.19498, -17.86938],
        [12.58343, -17.52465],
        [12.97577, -17.18614],
        [13.37203, -16.85393],
        [13.77222, -16.52808],
        [14.17635, -16.20866],
        [14.58443, -15.89572],
        [14.99646, -15.58931],
        [15.41247, -15.28950],
        [15.83245, -14.99631],
        [16.25640, -14.70979],
        [16.68432, -14.42997],
        [17.11623, -14.15689],
        [17.55210, -13.89057],
        [17.99193, -13.63102],
        [18.43571, -13.37827],
        [18.88343, -13.13232],
        [19.33507, -12.89318],
        [19.79061, -12.66086],
        [20.25002, -12.43534],
        [20.71328, -12.21663],
        [21.18035, -12.00471],
        [21.65119, -11.79957],
        [22.12577, -11.60118],
        [22.60404, -11.40952],
        [23.08595, -11.22457],
        [23.00000, -10.00000],
        [23.00000, -9.00000],
        [23.00000, -8.00000],
        [23.00000, -7.00000]];

        return area;

    }

});
