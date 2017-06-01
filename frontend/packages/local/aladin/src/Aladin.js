Ext.define('aladin.Aladin', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.aladin',

    requires: [
        'common.BandFilter'
    ],

    mixins: {
        events: 'aladin.Events',
        interface: 'aladin.Interfaces',
        maps:'aladin.Maps'
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
            fov:180,
            target: '02 23 11.851 -09 40 21.59',
            cooFrame: 'J2000',
            //survey:                 'empty_survey',
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
        enableLayersControl: false,

        // Barra com botoes para escolher a banda da imagem
        showFilters: true,
        bandFilter: null,
        // array de filtros disponiveis baseado no array surveys
        availableFilters: [],

        // Menu para controle dos layers
        enableViewMenu: true,

        // Botao para exportar para PNG
        enableExportPng: false,

        // Botao para mostrar ou ocultar a crosshair
        enableReticle: true,

        // Botao para mostrar ou ocultar a healpixgrid
        enableHealpixGrid: true,

        // Menu que permite trocar as cores da imagem
        enableColorMap: false,

        // Botao para mostrar ou ocultar o footprint
        enableFootprint: true,

        // Parametro para mostrar ou ocultar o footprint por default
        hideFootprint: true,

        // habilitar o campo de GoTo
        enableGoto: true,

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

        // FoV inicial tem preferencia sobre o FoV do survey.
        initialFov: null,

        // habilitar ou desabilitar a exibicao de mapas
        enableMaps: false,

        // habilitar botao que permite troca entre Visiomatic / Aladin
        enableShift: true,

        // toolbar position (left or top)
        toolbarPosition: 'left'
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
            tile: null,
            tag: null,
            release: null
        }
    },

    session: true,

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

        if (me.getShowFilters()) {
            tollbar = me.makeToolbar();
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

        me.callParent(arguments);
    },

    onAfterrender: function () {
        // console.log('Aladin - afterrender()');

        var me = this,
            aladinId = '#' + me.getAladinId(),
            libA = me.libA,
            aladinOptions = me.getAladinOptions(),
            aladin;

        if (me.getEnableLayersControl()) {
            aladinOptions.showLayersControl = me.getEnableLayersControl();
        }

        aladin = libA.aladin(
            // Id da div que recebera o aladin
            aladinId,
            // opcoes do aladin
            aladinOptions
        );

        me.setAladin(aladin);

        me.createImageSurveys();

        if (me.getEnableColorMap()) {
            me.updateColorMapMenu();
        }

        if (me.getInfoEnabled()) {
            me.enableDisableInfo(null, me.getInfoEnabled());
        }

        // Custon events
        me.addCustonEvents();

        me.setAladinReady(true);
        me.fireEvent('aladinready', me);

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
            alSurvey;

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

        // marcar a flag que indica ser o primeiro survey
        // me.isFirstSurvey = true;

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

            // Custon events
            me.addCustonEvents();

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

    setLocation: function (location) {
        var me = this,
            vm = me.getViewModel();

        me.location = location;

        vm.set('location', location);

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

        store.on('load', 'onLoadStoreTiles', this);

    },

    /**
     * Executado toda vez que a store tiles e carregada,
     * - verifica se o menu tilegrid esta habilitado e se estiver
     * executa o metodo para fazer o plot da tile grid.
     */
    onLoadStoreTiles: function () {
        var me = this,
            menu;

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

                vm.set('release', tile.get('release_display_name'));
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
        console.log('menuitem: %o', menuitem);

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

        console.log(survey);
        aladin.setImageSurvey(mapSurvey.id);
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
                var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 2, name: 'des'});

                aladin.addOverlay(overlay);
                overlay.add(A.polyline(des));

            }
        } else {
            var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 2, name: 'des'});

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
            menu = item.getMenu();

        menu.items.each(function (i) {
            i.setChecked(checked);

        }, me);

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
            color:'#e67e22'
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

    submitGoToPosition: function (field) {
        var me = this,
            value = field.getValue();

        if ((field.isValid()) && (field.getValue() !== '')) {
            me.goToPosition(value);

        } else {
            if (field.getValue() !== '') {
                field.markInvalid('Invalid value.');

            }
        }

    },

    goToPosition: function (position) {
        var me = this,
            aladin = me.getAladin(),
            ra, dec, newposition;

        if (position) {
            // Fix if value in degrees need a space between values
            if (position.indexOf(',') != -1) {
                position = position.split(',');
                ra = position[0].trim();
                dec = position[1].trim();
                newposition = [ra, dec];
                position = newposition.join(', ');
            }

            aladin.gotoObject(position);
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

        return aladin.getFov();
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

    getDesFootprintCoordinates: function () {
        var area = [[23, -7], [22, -7], [21, -7], [20, -7], [19, -7], [18, -7],
        [17, -7], [16, -7], [15, -7], [14, -7], [13, -7], [12, -7], [11, -7],
        [10, -7], [9, -7], [8, -7], [7, -7], [6, -7], [5, -7], [4, -7], [3, -7],
        [2, -7], [1, -7], [0, -7], [0, -6], [0, -5], [0, -4], [0, -3], [0, -2],
        [-1, -2], [-2, -2], [-3, -2], [-4, -2], [-5, -2], [-6, -2], [-7, -2],
        [-8, -2], [-9, -2], [-10, -2], [-11, -2], [-12, -2], [-13, -2],
        [-14, -2], [-15, -2], [-16, -2], [-17, -2], [-18, -2], [-19, -2],
        [-20, -2], [-21, -2], [-22, -2], [-23, -2], [-24, -2], [-25, -2],
        [-26, -2], [-27, -2], [-28, -2], [-29, -2], [-30, -2], [-31, -2],
        [-32, -2], [-33, -2], [-34, -2], [-35, -2], [-36, -2], [-37, -2],
        [-38, -2], [-39, -2], [-40, -2], [-41, -2], [-42, -2], [-43, -2],
        [-43, -1], [-43, 0], [-43, 1], [-43, 2], [-42, 2], [-41, 2], [-40, 2],
        [-39, 2], [-38, 2], [-37, 2], [-36, 2], [-35, 2], [-34, 2], [-33, 2],
        [-32, 2], [-31, 2], [-30, 2], [-29, 2], [-28, 2], [-27, 2], [-26, 2],
        [-25, 2], [-24, 2], [-23, 2], [-22, 2], [-21, 2], [-20, 2], [-19, 2],
        [-18, 2], [-17, 2], [-16, 2], [-15, 2], [-14, 2], [-13, 2], [-12, 2],
        [-11, 2], [-10, 2], [-9, 2], [-8, 2], [-7, 2], [-6, 2], [-5, 2],
        [-4, 2], [-3, 2], [-2, 2], [-1, 2], [0, 2], [0, 2], [0, 3], [0, 4],
        [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
        [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [14, 5], [15, 5], [16, 5],
        [17, 5], [18, 5], [19, 5], [20, 5], [21, 5], [22, 5], [23, 5], [24, 5],
        [25, 5], [26, 5], [27, 5], [28, 5], [29, 5], [30, 5], [31, 5], [32, 5],
        [33, 5], [34, 5], [35, 5], [36, 5], [37, 5], [38, 5], [39, 5], [40, 5],
        [41, 5], [42, 5], [43, 5], [44, 5], [45, 5], [45, 5], [45, 4], [45, 3],
        [45, 2], [45, 1], [45, 0], [45, -1], [45, -2], [45, -3], [45, -4],
        [45, -5], [45, -6], [45, -7], [45, -8], [45, -9], [45.83584, -9.06842],
        [46.36744, -9.14567], [46.89697, -9.22888], [47.42429, -9.3181],
        [47.94928, -9.41337], [48.47183, -9.51474], [48.99181, -9.62226],
        [49.50912, -9.73598], [50.02364, -9.85594], [50.53529, -9.98221],
        [51.04396, -10.11482], [51.54955, -10.25382], [52.05199, -10.39926],
        [52.55118, -10.55119], [53.04706, -10.70965], [53.53954, -10.87467],
        [54.02856, -11.0463], [54.51405, -11.22457], [54.99596, -11.40952],
        [55.47423, -11.60118], [55.94881, -11.79957], [56.41965, -12.00471],
        [56.88672, -12.21663], [57.34998, -12.43534], [57.80939, -12.66086],
        [58.26493, -12.89318], [58.71657, -13.13232], [59.16429, -13.37827],
        [59.60807, -13.63102], [60.0479, -13.89057], [60.48377, -14.15689],
        [60.91568, -14.42997], [61.3436, -14.70979], [61.76755, -14.99631],
        [62.18753, -15.2895], [62.60354, -15.58931], [63.01557, -15.89572],
        [63.42365, -16.20866], [63.82778, -16.52808], [64.22797, -16.85393],
        [66, -18], [67, -18], [68, -18], [69, -18], [70, -18], [71, -18],
        [72, -18], [73, -18], [74, -18], [75, -18], [76, -18], [77, -18],
        [78, -18], [79, -18], [80, -18], [81, -18], [82, -18], [83, -18],
        [84, -18], [85, -18], [86, -18], [86.66667, -19], [87.33333, -20],
        [88, -21], [88.66667, -22], [89.41596, -23.1317], [89.68146, -24.3655],
        [89.95879, -25.59111], [90.24749, -26.80814], [90.54705, -28.01619],
        [90.8569, -29.21488], [91.17643, -30.40381], [91.50499, -31.58263],
        [91.84185, -32.75095], [92.18623, -33.90841], [92.53729, -35.05464],
        [92.89409, -36.18931], [93.25565, -37.31205], [93.62088, -38.42252],
        [93.98862, -39.5204], [94.35759, -40.60535], [94.72643, -41.67704],
        [95.09367, -42.73517], [95.45771, -43.77942], [95.81685, -44.80949],
        [96.16922, -45.82508], [96.51286, -46.8259], [96.84562, -47.81168],
        [97.16521, -48.78213], [97.46918, -49.73698], [97.75487, -50.67597],
        [98.01948, -51.59884], [98.25999, -52.50536], [98.47317, -53.39526],
        [98.65561, -54.26832], [98.80364, -55.1243], [98.91339, -55.96299],
        [98.98075, -56.78417], [99.00136, -57.58762], [98.97062, -58.37314],
        [98.88371, -59.14055], [98.73552, -59.88964], [98.52073, -60.62023],
        [98.23379, -61.33214], [98, -61.5], [97, -61.5], [96, -61.5],
        [95, -61.5], [94, -61.5], [93, -61.5], [92, -61.5], [91, -61.5],
        [90, -61.5], [89, -61.5], [88, -61.5], [87, -61.5], [86, -61.5],
        [85, -61.5], [84, -61.5], [83, -62], [78.66667, -63], [74.33333, -64],
        [69.1922, -65.62708], [68.293, -65.99135], [67.35218, -66.34555],
        [66.36917, -66.68914], [65.34355, -67.02152], [64.27503, -67.3421],
        [63.1635, -67.65026], [62.00905, -67.9454], [60.81197, -68.22686],
        [59.5728, -68.49402], [58.29235, -68.74623], [56.97169, -68.98287],
        [55.6122, -69.20331], [54.21558, -69.40695], [52.78381, -69.59321],
        [51.31925, -69.76152], [49.82454, -69.91137], [48.30265, -70.04227],
        [46.75683, -70.15381], [45.19062, -70.2456], [43.60779, -70.31734],
        [42.0123, -70.36875], [40.4083, -70.39968], [38.8, -70.41],
        [37.1917, -70.39968], [35.5877, -70.36875], [33.99221, -70.31734],
        [32.40938, -70.2456], [30.84317, -70.15381], [29.29735, -70.04227],
        [27.77546, -69.91137], [26.28075, -69.76152], [24.81619, -69.59321],
        [23.38442, -69.40695], [21.9878, -69.20331], [20.62831, -68.98287],
        [19.30765, -68.74623], [18.0272, -68.49402], [16.78803, -68.22686],
        [15.59095, -67.9454], [14.4365, -67.65026], [13.32497, -67.3421],
        [12.25645, -67.02152], [11.23083, -66.68914], [10.24782, -66.34555],
        [9.307, -65.99135], [8.4078, -65.62708], [7.54955, -65.2533], [4, -65],
        [3, -65], [2, -65], [1, -65], [0, -65], [-1, -65], [-2, -65], [-3, -65],
        [-4, -65], [-5, -65], [-6, -65], [-7, -65], [-8, -65], [-9, -65],
        [-10, -65], [-11, -65], [-12, -65], [-13, -65], [-14, -65], [-15, -65],
        [-16, -65], [-17, -65], [-18, -65], [-19, -65], [-20, -65], [-21, -65],
        [-22, -65], [-23, -65], [-24, -65], [-25, -65], [-26, -65], [-27, -65],
        [-28, -65], [-29, -65], [-30, -65], [-31, -65], [-32, -65], [-33, -65],
        [-34, -65], [-35, -65], [-36, -65], [-37, -65], [-38, -65], [-39, -65],
        [-40, -65], [-41, -65], [-42, -65], [-43, -65], [-44, -65], [-45, -65],
        [-46, -65], [-47, -65], [-48, -65], [-49, -65], [-50, -65], [-51, -65],
        [-52, -65], [-53, -65], [-54, -65], [-55, -65], [-56, -65], [-57, -65],
        [-56.8, -64], [-56.6, -63], [-56.4, -62], [-56.2, -61], [-56, -60],
        [-55.9, -59], [-55.8, -58], [-55.7, -57], [-55.6, -56], [-55.5, -55],
        [-55.4, -54], [-55.3, -53], [-55.2, -52], [-55.1, -51], [-55, -50],
        [-54.9, -49], [-54.8, -48], [-54.7, -47], [-54.6, -46], [-54.5, -45],
        [-54.4, -44], [-54.3, -43], [-54.2, -42], [-54.1, -41], [-54, -40],
        [-53, -40], [-52, -40], [-51, -40], [-50, -40], [-49, -40], [-48, -40],
        [-47, -40], [-46, -40], [-45, -40], [-44, -40], [-43, -40], [-42, -40],
        [-41, -40], [-40, -40], [-39, -40], [-38, -40], [-37, -40], [-36, -40],
        [-35, -40], [-34, -40], [-33, -40], [-32, -40], [-31, -40], [-30, -40],
        [-29, -40], [-28, -40], [-27, -40], [-26, -40], [-25, -40], [-24, -40],
        [-23, -40], [-22, -40], [-21, -40], [-20, -40], [-19, -40], [-18, -40],
        [-17, -40], [-16, -40], [-15, -40], [-14, -40], [-13, -40], [-12, -40],
        [-11, -40], [-10, -40], [-9, -40], [-8, -40], [-7, -40], [-6, -40],
        [-5, -40], [-4, -40], [-3, -40], [-1.47219, -38.64048],
        [-1.27518, -38.12814], [-1.07231, -37.61674], [-0.86376, -37.1064],
        [-0.6497, -36.59723], [-0.43028, -36.08933], [-0.20564, -35.58282],
        [0.02406, -35.07782], [0.25871, -34.57444], [0.49818, -34.0728],
        [0.74235, -33.57301], [0.99113, -33.0752], [1.24441, -32.5795],
        [1.50209, -32.08601], [1.7641, -31.59488], [2.03036, -31.10621],
        [2.30079, -30.62015], [2.57532, -30.13681], [2.85391, -29.65632],
        [3.13648, -29.17881], [3.423, -28.70441], [3.71342, -28.23325],
        [4.0077, -27.76546], [4.30581, -27.30116], [4.60772, -26.84048],
        [4.9134, -26.38355], [5.22284, -25.93051], [5.53601, -25.48147],
        [5.8529, -25.03656], [6.17351, -24.59591], [6.49782, -24.15964],
        [6.82584, -23.72788], [7.15756, -23.30074], [7.49299, -22.87835],
        [7.83212, -22.46081], [8.17498, -22.04826], [8.52155, -21.6408],
        [8.87186, -21.23855], [9.22592, -20.8416], [9.58374, -20.45008],
        [9.94533, -20.06407], [10.3107, -19.68369], [10.67989, -19.30903],
        [11.05289, -18.94018], [11.42973, -18.57723], [11.81042, -18.22027],
        [12.19498, -17.86938], [12.58343, -17.52465], [12.97577, -17.18614],
        [13.37203, -16.85393], [13.77222, -16.52808], [14.17635, -16.20866],
        [14.58443, -15.89572], [14.99646, -15.58931], [15.41247, -15.2895],
        [15.83245, -14.99631], [16.2564, -14.70979], [16.68432, -14.42997],
        [17.11623, -14.15689], [17.5521, -13.89057], [17.99193, -13.63102],
        [18.43571, -13.37827], [18.88343, -13.13232], [19.33507, -12.89318],
        [19.79061, -12.66086], [20.25002, -12.43534], [20.71328, -12.21663],
        [21.18035, -12.00471], [21.65119, -11.79957], [22.12577, -11.60118],
        [22.60404, -11.40952], [23.08595, -11.22457], [23, -10], [23, -9],
        [23, -8], [23, -7]];

        return area;

    }

});
