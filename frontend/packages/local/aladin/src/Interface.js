Ext.define('aladin.Interfaces', {

    requires: [
        'aladin.maps.MapSelectionWindow'
    ],

    windowInfo: null,
    windowMapSelection: null,

    enableDisableInfo: function (btn, state) {
        var me = this,
            w = me.windowInfo;

        if (!w) {
            w = me.createWindowInfo();
        }

        w.setVisible(state);

    },

    createWindowInfo: function () {
        var me = this,
            w;

        w = Ext.create('Ext.Component', {
            width: 280,
            height: 100,
            x: 5,
            y: 10,
            renderTo: me.body,
            header: false,
            resizable: false,
            constrain: true,
            cls: 'aladin-location-info',
            style: {
                position: 'absolute',
                zIndex: 29
            },
            tpl: [
                // '<spam>{release}</spam> <spam>{tag}</spam>',
                '</br><spam>{image_survey}</spam>',
                '</br><spam>{tilename}</spam>',
                '</br><spam>RA, Dec (deg): {location}</spam>' +
                '</br><div style="white-space:nowrap;">Mouse RA, Dec (deg): {mlocation}</div>'
            ]
        });

        me.windowInfo = w;

        return w;
    },

    getInfoData: function () {
        var me = this,
            vm = me.getViewModel(),
            tile = vm.get('tile'),
            tag = vm.get('tag'),
            release = vm.get('release_name'),
            data, currentSurvey,
            image_survey = '',
            tl = '',
            tg = '',
            rl = '';

        if (tag) {
            rl = release;
            tg = tag.get('tag_display_name');
        }
        if (tile) {
            tl = tile.get('tli_tilename');
        }

        currentSurvey = me.getImageSurvey();
        if ((currentSurvey) && (currentSurvey.id != 'empty_survey')) {
            image_survey = currentSurvey.name;
        }

        data = {
            image_survey: image_survey,
            location: vm.get('location'),
            mlocation: vm.get('mlocation'),
            release: rl,
            tag: tg,
            tilename: tl
        };

        return data;
    },

    updateInfoData: function () {
        var me = this,
            w = me.windowInfo,
            data = me.getInfoData();

        if (me.windowInfo) {
            w.setData(data);
        }

    },

    ////////////////////////////////////////////////////////////////////////////
    //                            Toolbars                                    //
    ////////////////////////////////////////////////////////////////////////////

    makeToolbar: function () {
        var me = this,
            position = me.getToolbarPosition(),
            vertical = false;

        if ((position === 'left') || (position === 'right')) {
            vertical = true;
        }

        return Ext.create('Ext.toolbar.Toolbar', {
            vertical: vertical,
            reference: 'aladinToolbar'
            //enableOverflow: true
        });

    },

    makeToolbarButtons: function () {
        var me = this,
            auxTools,
            tools = [],
            position = me.getToolbarPosition(),
            vertical = false;

        if ((position === 'left') || (position === 'right')) {
            vertical = true;
        }

        //Botão de troca para o VisiOmatic
        if (me.getEnableShift()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Switch between Aladdin / Visiomatic.',
                iconCls: 'x-fa fa-exchange',
                scope: me,
                handler: me.onShift,
                bind: {
                    disabled: '{!tile}'
                }
            });
        }

        // Botão Layers Control
        if (me.getEnableLayersControl()) {
            tools.push({
                xtype: 'button',
                scope: me,
                iconCls: 'x-fa fa-picture-o',
                tooltip: 'Image Layer',
                menu: me.createImageLayersMenuItems(),
                menuAlign: 'tr',
                arrowVisible: false,
                itemId: 'BtnImageLayers'
            });
        }

        // Filtros
        if (me.getShowFilters()) {

            var bandFilter = Ext.create('common.BandFilter', {
                filters: ['g', 'r', 'i', 'z', 'Y', 'irg'],
                defaultFilter: 'irg',
                vertical: vertical,
                listeners: {
                    scope: me,
                    'onfilter': me.onFilter
                }
            });

            me.setBandFilter(bandFilter);

            tools.push(bandFilter);
        }

        // View Menu
        if (me.getEnableViewMenu()) {
            tools.push(me.createViewMenu());

        }

        // Mapas
        if (me.getEnableMaps()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Map Viewer',
                iconCls: 'x-fa fa-th',
                scope: me,
                handler: me.onClickBtnMap
            });

        }

        // Goto
        if (me.getEnableGoto()) {
            tools.push({
                iconCls: 'x-fa fa-search',
                tooltip: 'Go To position. 356.0085, 0.5168 or 23 44 2.040 +00 31 0.48',
                menuAlign: 'tr',
                arrowVisible: false,
                menu: [
                    {
                        xtype: 'textfield',
                        emptyText: 'RA (deg), Dec (deg)',
                        triggers: {
                            goto: {
                                cls: 'x-form-search-trigger',
                                scope: this,
                                handler: me.submitGoToPosition,
                                tooltip: 'Go To position. 356.0085, 0.5168 or 23 44 2.040 +00 31 0.48'
                            }
                        },
                        listeners: {
                            scope: this,
                            specialkey: function (f, e) {
                                if (e.getKey() == e.ENTER) {
                                    this.submitGoToPosition(f);
                                }
                            }
                        }
                    }
                ]
            });
        }

        // Export Png
        if (me.getEnableExportPng()) {
            // Habilitar o botão apenas se o navegador for firefox,
            // a funcao do aladin de snapshot nao funciona no google chrome.
            if (Ext.firefoxVersion > 0) {
                tools.push({
                    xtype: 'button',
                    tooltip: 'Snapshot',
                    iconCls: 'x-fa fa-camera',
                    scope: me,
                    handler: me.exportAsPng
                });
            }
        }

        // Auxiliar Tools
        auxTools = me.getAuxTools();

        if (auxTools.length > 0) {
            Ext.each(auxTools, function (tool) {
                tools.push(tool);

            });
        }

        //Manager Layers Button
        //Esse botão é criado pelo aladin e não está disponível aqui, ver Aladin.js

        return tools;

    },

    ////////////////////////////////////////////////////////////////////////////
    //                            View Menu                                   //
    ////////////////////////////////////////////////////////////////////////////

    createViewMenu: function () {
        var me = this,
            menu,
            items;

        items = me.createViewMenuItems();

        if (items.length > 0) {
            menu = Ext.create('Ext.button.Button', {
                //text: 'View',
                iconCls: 'x-fa fa-cog',
                tooltip: 'Change view settings',
                itemId: 'ViewMenu',
                menu: items,
                menuAlign: 'tr',
                arrowVisible: false
            });

        }

        return menu;
    },

    createViewMenuItems: function () {

        var me = this,
            items = [];

        // Des Footprint
        if (me.getEnableFootprint()) {
            var isHidden = me.getHideFootprint();

            items.push({
                xtype: 'menucheckitem',
                itemId: 'DesFootprint',
                text: 'Des Footprint',
                checked: !isHidden,
                scope: me,
                checkHandler: me.showDesFootprint
            });
        }

        // Tile Grid
        // Adicionar um placeholder inicial para manter a ordem do menu.
        items.push({
            xtype: 'menucheckitem',
            text: 'Tiles Grid',
            itemId: 'TileGridMenu',
            menu: [],
            menuAlign: 'tr',
            checkHandler: me.onCheckTileGridMenu,
            scope: me,
            disabled: true,
            checked: me.getTilesGridVisible()
        });

        // Healpix Grid
        if (me.getEnableHealpixGrid()) {
            items.push({
                xtype: 'menucheckitem',
                text: 'Healpix Grid',
                scope: me,
                checkHandler: me.showHealpixGrid
            });
        }

        // -------------------- Separador -----------------------------
        items.push('-');

        // Color Map Menu
        if (me.getEnableColorMap()) {

            items.push(me.createColorMapMenu());
        }

        // -------------------- Separador -----------------------------
        items.push('-');

        // Reticle
        if (me.getEnableReticle()) {
            items.push({
                xtype: 'menucheckitem',
                text: 'Reticle',
                checked: true,
                scope: me,
                checkHandler: me.showReticle
            });
        }

        // Info
        if (me.getEnableHealpixGrid()) {
            items.push({
                xtype: 'menucheckitem',
                text: 'Info',
                scope: me,
                checkHandler: me.enableDisableInfo,
                checked: me.getInfoEnabled()
            });
        }

        return items;

    },

    ////////////////////////////////////////////////////////////////////////////
    //                            Tile Grid Menu                              //
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Cria um menu com a lista de fields do release. 
     * cada field tem uma checkbox no menu que permite ligar ou deligar a grid de tiles.
     * caso o release tenha apenas 1 field o menu é omitido e fica só uma checkbox.
     */
    createTileGridMenu: function () {
        var me = this,
            viewMenu = me.down('#ViewMenu'),
            items = me.createTileGridMenuItems(),
            menu = me.down('#TileGridMenu');

        if (items.length > 1) {
            // Se o release tem mais de um field é criad um Submenu 
            // cada field é um item do submenu.
            if (!menu) {
                menu = {
                    text: 'Tiles Grid',
                    itemId: 'TileGridMenu',
                    menu: items,
                    scope: me,
                    checkHandler: me.onCheckTileGridMenu,
                };

                viewMenu.getMenu().add(menu);

            } else {
                // Remover os items anteriores do menu
                menu.getMenu().removeAll();

                // Adicionar os novos items
                menu.getMenu().add(items);

                // Altera a função que será executada ao marcar o checkbox do menu
                menu.checkHandler = me.onCheckTileGridMenu;

                // habilitar o botão
                menu.enable();

            }
        } else {
            // Se o release tiver apenas 1 field. 
            // Transforma o Menu em um checkbox unico, 
            // Altera o seu comportamento para executar direto 
            // a função de ligar e desligar a tile grid.

            // Remover os items anteriores do menu
            menu.getMenu().removeAll();

            // Desabilita o submenu. 
            menu.setMenu(false);

            // Informação do field.
            menu.tag = items[0].tag;

            // Altera a função que será executada ao marcar a checkbox.
            menu.checkHandler = me.onCheckTileGrid

            // habilitar o botão
            menu.enable();
        }
    },

    createTileGridMenuItems: function () {
        var me = this,
            store = me.getStoreTags(),
            items = [];

        if (store.count() > 0) {
            store.each(function (record) {
                items.push(
                    {
                        xtype: 'menucheckitem',
                        text: record.get('tag_display_name'),
                        tag: record.get('id'),
                        scope: me,
                        checkHandler: me.onCheckTileGrid
                    }
                );

            }, this);

        }

        return items;
    },

    ////////////////////////////////////////////////////////////////////////////
    //                            Color Map Menu                              //
    ////////////////////////////////////////////////////////////////////////////

    createColorMapMenu: function () {
        var me = this,
            menu,
            items;

        items = me.createColorMapMenuItems();

        menu = {
            text: 'Color Map',
            tooltip: 'Change Color Map',
            reference: 'BtnColorMap',
            itemId: 'BtnColorMap',
            menu: items,
            menuAlign: 'tr',
            arrowVisible: false
        };

        return menu;
    },

    createColorMapMenuItems: function () {
        var me = this,
            colorMaps = me.getColorMaps(),
            items = [];

        for (var i in colorMaps) {

            items.push({
                xtype: 'menucheckitem',
                text: colorMaps[i],
                group: 'colormaps',
                mapName: colorMaps[i],
                scope: me,
                checkHandler: me.changeColorMap
            });
        }

        items.push('-');

        items.push({
            text: 'Reverse',
            scope: me,
            handler: me.reverseColor
        });

        return items;
    },

    updateColorMapMenu: function () {
        var me = this,
            btn = me.down('#BtnColorMap'),
            colormaps,
            items;

        // Recuperar os color Maps
        colormaps = Ext.clone(ColorMap.MAPS_NAMES);

        me.setColorMaps(colormaps);

        items = me.createColorMapMenuItems();

        btn.setMenu(items);
    },


    createImageLayersMenuItems: function () {
        // console.log('createImageLayersMenuItems()');
        var me = this,
            externalSurveys = me.getExternalSurveys(),
            desSurveys = me.getSurveys(),
            items = [],
            survey, currentSurvey;

        if ((desSurveys != null) && (desSurveys.length > 0)) {
            for (var i in desSurveys) {
                desSurvey = desSurveys[i];

                if (desSurvey.id != 'empty_survey') {

                    items.push({
                        xtype: 'menucheckitem',
                        text: desSurvey["name"],
                        group: 'imageSurveys',
                        survey: desSurvey,
                        scope: me,
                        checked: true,
                        checkHandler: me.selectExternalSurvey
                    });
                }
            }
            items.push('-');
        }

        for (var i in externalSurveys) {
            survey = externalSurveys[i];

            items.push({
                xtype: 'menucheckitem',
                text: survey["name"],
                group: 'imageSurveys',
                survey: survey,
                scope: me,
                checkHandler: me.selectExternalSurvey
            });
        }

        return items;
    },

    updateImageLayersMenuItems: function () {
        var me = this,
            btn = me.down('#BtnImageLayers'),
            items;

        if (btn) {
            items = me.createImageLayersMenuItems();

            btn.setMenu(items);
        }
    },


});
