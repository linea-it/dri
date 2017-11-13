Ext.define('Explorer.store.SpectralDistributions', {
    extend: 'Ext.data.Store',

    alias: 'store.spectral-distribution',

    fields: ['flux', 'mag_auto', 'wavelength', 'property'],

    // data: [
    //     {"mag_auto":22, "wavelength":'474', 'band': 'g'},
    //     {"mag_auto":25, "wavelength":'645.5', 'band': 'r'},
    //     {"mag_auto":23, "wavelength":'783.5', 'band': 'i'},
    //     {"mag_auto":27, "wavelength":'926', 'band': 'z'},
    //     {"mag_auto":21, "wavelength":'1008', 'band': 'Y'},
    // ],

    autoLoad: true,

    sorters: 'wavelength'

});
