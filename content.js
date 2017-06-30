function httpGetAsync(theUrl, callback)
{
    console.log("Hey!");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

var reload = document.getElementById("newUsername");
reload.onclick = function() {
  chrome.storage.sync.remove("githubUser", function(items) {
    window.location.reload(true);
  });
}


chrome.storage.sync.get({githubUser: 'default'}, function(obj){
    if (obj.githubUser === 'default') {
      document.body.innerHTML = "<p>Please enter your GitHub Username</p><input id=userInput type=text ><button id=confirm>Enter</button>";
      var button = document.getElementById("confirm");
      button.onclick = function() {
        var username = document.getElementById("userInput").value;
        chrome.storage.sync.set({ githubUser: username }, function(){
          window.location.reload(true);
        });
      }
    }
    else {
      updateUi(obj.githubUser);
    }
});

function updateUi(username) {
  var url = "https://api.github.com/users/"+username+"/events"
  httpGetAsync(url, function (response) {
    response = JSON.parse(response);
    var data = response.filter(function(obj) {
      return obj.type === "PushEvent";
    });
    var mostRecent = data[0];
    var mostRecentDate = mostRecent.created_at;
    mostRecentDate = new Date(mostRecentDate);
    var now = new Date()
    var duration = now - mostRecentDate;

    var x = duration/1000;
    var seconds = Math.floor(x%60);
    x /= 60;
    var minutes = Math.floor(x%60);
    x /=60;
    var hours = Math.floor(x%24)
    x /=24;
    var days = Math.floor(x);


    var timeElement = document.getElementById('time');
    timeElement.innerHTML = days + " Days, " + hours + " Hours, " + minutes + " Minutes, " + seconds + " Seconds.";
    var interval = setInterval(function() {
      seconds++;
      if (seconds == 60) {
        minutes++;
        seconds = 0;
      }
      if (minutes == 60) {
        hours++;
        minutes = 0;
      }
      if (hours == 24) {
        days++;
        hours = 0;
      }
      timeElement.innerHTML = days + " Days, " + hours + " Hours, " + minutes + " Hours, " + seconds + " Seconds.";
    }, 1000)
  })
}
