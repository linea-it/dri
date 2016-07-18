Ext.define('aladin.Maps', {

    setStoreMaps: function (store) {
        var me = this;
        if (store) {
            store.on(
                {
                    scope: this,
                    load: 'onStoreMapsLoad'
                }
            );

            me.storeSurveys = store;
        }
    },

    onStoreMapsLoad: function () {

    },

    ////////////////////////////////////////////////////////////////////////////
    //                            Maps Menu                                   //
    ////////////////////////////////////////////////////////////////////////////

    createMapsMenu: function () {
        var me = this,
            viewMenu = me.down('#ViewMenu'),
            items = me.createMapsMenuItems(),
            menu = me.down('#MapsMenu');

        if (!menu) {
            menu = {
                text: 'Maps',
                itemId: 'MapsMenu',
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

    createMapsMenuItems: function () {
        var me = this,
            store = me.getStoreMaps(),
            items = [];

        items.push(
            {
                text: 'Survey Depth maps',
                menu: [
                    {
                        xtype: 'menucheckitem',
                        text: 'g',
                        group: 'maps',
                        scope: me,
                        checkHandler: me.changeMapSurvey,
                        map_id: 'map1',
                        map_url:'http://desportal.cosmology.illinois.edu/data/maps/AUTO/y1a1_gold_1.0.2_wide_auto_nside4096_g_10sigma/',
                        map_name: 'Survey Depth maps - g',
                        map_filter: 'g'

                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'r',
                        group: 'maps',
                        scope: me,
                        checkHandler: me.changeMapSurvey,
                        map_id: 'map2',
                        map_url:'http://desportal.cosmology.illinois.edu/data/maps/AUTO/y1a1_gold_1.0.2_wide_auto_nside4096_r_10sigma/',
                        map_name: 'Survey Depth maps - r',
                        map_filter: 'r'
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'i',
                        group: 'maps',
                        scope: me,
                        checkHandler: me.changeMapSurvey,
                        map_id: 'map3',
                        map_url:'http://desportal.cosmology.illinois.edu/data/maps/AUTO/y1a1_gold_1.0.2_wide_auto_nside4096_i_10sigma/',
                        map_name: 'Survey Depth maps - i',
                        map_filter: 'i'
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'z',
                        group: 'maps',
                        scope: me,
                        checkHandler: me.changeMapSurvey,
                        map_id: 'map4',
                        map_url:'http://desportal.cosmology.illinois.edu/data/maps/AUTO/y1a1_gold_1.0.2_wide_auto_nside4096_z_10sigma/',
                        map_name: 'Survey Depth maps - z',
                        map_filter: 'z'
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'Y',
                        group: 'maps',
                        scope: me,
                        checkHandler: me.changeMapSurvey,
                        map_id: 'map5',
                        map_url:'http://desportal.cosmology.illinois.edu/data/maps/AUTO/y1a1_gold_1.0.2_wide_auto_nside4096_Y_10sigma/',
                        map_name: 'Survey Depth maps - Y',
                        map_filter: 'y'
                    }
                ]
            },
            {
                xtype: 'menucheckitem',
                text: 'VAC Footprint',
                scope: me,
                checkHandler: me.changeMapSurvey,
                map_id: 'map6',
                map_url:'http://desportal.cosmology.illinois.edu/data/maps/VAC/S82/footprint_map_525_1568/',
                map_name: 'VAC Footprint',
                map_filter: ''
            }
        );

        // if (store) {
        //     if (store.count() > 0) {
        //         store.each(function (record) {
        //             items.push(
        //                 {
        //                     xtype: 'menucheckitem',
        //                     text: record.get('tag_display_name'),
        //                     tag: record.get('id'),
        //                     scope: me,
        //                     checkHandler: me.onCheckTileGrid
        //                 }
        //             );

        //         }, this);

        //     }
        // }

        return items;
    }

});
