# ThingJS

> ThingJS is open source IoT platform.
> The project is development template of ThingJS platform. Based on [vuejs-templates](http://vuejs-templates.github.io/webpack/)

  - [Build Setup](#build-setup)
  - [UBUS messages](#ubus-messages)
    - [WEB browser side](#web-browser-size)
    - [Controller side](#controller-side)
    - [Predefined system messages](#predefined-system-messages)
   - [Resource interfaces](#resource-interfaces)

## Main profits
* Open source
* Light cross-platform applications
* Single syntax for any layers (JavaScript)
* Relevant developing stack (webpack, npm and etc)
* Runtime and dev dependencies (by npm)
* Cross-platform, hardware independent data bus ([UBUS](#ubus-messages))
* Cross-platform, hardware independent [resource interfaces](#resource-interfaces)
* Friendly development mode (hot reload, debugger, storage editor and etc)
* Famous frameworks on board ([VueJS](https://vuejs.org/), [Vuetify](https://vuetifyjs.com/))
* Simple integration with cloud services

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

```

## UBUS messages
>UBUS is universal bus for communicate between different nodes. 
Any device can provide the role. Include WEB browser. When you send
message to the bus, all nodes receive it. Important - message will be
delivered when node is subscriber for this message.

>**Max length packed in UBUS is 127 bytes**

### WEB browser side
``` javascript

 //Send message to UBUS with type "hello" and message "cargo"
 window.$bus.$emit(window.$consts.EVENTS.UBUS_MESSAGE, "hello", "payload");
 ...
 //Receiving and showing message from UBUS
 window.$bus.$on(window.$consts.EVENTS.UBUS_MESSAGE, function(type, messages) {
    console.log(`${type}:${messages}`);
 });
 ...
 //Result in console
 hello:payload
```

### Controller side
#### application manifest
``` json
  ...    
  "scripts" : {
    "subscriptions" : ["hello"],
    "entry" : "main",
    "modules" : {
      "main": {
        "source": "scripts/main.js",
        "optimize": false,
        "hot_reload" : true
      }
    }
  }
  ...    
```
#### application mjs script scripts/main.js
``` javascript
 //When message will received, function will call callback function
 $bus.on(function (event, data) {
    if (event === 'hello') {
        print(event, ":", data);
    }
 }, null);

 //Sending message to UBUS
 $bus.emit('my-script-ready', null);
```

### Predefined system messages
> All broadcast system messages is defined in **window.$const.UBUS**
> You can send the messages from outside to controller only in develop mode.

#### Broadcast  
- **$-current-time** - (CURRENT_TIME) Contains epoch time (ms). Happens when the time is synchronized.
- **$-online** - (IS_ONLINE) No content. Happens when the controller connected to Internet.
- **$-offline** - (IS_OFFLINE) No content. Happens when the controller disconnected.
- **$-script-error** - (SCRIPT_ERROR) Contains error text. Happens when the script generates an error.
- **$-storage-changed** - (STORAGE_CHANGED) Contains uri of storage object. Happens when object of storage was changed.
- **$-debugger-request** - (DEBUGGER_REQUEST) No content. Happens when mJS meet "debugger" command in script. (dev mode only)

#### JavaScript
``` javascript
 window.$bus.$on(window.$consts.EVENTS.UBUS_MESSAGE, function(type, messages) {
    switch(type){
        case window.$consts.UBUS.CURRENT_TIME:
            console.log('Now is ', new Date(1 * messages));
            break;
        case window.$consts.UBUS.SCRIPT_ERROR:
            console.error('Script error: ', messages);
            break;
    }
 });
```

#### Specific massages for controller side script
- **$-started** - No content. Happens when the controller starts or script installed.

#### Specific massages for core controller
- **$-script-restart** - Contains application name. Do start/restart script process.
- **$-script-stop** - Contains application name. Do terminate script process.

#### mjs script
``` javascript
 $bus.on(function (event, data) {
    if (event === '$-started') {
        print("Controller is ready!");
    }
 }, null);
```

## Resource interfaces

The descriptions of available interfaces in [repo](https://github.com/rpiontik/ThingJS-stdi/tree/beta) 

# Thankful
* [JetBrains](https://www.jetbrains.com/) for OpenSource license.

# Licensing
ThingsJS is released under
[GNU GPL v.2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
open source license.