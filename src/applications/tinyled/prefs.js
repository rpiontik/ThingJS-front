import Preferences from './components/Preferences.vue';
import PreferencesHW from './components/PreferencesHW.vue';
import FenistApp from './FenistDash.vue';
import Langs from './langs';

// Language module
$includeLang(Langs);

// Registering bundle components
$exportComponent('tinyled-preferences', Preferences);
$exportComponent('fenist-preferences', PreferencesHW);
$exportComponent('fenist-app', FenistApp);
