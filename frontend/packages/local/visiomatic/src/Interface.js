Ext.define('visiomatic.Interface', {

    makeToolbar: function () {
        return Ext.create('Ext.toolbar.Toolbar', {
            items: [ ]
        });
    },

    makeToolbarButtons: function () {
        var me = this,
            auxTools = me.getAuxTools(),
            tools = [];

        // Shift Aladin/Visiomatic
        if (me.getEnableShift()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Switch between Visiomatic / Aladdin.',
                iconCls: 'x-fa fa-exchange',
                scope: me,
                handler: me.onShift
            });
        }

        // Get Link
        if (me.getEnableLink()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Get link',
                iconCls: 'x-fa fa-link',
                scope: me,
                handler: me.getLinkToPosition
            });
        }

        // Crop
        if (me.getEnableCrop()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Crop',
                iconCls: 'x-fa fa-crop',
                scope: me,
                handler: me.initCrop
            });
        }

        if (auxTools.length > 0) {
            Ext.each(auxTools, function (tool) {
                tools.push(tool);

            });
        }

        return tools;
    },

    makeContextMenu: function () {
        var me = this,
            menuItens = [],
            currentDataset = me.getCurrentDataset();

        // Center Tile - e necessario ter uma instancia do currentDataset
        if ((currentDataset != null) && (currentDataset.get('id') > 0)) {
            menuItens.push({
                text: 'Center Tile',
                iconCls: 'x-fa fa-arrows',
                scope: me,
                handler: me.onContextMenuCenterTile
            });
        }

        // Comentarios por posicao
        if (me.getEnableComments()) {
            menuItens.push(
                {
                    text: 'Comment Position',
                    iconCls: 'x-fa fa-comments-o',
                    scope: me,
                    handler: me.onContextMenuCommentPosition
                }
            );
        }

        // Crop
        if (me.getEnableCrop()) {
            menuItens.push(
                {
                    text: 'Crop',
                    iconCls: 'x-fa fa-crop',
                    scope: me,
                    handler: me.onContextMenuCrop
                }
            );
        }

        // Get Link
        if (me.getEnableLink()) {
            menuItens.push({
                text: 'Get link',
                iconCls: 'x-fa fa-link',
                scope: me,
                handler: me.onContextMenuGetLink
            });
        }

        menuItens = menuItens.concat( me.getContextMenuItens() );


        return Ext.create('Ext.menu.Menu', {
            items: menuItens
        });
    },

    makeMousePosition: function(){
        var map = this.getMap();

        return Ext.DomHelper.append(map._controlCorners['topright'], {
            tag: 'div',
            cls: 'leaflet-right leaflet-control leaflet-control-wcs-dialog visiomatic-mouse-position',
            html:'<div class="visiomatic-mouse-position-label">'+
                    'Mouse RA, Dec (0,0)'+
                 '</div>'
        });
    },

    onContextMenuCommentPosition: function () {
        // console.log('onClickCommentPosition()');
        var comment = Ext.create('Ext.window.Window', {
            title: 'Comments',
            iconCls: 'x-fa fa-comments',
            layout: 'fit',
            closeAction: 'destroy',
            constrainHeader:true,
            width: 500,
            height: 300,
            autoShow:true,
            onEsc: Ext.emptyFn,
            items: [
                {
                    xtype: 'comments-position',
                    listeners: {
                        scope: this,
                        // changecomments: 'onChangeComments'
                    }
                }
            ]
        });
    },

    onContextMenuCenterTile: function () {
        // console.log('onContextMenuCenterTile()');
        var me = this;

        me.centerTile();
    },

    onContextMenuGetLink: function () {
        // console.log('onContextMenuGetLink()');
        var me = this;

        this.getLinkToPosition();
    },

    onContextMenuCrop: function () {
        // console.log('onContextMenuCrop()');
        var me = this;

        me.initCrop();
    }

});
