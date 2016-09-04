/* very basic setup taken from
   https://developer.chrome.com/apps/app_lifecycle
*/
chrome.app.runtime.onLaunched.addListener(function(){
    chrome.app.window.create('indx.html',{
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
