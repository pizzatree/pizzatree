/*  update.js
 *  Uses Google Maps Places API paired with a list of pizza joints
 *  to generate a Place of the Day. Inserts this information into README.md
 *  by modifying README.template.md. Intended to run once a day via GitHub Actions.
 *  Functions are written in call order.
 * 
 *  See it in action!
 *  https://github.com/pizzatree
 */

const fs = require('fs');
const https = require('https');
const download = require('download');

const key = process.env.API_KEY;

let newData = [ restName = '', address = '']

function decidePlace()
{
    fs.readFile('PizzaJoints', 'utf-8', (err, data) =>
    {
        if (err)
            throw err;

        let dataArray = data.split('\n');

        let place = dataArray[getRndInteger(0, dataArray.length - 1)];
        findPlaceID(place);
    });
}

function findPlaceID(name)
{
    let placesLookupURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?';
    let url = placesLookupURL + 'query=' + name + '&key=' + key;

    https.get(url, res =>
    {
        res.setEncoding('utf8');

        let info = '';
        res.on('data', (data) => info += data);

        res.on('end', () =>
        {
            info = JSON.parse(info);
            getDetails(info.results[0]['place_id']);
        })
    })
}

function getDetails(place_id)
{
    let detailsURL = 'https://maps.googleapis.com/maps/api/place/details/json?'
    let url = detailsURL + 'place_id=' + place_id + '&key=' + key;

    https.get(url, res =>
    {
        res.setEncoding('utf8');

        let info = '';
        res.on('data', (data) => info += data);

        res.on('end', () =>
        {
            let results = JSON.parse(info).result;

            let restaurantName = results['name'];
            let address = results['formatted_address'];
            let hours = results['opening_hours']['weekday_text'];
            let photos = results['photos'];

            newData.restName = restaurantName;
            newData.address = address;

            let photoNum = getRndInteger(0, photos.length);
            let photoReference = photos[photoNum]['photo_reference'];
            getPicture(photoReference);
        })
    })
}

function getPicture(photo_reference)
{
    let photoLookupURL = 'https://maps.googleapis.com/maps/api/place/photo?';
    let maxheight = 300;
    let maxwidth = 600;
    let url = photoLookupURL + 'maxheight=' + maxheight + '&maxwidth=' + maxwidth + '&photo_reference=' + photo_reference + '&key=' + key;

    download(url).pipe(fs.createWriteStream('./pizza.jpg'));

    writeREADME();
}

function writeREADME()
{
    fs.readFile('README.template.md', 'utf-8', (err, data) =>
    {
        if (err)
            throw err;

        const updatedTemplate = data.replace
        (
            '[ REPLACE ME ]',
            newData.restName + '  \n' + newData.address + '  \n'
        );

        fs.writeFile('README.md', updatedTemplate, 'utf-8', (err) =>
        {
            if (err)
                throw err;

            console.log('README update complete.');
        });
    });
}

// From https://www.w3schools.com/JS/js_random.asp
function getRndInteger(min, max)
{
    return Math.floor(Math.random() * (max - min) ) + min;
}

decidePlace();