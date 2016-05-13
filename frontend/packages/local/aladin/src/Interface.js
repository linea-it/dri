Ext.define('aladin.Interfaces', {

    windowInfo: null,

    enableDisableInfo: function (btn, state) {
        console.log('enableDisableInfo(%o)', state);
        var me = this,
            w = me.windowInfo;

        if (!w) {
            w = me.createWindowInfo();
        }

        w.setVisible(state);

    },

    // createWindowInfo: function () {
    //     console.log('createWindowInfo()');
    //     var me = this,
    //         w;

    //     w = Ext.create('Ext.window.Window', {
    //         width: 200,
    //         height: 100,
    //         x: 50,
    //         y: 50,
    //         renderTo: me.body,
    //         closeAction: 'hide',
    //         header: false,
    //         resizable: false,
    //         constrain: true,
    //         closable: false,
    //         border: false,
    //         items: [{
    //             xtype: 'panel',
    //             tpl: [
    //                 '<div class=aladin-location-info>',
    //                 '<spam>{tag}</spam>',
    //                 '</br><spam>{tilename}</spam>',
    //                 '</div>'
    //             ]
    //         }]
    //     });

    //     me.windowInfo = w;

    //     return w;
    // },

    createWindowInfo: function () {
        console.log('createWindowInfo()');
        var me = this,
            w;

        w = Ext.create('Ext.Component', {
            width: 200,
            height: 100,
            x: 5,
            y: 25,
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
                '<spam>{tag}</spam>',
                '</br><spam>{tilename}</spam>',
                '</div>'
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
            data;

        data = {
            tag: tag.get('tag_display_name'),
            tilename: tile.get('tli_tilename')
        };

        return data;
    },

    updateInfoData: function () {
        var me = this,
            w = me.windowInfo,
            data = me.getInfoData();

        if (me.windowInfo) {
            //w.down('panel').setData(data);
            w.setData(data);
        }

    }

});
