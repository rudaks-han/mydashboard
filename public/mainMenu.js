module.exports = [
    {
        label: 'MyDashboard',
        submenu: [
            {label: 'About My Dashboard'},
            {label: 'Check Update'}
        ]
    },
    {
        label: 'Actions',
        submenu: [
            {
                label: 'DevTools',
                role: 'toggleDevTools'
            },
            {
                role: 'ToggleFullScreen'
            }
        ]
    }
]