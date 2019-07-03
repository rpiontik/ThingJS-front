export default {
    methods : {

        //Return formatted date
        getFormattedDate : function (date, format) {

            var year = date?date.getFullYear():"----";

            var month = date?(1 + date.getMonth()).toString():"--";
            month = month.length > 1 ? month : '0' + month;

            var day = date?date.getDate().toString():"--";
            day = day.length > 1 ? day : '0' + day;

            switch(format){
                case 'ru' :
                    return day + '.' + month + '.' + year;
                case 'vuetifyjs':
                    if(!date)
                        return null;
                    else
                        return year + '-' + month + '-' + day;
                default:
                    return year + '/' + month + '/' + day;
            }

        },

        //Return formatted time
        getFormattedTime : function (date, format) {

            var h = date?(date.getHours()).toString():"--";
            h = h.length > 1 ? h : '0' + h;

            var m = date?date.getMinutes().toString():"--";
            m = m.length > 1 ? m : '0' + m;

            var s = date?date.getSeconds().toString():"--";
            s = s.length > 1 ? s : '0' + s;

            switch(format){
                case 'vuetifyjs':
                    if(!date)
                        return null;
                default:
                    return h + ':' + m + ':' + s;
            }

        },

    },
    computed :{

        //Return datetime of controller
        hwDateTime: function () {
            if(!this.$store.state.datetime.curr_datetime)
                return new Date(0);
            else {
                return new Date(this.$store.state.datetime.curr_datetime + (new Date).getTimezoneOffset() * 60000);
            }
        },

        //Return true if process of reloading access points list is active
        isAPListReloading: function(){
            return this.$store.state.net.is_reloading_ap_list ;
        },

        isMobileScreen: function(){
            return this.$store.state.display.is_mobile;
        }

    },

}