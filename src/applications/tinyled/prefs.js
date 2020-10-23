import Preferences from './components/Preferences.vue';
import Langs from './langs';

// Language module
$includeLang(Langs);

// Registering bundle components
$exportComponent('tinyled-preferences', Preferences);
