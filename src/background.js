/* very basic setup taken from
   https://developer.chrome.com/apps/app_lifecycle
*/
chrome.app.runtime.onLaunched.addListener(()=>{
    chrome.app.window.create('index.html',{
        id:'main_window',
        bounds:{
            width:800,
            height:600,
            left:100,
            top:100,
        },
        minWidth:800,
        minHeight:600,
    });
});
