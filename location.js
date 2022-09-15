const DEFAULT_CURRENT_LOCATION_TIMEOUT = 10000;
const CURRENT_LOCATION_TIMEOUT = 60000;
const MAPBOX_API_TOKEN = "pk.eyJ1Ijoic3B1dG5pay1idW50cGxhbmV0IiwiYSI6ImNqcnVlc2JsYzByMnMzeXRjdzd1bXFlYTAifQ.n2S5gMsjFAOfJ5EAsBvFng";
//Randers, Central Denmark, Denmark
//56.460449	10.036367

const promiseTimeout = (ms, promise) => {
	let timeout = new Promise((resolve, reject) => {
		let id = setTimeout(() => {
			clearTimeout(id);
			reject(`Rejected  ms ${ms}`);
		}, ms);
	});

	return Promise.race([promise, timeout]);
};

const getCurrentPosition = () => {
	const elOriginId = document.querySelector("#originId");
	const elLat = document.querySelector("#latitudeId");
	const elLng = document.querySelector("#longitudeId");

	let positionPromise = promiseTimeout(DEFAULT_CURRENT_LOCATION_TIMEOUT, getPosition());
	positionPromise
		.then((position) => {
			elOriginId.innerHTML = "<strong>Location obtained via IP/WIFI<strong>";
			elLat.innerHTML = `Lat:  ${position.coords.latitude}`;
			elLng.innerHTML = `Lng:  ${position.coords.longitude}`;

			reverseGeocoding(position.coords.longitude, position.coords.latitude);
		})
		.catch((error) => {
			elOriginId.innerHTML = "<strong>Request to obtain location from the system denied. Using the defined default location<strong>";
			elLat.innerHTML = `Lat:  ${DEFAULT_LAT_LOCATION}`;
			elLng.innerHTML = `Lng:  ${DEFAULT_LNG_LOCATION}`;

			reverseGeocoding(DEFAULT_LNG_LOCATION, DEFAULT_LAT_LOCATION);

			console.error(error.message);
		})
		.finally((data) => {});
};

const getPosition = () => {
	let options = {
		enableHighAccuracy: true,
		timeout: 60000,
		maximumAge: 0
	};
	return new Promise(function (resolve, reject) {
		navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
};

const reverseGeocoding = (longitude, latitude) => {
	reverseExternalGeocoding(longitude, latitude, "en")
		.then((data) => {
			data
				.json()
				.then((json) => {
					const elAddress = document.querySelector("#addressId");
					elAddress.innerHTML = `Your Address is: ${json.features[0].place_name}`;
				})
				.catch((e) => console.error(e));
		})
		.catch((e) => console.error(e));
};

const reverseExternalGeocoding = (lng, lat, lang) => {
	let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_TOKEN}&language=${lang}`;
	return fetch(url, { mode: "cors" });
};
