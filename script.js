var startTime;
$(document).ready(function(){
	country();
	change_time();
	$('.change_slide .buttn').on('click',function(){
		var dt =$(this).attr('data');
		$('.head .aslide').removeClass('slideRightin').hide();
		$('#slide'+dt).show().addClass('slideRightin');
		
		$('.change_slide .buttn').removeClass('activen');
		$(this).addClass('activen');
		
		clearInterval(startTime);
		change_time();
	});
});
function change_time(){
	startTime = setInterval(function(){
		var clka =$('.change_slide').find('.activen');
		if(clka.next().hasClass('buttn')){
			clka.next().click();
		} else {
			$('.change_slide .buttn:first').click();
		}
	},5000);
}


$(document).on('click','#SearchCity',function(){
	$('.loader').show();
	var sendd=0;
	$('.searchOt .checkV').each(function(){
		var valn=$(this).val();
		if(valn ==''){ sendd=1; }
	});
	//if(destination !='' && check_in !='' && check_out != '' && number_adults != '' && interest1 != '' && interest2 != ''){
	console.log(sendd);
	if(sendd == 0){
		//main(destination, check_in, check_out, number_adults, interest1, interest2);
		main();
	}
	else {
		$('.loader').hide();
		$('.alert').show();
		setTimeout(function(){ $('.alert').hide(); },2500);
	}
});

//----------------LOGIN------------

$(document).on('click','#logout',function(){
	  alert("ok");
	  fireBase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          console.log("stay");
			alert('ok');
        } else {
          // No user is signed in.
         console.log("redirect");
          window.location.replace("login.html");
        }
      });
	  
	  
	
	fireBase.auth().signOut().then(function(){
		console.log('success');
		window.location.replace("login.html");
	},function(){})

});


//function main(destination, check_in, check_out, number_adults, interest1, interest2){
function main(){
	
	var destination =$.trim($('#stext').val());
	var check_in = $.trim($('#check_in').val());
	var check_out = $.trim($('#check_out').val());
	var number_adults = $.trim($('#number_adults').val());
	var interest1 = $.trim($('#interest1').val());
	var interest2 = $.trim($('#interest2').val());
	
	var html = '';
	var destinationID = search_locationID_callback(destination);
	console.log("LocationID: "+destinationID);
	var number_rooms = Math.round((number_adults / 2));
	console.log("Number rooms: "+number_rooms);
	var destinationName = search_locationName_callback(destination);
	console.log("Destinationname: "+destinationName)
	var dest_type = search_destType_callback(destination);
	var hotels = callbackHotels(number_rooms, check_out, check_in, number_adults, destinationID, dest_type)
	var hotelID;
	var hotelsOfInterest = [];
	for(var i = 0; i < hotels.length; i++){
		var match = false;
		hotelID = hotels[i].hotel_id;
		var description = callbackDescription(hotelID);
		var attractions = callbackAttractions(hotelID);
		match = compareDescriptionWithInterests(description, interest1, interest2);
		if (match == true){
			hotelsOfInterest.push([hotelID, hotels[i].hotel_name, hotels[i].price_breakdown.all_inclusive_price, attractions]);
		}
		else {
			if(hotelsOfInterest.length < 3 && hotels.length - i < 3){
				hotelsOfInterest.push([hotelID, hotels[i].hotel_name, hotels[i].price_breakdown.all_inclusive_price, attractions]);
			}
		}
	}
	html+='<h1 titleA>'+'Location: '+destinationName+'</h1>';
	for(var i = 0; i < hotelsOfInterest.length; i++){
		html+='<h2 titleB>'+'Hotelname: '+hotelsOfInterest[i][1]+'</h2>';
		html+='<h3 titleC>'+'Allinclusive Price: '+hotelsOfInterest[i][2]+'</h3>';
		html+='<h3 titleC>'+'Attractions: '+hotelsOfInterest[i][3]+'</h3><br>';
	}
	
	$('#test').html(html);
	$('.loader').fadeOut(300);
}

function search_locationID_callback(destination){
	const location = search_location(destination);
	const destinationID = location.responseJSON[0].dest_id;
	return destinationID;
}

function search_locationName_callback(destination){
	const location = search_location(destination);
	const destinationName = location.responseJSON[0].name;
	return destinationName;
}

function search_destType_callback(destination){
	const location = search_location(destination);
	const destType = location.responseJSON[0].dest_type;
	return destType;
}

function search_location(destination){
	return $.ajax({
		async: false,
		url:"https://booking-com.p.rapidapi.com/v1/hotels/locations?name="+destination+"&locale=en-gb", //&locale=AUT
		type: "GET",
		headers: {
          "x-rapidapi-host": "booking-com.p.rapidapi.com",
          "x-rapidapi-key": "83452ac0b5mshe56b7742de86445p191ae7jsn4d0920706bc4"
         }
		});
		
}


function callbackHotels(room_numbers, checkout_date, checkin_date, adults_number, destinationID, dest_type){			
	const hotels = get_hotels(room_numbers, checkout_date, checkin_date, adults_number, destinationID, dest_type);
	console.log(hotels.responseJSON.result);
	return hotels.responseJSON.result
}

function compareDescriptionWithInterests(description, interest1, interest2){
	if (String(description).includes(String(interest1)) || String(description).includes(String(interest2))){
		return true;
	} else
		return false;
}

function get_hotels(room_numbers, checkout_date, checkin_date, adults_number, destinationID, dest_type){
	return $.ajax({
		async: false,
		url:"https://booking-com.p.rapidapi.com/v1/hotels/search?room_number="+room_numbers+"&order_by=popularity&filter_by_currency=EUR&checkout_date="+checkout_date+"&checkin_date="+checkin_date+"&units=metric&adults_number="+adults_number+"&dest_id="+destinationID+"&dest_type="+dest_type+"&locale=en-gb", //&locale=AUT
		type: "GET",
		headers: {
          "x-rapidapi-host": "booking-com.p.rapidapi.com",
          "x-rapidapi-key": "83452ac0b5mshe56b7742de86445p191ae7jsn4d0920706bc4"
         }
		});
}
function callbackAttractions(hotel_id){
	const attractions = get_attractions_for_hotel(hotel_id);
	return attractions.responseJSON.location_highlights.popular_landmarks;
}

function get_attractions_for_hotel(hotel_id){
	return $.ajax({
		async: false,
		url:"https://booking-com.p.rapidapi.com/v1/hotels/location-highlights?hotel_id="+hotel_id+"&locale=en-gb", //&locale=AUT
		type: "GET",
		headers: {
          "x-rapidapi-host": "booking-com.p.rapidapi.com",
          "x-rapidapi-key": "83452ac0b5mshe56b7742de86445p191ae7jsn4d0920706bc4"
         },
		});
}
function callbackDescription(hotel_id){
	const description = get_hotel_description(hotel_id);
	return description.responseJSON.description;
}
function get_hotel_description(hotel_id){
	return $.ajax({
		async: false,
		url:"https://booking-com.p.rapidapi.com/v1/hotels/description?hotel_id="+hotel_id+"&locale=en-gb", //&locale=AUT
		type: "GET",
		headers: {
          "x-rapidapi-host": "booking-com.p.rapidapi.com",
          "x-rapidapi-key": "83452ac0b5mshe56b7742de86445p191ae7jsn4d0920706bc4"
         }

		});
	
}


function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
	  currentDate = Date.now();
	} while (currentDate - date < milliseconds);
  }

function country(){
	var ct =[{"country": "Afghanistan"},{"country": "Albania"},{"country": "Algeria"},{"country": "American Samoa"},{"country": "Andorra"},{"country": "Angola"},{"country": "Anguilla"},{"country": "Antarctica"},{"country": "Antigua and Barbuda"},{"country": "Argentina"},{"country": "Armenia"},{"country": "Aruba"},{"country": "Australia"},{"country": "Austria"},{"country": "Azerbaijan"},{"country": "Bahamas"},{"country": "Bahrain"},{"country": "Bangladesh"},{"country": "Barbados"},{"country": "Belarus"},{"country": "Belgium"},{"country": "Belize"},{"country": "Benin"},{"country": "Bermuda"},{"country": "Bhutan"},{"country": "Bolivia"},{"country": "Bosnia and Herzegovina"},{"country": "Botswana"},{"country": "Bouvet Island"},{"country": "Brazil"},{"country": "British Indian Ocean Territory"},{"country": "Brunei"},{"country": "Bulgaria"},{"country": "Burkina Faso"},{"country": "Burundi"},{"country": "Cambodia"},{"country": "Cameroon"},{"country": "Canada"},{"country": "Cape Verde"},{"country": "Cayman Islands"},{"country": "Central African Republic"},{"country": "Chad"},{"country": "Chile"},{"country": "China"},{"country": "Christmas Island"},{"country": "Cocos (Keeling) Islands"},{"country": "Colombia"},{"country": "Comoros"},{"country": "Congo"},{"country": "The Democratic Republic of Congo"},{"country": "Cook Islands"},{"country": "Costa Rica"},{"country": "Ivory Coast"},{"country": "Croatia"},{"country": "Cuba"},{"country": "Cyprus"},{"country": "Czech Republic"},{"country": "Denmark"},{"country": "Djibouti"},{"country": "Dominica"},{"country": "Dominican Republic"},{"country": "East Timor"},{"country": "Ecuador"},{"country": "Egypt"},{"country": "England"},{"country": "El Salvador"},{"country": "Equatorial Guinea"},{"country": "Eritrea"},{"country": "Estonia"},{"country": "Ethiopia"},{"country": "Falkland Islands"},{"country": "Faroe Islands"},{"country": "Fiji Islands"},{"country": "Finland"},{"country": "France"},{"country": "French Guiana"},{"country": "French Polynesia"},{"country": "French Southern territories"},{"country": "Gabon"},{"country": "Gambia"},{"country": "Georgia"},{"country": "Germany"},{"country": "Ghana"},{"country": "Gibraltar"},{"country": "Greece"},{"country": "Greenland"},{"country": "Grenada"},{"country": "Guadeloupe"},{"country": "Guam"},{"country": "Guatemala"},{"country": "Guernsey"},{"country": "Guinea"},{"country": "Guinea-Bissau"},{"country": "Guyana"},{"country": "Haiti"},{"country": "Heard Island and McDonald Islands"},{"country": "Holy See (Vatican City State)"},{"country": "Honduras"},{"country": "Hong Kong"},{"country": "Hungary"},{"country": "Iceland"},{"country": "India"},{"country": "Indonesia"},{"country": "Iran"},{"country": "Iraq"},{"country": "Ireland"},{"country": "Israel"},{"country": "Isle of Man"},{"country": "Italy"},{"country": "Jamaica"},{"country": "Japan"},{"country": "Jersey"},{"country": "Jordan"},{"country": "Kazakhstan"},{"country": "Kenya"},{"country": "Kiribati"},{"country": "Kuwait"},{"country": "Kyrgyzstan"},{"country": "Laos"},{"country": "Latvia"},{"country": "Lebanon"},{"country": "Lesotho"},{"country": "Liberia"},{"country": "Libyan Arab Jamahiriya"},{"country": "Liechtenstein"},{"country": "Lithuania"},{"country": "Luxembourg"},{"country": "Macao"},{"country": "North Macedonia"},{"country": "Madagascar"},{"country": "Malawi"},{"country": "Malaysia"},{"country": "Maldives"},{"country": "Mali"},{"country": "Malta"},{"country": "Marshall Islands"},{"country": "Martinique"},{"country": "Mauritania"},{"country": "Mauritius"},{"country": "Mayotte"},{"country": "Mexico"},{"country": "Micronesia, Federated States of"},{"country": "Moldova"},{"country": "Monaco"},{"country": "Mongolia"},{"country": "Montserrat"},{"country": "Montenegro"},{"country": "Morocco"},{"country": "Mozambique"},{"country": "Myanmar"},{"country": "Namibia"},{"country": "Nauru"},{"country": "Nepal"},{"country": "Netherlands"},{"country": "Netherlands Antilles"},{"country": "New Caledonia"},{"country": "New Zealand"},{"country": "Nicaragua"},{"country": "Niger"},{"country": "Nigeria"},{"country": "Niue"},{"country": "Norfolk Island"},{"country": "North Korea"},{"country": "Northern Ireland"},{"country": "Northern Mariana Islands"},{"country": "Norway"},{"country": "Oman"},{"country": "Pakistan"},{"country": "Palau"},{"country": "Palestine"},{"country": "Panama"},{"country": "Papua New Guinea"},{"country": "Paraguay"},{"country": "Peru"},{"country": "Philippines"},{"country": "Pitcairn"},{"country": "Poland"},{"country": "Portugal"},{"country": "Puerto Rico"},{"country": "Qatar"},{"country": "Reunion"},{"country": "Romania"},{"country": "Russian Federation"},{"country": "Rwanda"},{"country": "Saint Helena"},{"country": "Saint Kitts and Nevis"},{"country": "Saint Lucia"},{"country": "Saint Pierre and Miquelon"},{"country": "Saint Vincent and the Grenadines"},{"country": "Samoa"},{"country": "San Marino"},{"country": "Sao Tome and Principe"},{"country": "Saudi Arabia"},{"country": "Scotland"},{"country": "Senegal"},{"country": "Serbia"},{"country": "Seychelles"},{"country": "Sierra Leone"},{"country": "Singapore"},{"country": "Slovakia"},{"country": "Slovenia"},{"country": "Solomon Islands"},{"country": "Somalia"},{"country": "South Africa"},{"country": "South Georgia and the South Sandwich Islands"},{"country": "South Korea"},{"country": "South Sudan"},{"country": "Spain"},{"country": "Sri Lanka"},{"country": "Sudan"},{"country": "Suriname"},{"country": "Svalbard and Jan Mayen"},{"country": "Swaziland"},{"country": "Sweden"},{"country": "Switzerland"},{"country": "Syria"},{"country": "Tajikistan"},{"country": "Tanzania"},{"country": "Thailand"},{"country": "Timor-Leste"},{"country": "Togo"},{"country": "Tokelau"},{"country": "Tonga"},{"country": "Trinidad and Tobago"},{"country": "Tunisia"},{"country": "Turkey"},{"country": "Turkmenistan"},{"country": "Turks and Caicos Islands"},{"country": "Tuvalu"},{"country": "Uganda"},{"country": "Ukraine"},{"country": "United Arab Emirates"},{"country": "United Kingdom"},{"country": "United States"},{"country": "United States Minor Outlying Islands"},{"country": "Uruguay"},{"country": "Uzbekistan"},{"country": "Vanuatu"},{"country": "Venezuela"},{"country": "Vietnam"},{"country": "Virgin Islands, British"},{"country": "Virgin Islands, U.S."},{"country": "Wales"},{"country": "Wallis and Futuna"},{"country": "Western Sahara"},{"country": "Yemen"},{"country": "Zambia"},{"country": "Zimbabwe"}
]
	var optn='';
	for(var i=0;i<ct.length;i++){
		optn+='<option value="'+ct[i].country+'">'+ct[i].country+'</option>';
	}
	$('#country').html(optn);
}











