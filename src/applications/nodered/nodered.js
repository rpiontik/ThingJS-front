import App from './NodeRed.vue';
import Langs from './langs';

$includeLang(Langs);
$exportComponent('nodered-app', App);
