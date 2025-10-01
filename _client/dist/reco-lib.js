console.log("reco.js loading")
if (!window.crypto) {
    window.crypto = {
        getRandomValues: (arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        }
    };
    console.log("reco : crypto object created with getRandomValues")
} else {
    console.log("reco : crypto object exist")
}
if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = () => {
        let uuid = '';
        for (let i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid += '-';
            } else if (i === 14) {
                uuid += '4';
            } else {
                uuid += (Math.random() * 16 | 0).toString(16);
            }
        }
        return uuid;
    }
    console.log("reco : crypto randomUUID created")
}

if (eruda) eruda.init();
console.log("reco.js loaded")
