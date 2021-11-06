export default {
    saveSelectedApp: app => localStorage.setItem('selectedApp', app),
    loadSelectedApp: () => localStorage.getItem('selectedApp'),

};