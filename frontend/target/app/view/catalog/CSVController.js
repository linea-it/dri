/**
 *
 */
Ext.define('Target.view.catalog.CSVController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.csvform',

    requires: [
        'Target.store.Catalogs',
        'Target.view.association.Panel'
    ],

    separator: ',',
    baseProperties: ['ra', 'dec'],
    allowedFormats: ['csv', 'text/csv', 'application/zip', 'application/gzip'],

    addCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            fldFileUploaded = me.lookupReference('fldFileUploaded'),
            values, data, name, release, isPublic, csvData, file, filesize, filetype;

        if (form.isValid()) {

            values = form.getValues();

            // Criando um internal name
            name = values.displayName.split(' ').join('_');
            name = name.toLowerCase().trim();

            release = values.release !== '' ? [values.release] : [];

            isPublic = values.isPublic === 'on' ? true : false;

            csvData = values.csvData !== '' ? values.csvData : null;

            data = {
                type: 'catalog',
                class: values.classname,
                name: name,
                displayName: values.displayName,
                releases: release,
                isPublic: isPublic,
                description: values.description,
                // mime: 'csv'
                // csvData: csvData,
                // fileUploaded: file
                base64: false
            };


            // https://www.xspdf.com/help/50965740.html
            file = fldFileUploaded.fileInputEl.dom.files[0];


            // Verificar se o usuario Preencheu os 2
            if ((csvData !== null) && (file !== undefined)) {

                Ext.MessageBox.show({
                    msg: 'You have filled in the file field and the coordinate field please choose one and try again.',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
                return;
            }


            if (file !== undefined || (file instanceof File)) {

                filesize = file.size / 1024 / 1024; // in MiB
                // console.log("Tamanho do arquivo: %o MB", filesize)
                filetype = file.type;
                // console.log("Tipo do arquivo: %o", filetype)

                // Tamanho maximo de 50Mb
                if (filesize > 50) {
                    Ext.MessageBox.show({
                        title: 'Very large file',
                        msg: 'Maximum upload size is 50Mb try to compress the file or divide it into smaller parts.',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });

                    return;
                }

                // Verificar se é um tipo permitido
                if (!me.allowedFormats.includes(filetype)) {
                    Ext.MessageBox.show({
                        title: 'File type not allowed',
                        msg: 'The file must be CSV-formatted text with a .csv extension or a compressed csv file with a .zip or tar.gz extension.',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                    return;
                }

                reader = new FileReader();

                reader.onloadend = function (event) {
                    var binaryString = '',
                        bytes = new Uint8Array(event.target.result),
                        length = bytes.byteLength,
                        i,
                        base64String;

                    // convert to binary string
                    for (i = 0; i < length; i++) {
                        binaryString += String.fromCharCode(bytes[i]);
                    }

                    // convert to base64
                    base64String = btoa(binaryString);


                    data.mime = filetype;
                    data.csvData = base64String;
                    data.base64 = true;

                    me.importTargetList(data);

                };

                reader.readAsArrayBuffer(file);


            } else if (csvData !== null) {
                // console.log("Preencheu o campo csv data")

                data.mime = 'csv';
                data.csvData = csvData;
                data.base64 = false;

                me.importTargetList(data);

            }
            else {
                // console.log("Não preencheu nenhum dos 2")
                Ext.MessageBox.show({
                    msg: 'You must select a file to upload or fill in the coordinates manually.',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
                return;
            }
        }
    },

    importTargetList: function (data) {
        var me = this,
            view = me.getView();

        view.setLoading(true);

        Ext.Ajax.request({
            cors: true,
            method: 'POST',
            url: '/dri/api/import_target_list/',
            timeout: 3 * 60000,  // 60000 = 1s
            success: function (response) {
                var data = JSON.parse(response.responseText);
                if (data.success) {

                    //Fechar a janela de registro
                    view.fireEvent('newproduct', data.product);

                    view.setLoading(false);

                } else {
                    view.setLoading(false);

                    Ext.MessageBox.show({
                        title: 'Failure',
                        icon: Ext.MessageBox.WARNING,
                        msg: data.message,
                        buttons: Ext.MessageBox.OK
                    });
                }
            },
            failure: function (response, opts) {
                view.setLoading(false);
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            },
            // Headers necessarios para fazer um Post Autheticado no Django
            headers: {
                'Accept': 'application/json',
                'Application': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
            },
            params: Ext.util.JSON.encode(data)
        });
    },

    onCancelAddCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            win = view.up('window');

        form.reset();
        win.close();

    }
});
