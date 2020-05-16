import App from './App.vue';
import Scheduller from './components/Scheduler.vue';

$requireComponent('lucerna-basis').then(() => {
    $exportComponent('lucerna-app', App);
    $exportComponent('lucerna-scheduller', Scheduller);
});
