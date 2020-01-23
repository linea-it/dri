Ext.define('visiomatic.contrast.ContrastOverlayWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'visiomatic.contrast.ContrastViewModel',
    'visiomatic.contrast.ContrastController',
    ],

  xtype: 'visiomatic-contrast-overlay',
  controller: 'contrastoverlay',
  viewModel: 'contrastoverlay',

  config: {
      // Instancia atual do visiomatic onde serao feitos os overlays
      visiomatic: null,

      // Instancia de um common.model.Dataset com todas as informacoes sobre a tile, release, tag
      dataset: null
  },

  initComponent: function () {
      var me = this;
      Ext.apply(this, {
          title: 'Contrast Overlay',
          width: 200,
          height: 185,
          closeAction: 'hide',
          layout: {
              type: 'vbox',
              align: 'stretch'
          },
          items: [
              {
                  xtype: 'panel',
                  flex: 1,
                  framed: true,
                  bodyPadding: 5,
                  layout: {
                        type: 'vbox',
                        align: 'stretch'
                  },
                  items: [
                    {
                        xtype: 'fieldset',
                        flex: 1,
                        border: false,
                        items: [
                            {
                                xtype: 'radiogroup',
                                layout: 'vbox',
                                name: 'contrast',
                                items: [
                                    {
                                        inputValue: 'normal',
                                        fieldLabel: 'Normal contrast',
                                        height: 30,
                                        checked: true,
                                    },
                                    {

                                        inputValue: 'medium',
                                        fieldLabel: 'Medium contrast',
                                        height: 30,
                                    },
                                    {
                                        inputValue: 'high',
                                        fieldLabel: 'High contrast',
                                        height: 30,
                                    },
                                ]
                            },
                        ]
                    }
                  ]
              },
          ],
          buttons: [
            {
                text: 'Apply',
                handler: 'onClickContrast'
            }
        ],
      });

      me.callParent(arguments);

  },

  setVisiomatic: function(visiomatic) {
      this.visiomatic = visiomatic;
      this.getViewModel().set('visiomatic', visiomatic);

  },


  /**
   * Setar o Dataset que esta visivel no visiomatic,
   * esse dataset sera usado para fazer a query dos objetos.
   * se o dataset for diferente do anterior dispara o evento changedataset.
   * se for igual nao faz nada
   */
  setDataset: function (dataset) {
      var me = this,
          oldDataset = me.getDataset(),
          is_dirty = false;

      // Se ja existir um dataset setado checar se e diferente do atual
      if ((oldDataset !== null) && (oldDataset.get('id') > 0)) {
          if (oldDataset.get('id') === dataset.get('id')) {
              is_dirty = false;

          } else {
              is_dirty = true;
          }

      } else {
          is_dirty = true;

      }

      // se for um dataset novo disparar o evento.
      if (is_dirty) {
          me.dataset = dataset;
          me.getViewModel().set('dataset', dataset);

          me.fireEvent('changedataset', dataset, me);
      }

  }

});
