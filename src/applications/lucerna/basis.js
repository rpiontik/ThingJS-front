import Store from './storage';
import Langs from './langs'

$includeLang(Langs);
$store.registerModule('lucerna', Store);
$exportComponent('lucerna-basis', {
    name : "Basis"
});