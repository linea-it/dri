Ext.define('visiomatic.contrast.ContrastWindow', {
    extend: 'Ext.window.Window',

    xtype: 'visiomatic-contrast',

    title: 'Choose Color Ranges',

    width: 250,
    height: 200,

    closeAction: 'destroy',

    resizable: false,

    constrain: true,

    bodyPadding: 10,

    config: {
        // Instancia atual do visiomatic
        visiomatic: null,
        // Lista com os contrasts diponiveis e os valores para cada cor.
        colorRanges: null,
    },

    viewModel: {
        data: {
            currentContrast: { contrast: 'normal' },
        }
    },

    initComponent: function () {
        var me = this,
            vm = me.getViewModel(),
            colorRanges = me.getColorRanges(),
            radiogroupItems = [];

        // Cria a lista de Radio itens um para cada opcao de contrast
        Ext.Object.each(colorRanges, function (contrastName, contrastValues, ranges) {
            radiogroupItems.push({
                inputValue: contrastName,
                boxLabel: contrastValues.displayName,
                height: 30,
            })
        }, me)

        Ext.apply(this, {
            items: [{
                xtype: 'fieldset',
                flex: 1,
                border: false,
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    hideEmptyLabel: false
                },
                items: [
                    {
                        xtype: 'radiogroup',
                        hideLabel: true,
                        columns: 1,
                        simpleValue: true,
                        name: 'contrast',
                        bind: '{currentContrast}',
                        items: radiogroupItems,
                        listeners: {
                            scope: me,
                            change: me.onChooseContrast
                        }
                    }

                ]
            }]
        });

        me.callParent(arguments);

    },

    onChooseContrast: function (radiogroup, value) {
        var me = this;
        me.setCurrentContrast(value.contrast)
    },

    getContrastValues: function (contrastName) {
        var me = this,
            colorRanges = me.getColorRanges();
        return colorRanges[contrastName]
    },

    /**
     * Setar o contraste que está disponível,
     * esse contraste será usado para modificar o contraste da tile.
     * se o constrate for diferente executa o metodo changeContrast do visiomatic.
     * se for igual nao faz nada
     */
    setCurrentContrast: function (currentContrast) {
        var me = this,
            vm = me.getViewModel(),
            oldContrast = vm.get('currentContrast'),
            visiomatic = me.getVisiomatic(),
            contrastValues = me.getContrastValues(currentContrast);

        if (currentContrast !== oldContrast.contrast) {

            vm.set('currentContrast', { contrast: currentContrast });

            visiomatic.changeContrast(currentContrast, contrastValues, me)

        }
    }
});
