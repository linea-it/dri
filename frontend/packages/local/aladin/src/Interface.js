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
            w.setData(data);
        }

    }

});
