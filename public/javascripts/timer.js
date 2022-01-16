setInterval(function() {
    var start = gs.getStartTime();
    if(start == "Game hasn't started yet") var result = start;
    else var result = Math.floor((Date.now() - parseInt(gs.getStartTime())) / 1000)

    document.getElementById('gametime').innerHTML = result;
}, 1000);
