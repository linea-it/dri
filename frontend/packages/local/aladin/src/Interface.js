Ext.define('aladin.Interfaces', {

    windowInfo: null,

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
            width: 200,
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
                zIndex: 999
            },
            tpl: [
                '<spam>{release}</spam> <spam>{tag}</spam>',
                '</br><spam>{tilename}</spam>',
                '</br><spam>J2000 {location}</spam>'
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
            release = vm.get('release'),
            data,
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

        data = {
            location: vm.get('location'),
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
            vertical: vertical
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

        if (me.getEnableShift()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Switch between Aladdin / Visiomatic.',
                iconCls: 'x-fa fa-exchange',
                scope: me,
                handler: me.onShift,
                bind: {
                    disabled:'{!tile}'
                }
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

        // Color Map Menu
        if (me.getEnableColorMap()) {

            tools.push(me.createColorMapMenu());
        }

        // Goto
        /*if (me.getEnableGoto()) {
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
                            specialkey: function (f,e) {
                                if (e.getKey() == e.ENTER) {
                                    this.submitGoToPosition(f);
                                }
                            }
                        }
                    }
                ]
            });
        }*/

        // Export Png
        if (me.getEnableExportPng()) {

            tools.push({
                xtype: 'button',
                tooltip: 'Export view as PNG',
                iconCls: 'x-fa fa-picture-o',
                scope: me,
                handler: me.exportAsPng
            });
        }

        // Auxiliar Tools
        auxTools = me.getAuxTools();

        // TODO Mover o location para info
        // auxTools.push({
        //     xtype: 'tbtext',
        //     width: 180,
        //     bind: {
        //         html: 'Location: ' + '{location}'
        //     }
        // });

        if (auxTools.length > 0) {
            Ext.each(auxTools, function (tool) {
                tools.push(tool);

            });
        }

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

        // Tile Grid
        // Adicionar um placeholder inicial para manter a ordem do menu.
        items.push({
            xtype: 'menucheckitem',
            text: 'Tiles Grid',
            itemId: 'TileGridMenu',
            menu: [],
            menuAlign: 'tr',
            checkHandler: me.onCheckTileGridMenu,
            disabled: true,
            checked: me.getTilesGridVisible()
        });

        // Maps
        var maps = me.createMapsMenuItems();
        if (me.getEnableMaps()) {
            items.push({
                text: 'Maps',
                itemId: 'MapsMenu',
                menu: maps,
                menuAlign: 'tr'
                // disabled: true
            });
        }

        // -------------------- Separador -----------------------------
        items.push('-');

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

        // Healpix Grid
        if (me.getEnableHealpixGrid()) {
            items.push({
                xtype: 'menucheckitem',
                text: 'Healpix Grid',
                scope: me,
                checkHandler: me.showHealpixGrid
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

    createTileGridMenu: function () {
        var me = this,
            viewMenu = me.down('#ViewMenu'),
            items = me.createTileGridMenuItems(),
            menu = me.down('#TileGridMenu');

        if (!menu) {
            menu = {
                text: 'Tiles Grid',
                itemId: 'TileGridMenu',
                menu: items
            };

            viewMenu.getMenu().add(menu);

        } else {
            // Remover os items anteriores do menu
            menu.getMenu().removeAll();

            // Adicionar os novos items
            menu.getMenu().add(items);

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

        menu = Ext.create('Ext.button.Button', {
            //text: 'Color Map',
            tooltip: 'Change Color Map',
            iconCls: 'x-fa fa-eyedropper',
            reference: 'BtnColorMap',
            itemId: 'BtnColorMap',
            menu: items,
            menuAlign: 'tr',
            arrowVisible: false
        });

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
    }

});
