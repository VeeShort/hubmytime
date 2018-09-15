chrome.app.runtime.onLaunched.addListener(() => {
    console.log('launched');
    chrome.app.window.create('index.html', {
        'outerBounds': {
        'width': 400,
        'height': 500
        }
    });
});