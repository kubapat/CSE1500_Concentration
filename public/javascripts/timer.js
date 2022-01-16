const timer = setInterval(function() {
    var start = gs.getStartTime();
    if(start == "Game hasn't started yet") var result = start;
    else {
	var seconds = parseInt(Math.floor((Date.now() - parseInt(gs.getStartTime())) / 1000));
	var result = "";
        if(seconds < 60) result+="00";
	else if(seconds < 600) result += "0"+Math.floor(seconds/60);
	else result += Math.floor(seconds/60);

	result += ":";
	if(seconds%60 < 10) result+="0";

	result+=seconds%60;
    }

    document.getElementById('gametime').innerHTML = result;
}, 1000);
