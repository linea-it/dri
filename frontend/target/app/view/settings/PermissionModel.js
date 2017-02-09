Ext.define('Target.view.settings.PermissionModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.permission',

    requires: [
        'Target.model.Catalog',
        'Target.model.PermissionUser',
        'Target.model.PermissionWorkgroup',
        'Target.model.Permission',
        'Target.model.Workgroup',
        'Target.model.WorkgroupUser',
        'Target.store.PermissionUsers',
        'Target.store.PermissionWorkgroups',
        'Target.store.Permissions',
        'Target.store.Workgroups',
        'Target.store.WorkgroupUsers',
        'common.store.UsersSameGroup'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        newWorkgroup: {
            type: 'Target.model.Workgroup',
            create: true
        }
    },

    stores: {
        permissions: {
            type: 'permissions'
        },
        permissionUsers: {
            type: 'permission_users'
        },
        permissionWorkgroups: {
            type: 'permission_workgroups'
        },
        users: {
            type: 'users_same_group',
            storeId: 'Users'
        },
        workgroups: {
            type: 'workgroups',
            storeId: 'Workgroups',
            autoLoad: true
        },
        workgroupUsers: {
            type: 'workgroup_users',
            storeId: 'WorkgroupUsers'
        },
        users2: {
            type: 'users_same_group',
            storeId: 'Users2'
        }

    }
});
