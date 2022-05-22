var fireBase = fireBase || firebase;
var hasInit = false;
var config = {
    apiKey: "AIzaSyDwNuNKf0roG8DYYckSJHptKkREt07s5Bc",
	authDomain: "searchingtravels.firebaseapp.com",
	databaseURL: "https://searchingtravels-default-rtdb.firebaseio.com",
	projectId: "searchingtravels",
	storageBucket: "searchingtravels.appspot.com",
	messagingSenderId: "1015032789487",
	appId: "1:1015032789487:web:aef1a358b772a5dee15e1a",
	measurementId: "G-E4WYC0Y7JY"
  };
if(!hasInit){
    fireBase.initializeApp(config);
    hasInit = true;
}


