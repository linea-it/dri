Ext.define('visiomatic.catalog.OverlayGrid', {
    extend: 'Ext.grid.Panel',

    xtype: 'visiomatic-catalogs-overlays-grid',

   initComponent: function () {
        var me = this;

        Ext.apply(this, {
            hideHeaders: true,
            viewConfig: {
                markDirty: false,
                listeners: {
                    scope: me,
                    // Adicionar tooltips as linhas da grid
                    render: me.addTooltipToColumnName,
                    destroy: function(view) {
                        delete view.tip; // Clean up this property on destroy.
                    }
                }
            },
            columns: [
                {
                    text: 'Visible',
                    xtype: 'checkcolumn',
                    dataIndex: 'visible',
                    width: 30,
                    listeners: {
                        checkchange: 'onChangeVisibility'
                    },
                    align: 'center'
                },
                {
                    text: 'Color',
                    dataIndex: 'color',
                    width: 30,
                    align: 'center',
                    renderer: me.renderColumnColor
                },
                {
                    text: 'Name',
                    dataIndex: 'name',
                    tdCls: 'nameTdCls',
                    flex:2,
                    renderer: me.renderColumnName
                },
                {
                    menuDisabled: true,
                    xtype: 'actioncolumn',
                    width: 30,
                    items: [
                        {
                            iconCls: 'x-fa fa-trash-o color-overlay-grid-icon',
                            tooltip: 'Remove',
                            handler: 'onRemoveOverlay'
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

   /**
    * Adiciona um tooltip a coluna Name, essa coluna esta identificada pelo atributo tbCls.
    */
   addTooltipToColumnName: function(view) {
        var me = this;

        view.tip = Ext.create('Ext.tip.ToolTip', {
            // The overall target element.
            target: view.getId(),
            // Each grid row's name cell causes its own separate show and hide.
            delegate: view.itemSelector + ' .nameTdCls',
            // Moving within the cell should not hide the tip.
            trackMouse: true,
            listeners: {
                // Change content dynamically depending on which element triggered the show.
                beforeshow: function updateTipBody(tip) {
                    // Fetch grid view here, to avoid creating a closure.
                    var tipGridView = tip.target.component;
                    var record = tipGridView.getRecord(tip.triggerElement);

                    tip.update(me.getTooltipName(record));
                }
            }
        });
   },

   /**
    * Retornar a mensagem de tooltip baseada no conteudo do overlay.
    */
   getTooltipName: function(record) {

        if (record.get('status') !== 'error') {
            return Ext.String.format(
                        '<spam>{0}</spam></br>'+
                        '<spam>Entries: {1}</spam>',
                        record.get('name'),
                        record.get('count'));
        } else {
            return record.get('status_message');

        }
   },

    /**
     * Retorna o valor da coluna name baseado na quantidade de objetos encontrados
     * se a store ainda estiver carregando retorna so o nome do overlay.
     * mas se a store ja estiver carregada retorna o nome do overlay + a quantidade de objetos.
     * Se o nome do overlay for maior que o maxlength recorta a string e adiciona ...
     */
    renderColumnName: function (value, meta, record) {
        var maxStringLength = 16;

        if (value.length > maxStringLength) {
            value = value.substr(0, maxStringLength);
            value = value + '...';
        }

        if ((record.get('status') !== 'loading') && (record.get('status') !== 'error')) {
            return Ext.String.format("{0} ({1} entries)", value, record.get('count'));

        } else {
            return value;

        }
    },

    /**
     * A coluna Color ela tem a funcao de informar o Status do request e a cor do overlay
     * Baseado no Status
     *      - loading: Quando a store de objetos ainda esta carregando o value dessa coluna vai ser um iconde de loading
     *      - ok: quando a store termina de carregar e tem objetos. o valor vai ser um icone com a cor do overlay
     *      - alert: quando a query retorna mais objetos do que o limit estipulado no pageSize da store.
     *      - warning: quando o resultado da store e 0 objetos. o valor vai ser um icone de warning com um tootip.
     *      - error: Quando a Requisicao falha no lado do Servidor ex: error 500
     */
   renderColumnColor: function(value, meta, record) {
        switch (record.get('status')) {
            case 'loading':
                value = '<i class="fa fa-spinner fa-pulse fa-fw" aria-hidden="true"></i>'
                break;

            case 'ok':
                value = Ext.String.format(
                            '<i class="fa fa-square" aria-hidden="true" style="color:{0}"></i>', value)
                break;

            case 'alert':
                msg = record.get('status_message');

                value = '<i class="fa fa-exclamation" ' +
                            'aria-hidden="true" style="color:#FF8C2E" ' +
                            'data-qtip="' + msg + '"></i>';

                // Como esse icone e muito pequeno e dificil abrir o tooltip, entao adicionei o tooltip
                // a cell
                meta.tdAttr = 'data-qtip= "' + msg + '"';

                break;

            case 'warning':
                value = '<i class="fa fa-exclamation-triangle" ' +
                            'aria-hidden="true" style="color:#FF8C2E" data-qtip="0 Entries"></i>'

                break;

            case 'error':
                msg = record.get('status_message');

                value = '<i class="fa fa-exclamation-triangle" ' +
                            'aria-hidden="true" style="color:#FD172C" data-qtip="' + msg + '"></i>'

                break;
        }

        return value;
    },

});