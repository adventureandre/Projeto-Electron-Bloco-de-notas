const {ipcRenderer} = require('electron');

//ELEMENTOS
const textarea = document.getElementById('text');
const title = document.getElementById('title');

//SET FILE
ipcRenderer.on('set-file', (event,data)=>{
    textarea.value = data.content;
    title.innerHTML = data.name + ' | WDEV EDITOR';
} )

//UPDATE TEXTAREA
function handleChangeText() {
    ipcRenderer.send('update-content', textarea.value);
}


// Cria uma notificaão
var button = document.getElementById('text');

button.addEventListener('click', function() {
    notification();
});
