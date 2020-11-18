let $$r = {
    'timer': $res.timers
};

let String = $res.string;

print(">>>>>>>>>>>",String.replaceAll("1234",4, ""),"<<<<<<<<<<<<<<<<");

let items = String.split({}.a,"d");
for(let i=0; i < items.length; i++) {
    print("Item[",i,"]=",items[i],";");
}