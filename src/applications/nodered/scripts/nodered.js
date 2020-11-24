let $$r = {
    'timer': $res.timers
};

let String = $res.string;
function doit () {
    let context = {
        'header': 'Colors',
        'items': [
            {'name': 'red', 'first': true, 'url': '#Red'},
            {'name': 'green', 'link': true, 'url': '#Green'},
            {'name': 'blue', 'link': true, 'url': '#Blue'}
        ],
        'empty': false
    };
    print(String.mustache('<h1>{{header}}</h1>{{#bug}}{{! ПРОБНЫЙ КОММЕНТАРИЙ }}{{/bug}}{{#items}}{{#first}}<li><strong>{{name}}</strong></li>{{/first}}{{#link}}<li><a href="{{url}}">{{name}}</a></li>{{/link}}{{/items}}{{#empty}}<p>The list is empty.</p>{{/empty}}', context));
}

$bus.on(function () {
    doit();
    gc(true);
});

doit();
