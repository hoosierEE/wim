chrome.app.runtime.onLaunched.addListener(()=>{
    chrome.app.window.create('index.html', {
        id: 'MyWindowID',
        bounds: {
            width: 800,
            height: 600,
            left: 100,
            top: 100
        },
        //minWidth: 800,
        //minHeight: 600
    });
});
