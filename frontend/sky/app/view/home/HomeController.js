/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.home.HomeController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.home',

    /**
     * executada ao selecionar um release.
     * dispara o carregamento da store Datasets.
     * dispara o carregamento da imagens usadas no Aladin.
     * @param  {object} combo  combobox para selecao dos releases
     * @param  {object} record release selecionado
     */
    onSelectRelease: function (combo, record) {
        if (record.get('id') > 0) {
            this.loadDatasets(record);

            this.loadSurveys(record);

            this.loadSkys(record);
        }
    },

    /**
     * Filtra a Store Dataset de acordo com o release
     * @param {object} [record] Model Instancia do model Release
     */
    loadDatasets: function (record) {
        var me = this,
            release = record.get('id'),
            vm = this.getViewModel(),
            datasets = vm.getStore('datasets'),
            filters = [],
            tags = [];

        if (release > 0) {
            // Recupera os tags em um release
            tags = me.tagsByRelease(release);

            if (tags.length == 1) {
                filters.push(
                    {
                        property: 'tag',
                        value: tags[0]
                    }
                );

            } else if (tags.length > 1) {
                filters.push(
                    {
                        property: 'tag',
                        operator: 'in',
                        value: tags
                    }
                );

            } else {
                console.log('Nenhum field encontrado para o release.');
                return false;
            }

            if (filters.length > 0) {
                datasets.filter(filters);

            }
        }
    },

    /**
     * Carrega a lista de imagens disponiveis para um release.
     * @param {object} [record] Model Instancia do model Release
     */
    loadSurveys: function (release) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('surveys');

        store.filter(
            [
                {
                    property: 'srv_project',
                    value: 'DES'
                },

                {
                    property: 'srv_release',
                    value: release.get('id')
                }
            ]
        );
    },

    /**
     * Filtra a Store Skys de acordo com o release
     * @param {object} [record] Model Instancia do model Release
     */
    loadSkys: function (record) {
        var me = this,
            release = record.get('id'),
            vm = this.getViewModel(),
            tiles = vm.getStore('tiles'),
            tagsbyrelease = vm.getStore('tagsbyrelease'),
            filters = [],
            tags = [];

        if (release > 0) {
            tagsbyrelease.filter([
                {
                    property: 'tag_release',
                    value: release
                }
            ]);


            // Recupera os ids dos tags em um release.
            tags = me.tagsByRelease(release);

            if (tags.length == 1) {
                filters.push(
                    {
                        property: 'tag',
                        value: tags[0]
                    }
                );

            } else if (tags.length > 1) {
                filters.push(
                    {
                        property: 'tag',
                        operator: 'in',
                        value: tags
                    }
                );

            } else {
                console.log('Nenhum field encontrado para o release.');
                return false;
            }

            if (filters.length > 0) {
                tiles.filter(filters);

            }
        }
    },


    /**
     * Retorna os tags que estao associados a um release
     * @param {int} [release] Id do release
     * @return {Array} [ids] um array com os ids dos tags encontrados
     */
    tagsByRelease: function (release) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('tags'),
            ids = [],
            tags;

        tags = store.query('tag_release', release);

        tags.each(function (tag) {
            ids.push(tag.get('id'));

        }, this);

        return ids;
    },

    /**
     * @method onEyeballing [description]
     */
    onEyeballing: function () {
        console.log('onEyeballing()');
        var me = this,
            vm = me.getViewModel(),
            current = vm.get('currentRelease'),
            release = current.get('id'),
            hash;

        hash = 'ebl/' + release;

        me.redirectTo(hash);

    }

});
