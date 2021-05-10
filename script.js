let searchInput = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator_humidity>.value');
let wind = document.querySelector('.weather_indicator_wind>.value');
let pressure = document.querySelector('.weather_indicator_pressure>.value');
let image = document.querySelector('.weather_image');
let temperature = document.querySelector('.weather_temperature>.value');
let forecastBlock = document.querySelector('.weather_forecast');
let suggestions = document.querySelector('#suggestions');
let sound = document.querySelector('.weather_sound');
let body = document.getElementsByTagName('body');
let time = document.querySelector('.weather_time');
let date = document.querySelector('.weather_date');



let weatherAPIKey = 'f386b608929466a293325462670158a0';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;
let cityBaseEndpoint = 'https://api.teleport.org/api/cities/?search=';

let weatherImages = [
    {
        url: 'images/clear-sky.png',
        ids: [800],
        bgUrl: 'images/bg-sun.jpg'
    },
    {
        url: 'images/clouds.png',
        ids: [802,803,804],
        bgUrl: 'images/bg-cloud.jpg'
    },
    {
        url: 'images/few-clouds.png',
        ids: [801],
        bgUrl: 'images/bg-light-cloud.jpg'

    },
    {
        url: 'images/mist.png',
        ids: [701,711,721,731,741,751,761,771,781],
        bgUrl: 'images/bg-mist.jpg'
    },
    {
        url: 'images/rain.png',
        ids: [300,301,302,310,311,312,313,314,321,500,501,502,503,504,520,521,522,531],
        bgUrl: 'images/bg-rainy.jpg'
    },
    {
        url: 'images/snow.png',
        ids: [511,600,601,602,611,612,613,615,616,620,621,622],
        bgUrl: 'images/bg-snow.jpg'
    },
    {
        url: 'images/thunderstorm.png',
        ids: [200,201,202,210,211,212,221,230,231,232],
        bgUrl: 'images/bg-thunder.jpg'
    }
];

let weatherSounds = [
    {
        url: 'sounds/clouds.mp3',
        ids: [802,803,804]
    },
    {
        url: 'sounds/mist.mp3',
        ids: [701,711,721,731,741,751,761,771,781]
    },
    {
        url: 'sounds/sunny.mp3',
        ids: [800,801]
    },
    {
        url: 'sounds/rain.mp3',
        ids: [500,501,502,503,504,520,521,522,531,300,301,302,310,311,312,313,314,321]
    },
    {
        url: 'sounds/snow.mp3',
        ids: [511,600,601,602,611,612,613,615,616,620,621,622]
    },
    {
        url: 'sounds/thunder.mp3',
        ids: [200,201,202,210,211,212,221,230,231,232]
    }
];

let getWeatherByCityName = async (cityString) => {
    let city;
    if(cityString.includes(',')){
        city = cityString.substring(0,cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));
    } else {
        city = cityString;
    }

    let endpoint = weatherBaseEndPoint + '&q=' + city;
    let response = await fetch(endpoint);

    if(response.status !== 200) {
        alert('Not found!');
        return;
    }

    let weather = await response.json();

    return weather;
}

let getForecastByCityId = async (id) => {
    let endpoint = forecastBaseEndpoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();

        if(hours === 12) {
            daily.push(day);
        }
    })
    return daily;
}
let weatherForCity = async (city) => {
    let weather = await getWeatherByCityName(city);

    if(!weather) {
        return;
    }

    updateWeather(weather);
    let cityID = weather.id;
    let forecast = await getForecastByCityId(cityID);
    updateForecast(forecast);
}

let initialize = () => {
    weatherForCity('Belgrade').then(() => document.body.style.filter = 'blur(0)');
}

initialize();

searchInput.addEventListener('keydown', async (e) => {
    if(e.keyCode === 13){
        weatherForCity(searchInput.value);
    }
})

searchInput.addEventListener('input', async () => {
    let endpoint = cityBaseEndpoint + searchInput.value;
    let result  = await (await fetch(endpoint)).json();
    suggestions.innerHTML = ''; //brise iznutra staro
    let cities = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    
    for(i=0;i<length;i++){
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        suggestions.appendChild(option);
    }
})

let updateWeather = (data) => {
    // console.log(data);
    city.textContent = data.name + ', ' + data.sys.country;
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    let windDirection;
    let deg = data.wind.deg;

    if(deg > 45 && deg <= 135){
        windDirection='East';
    }
    else if (deg > 135 && deg <= 225){
        windDirection='South';
    }
    else if (deg > 225 && deg <= 315){
        windDirection='West';
    }
    else{
        windDirection='North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed;

    temperature.textContent = data.main.temp > 0 ? Math.round(data.main.temp) : '-' + Math.round(data.main.temp);
    
    //Current time
    const timeZone = data.timezone; 
    const timeZoneInMinutes = timeZone / 60; //convert to minutes
    const currTime = moment().utcOffset(timeZoneInMinutes).format("h:mm A");
    const currDate = moment().utcOffset(timeZoneInMinutes).format("dddd, MMMM D");

    
    time.textContent = currTime;
    date.textContent = currDate;

    let imgAndSoundID = data.weather[0].id;

    weatherSounds.forEach(obj => {

        if(obj.ids.includes(imgAndSoundID)){
            sound.src = obj.url;
        }
    })

    document.body.style.backgroundSize = "100% 100vh";

    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgAndSoundID)){
            image.src = obj.url;
            $(body).css({opacity:0, backgroundImage:`url(${obj.bgUrl})`}).fadeTo(2000,1.0);
        }
    })
}

let updateForecast = (forecast) => {
    // console.log(forecast);
    forecastBlock.innerHTML = ''; //brisanje svega unutra
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let temperature = day.main.temp > 0 ? Math.round(day.main.temp) : '-' + Math.round(day.main.temp);
        let date = moment(day.dt_txt).format("MMMM D");
        let dayName = moment(day.dt_txt).format("dddd");


        let forecastItem = 
            `<article class="weather_forecast_item">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather_forecast_icon">
                <h3>${dayName}</h3>
                <p class="weather_forecast_date">${date}</p>
                <p class="weather_forecast_temperature"><span class="value">${temperature}</span>&deg; C</p>
            </article>`;
        //html conversion to DOM -> insertAdjacentHTML
        forecastBlock.insertAdjacentHTML('beforeend',forecastItem);
    })
}

