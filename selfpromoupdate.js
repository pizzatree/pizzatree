/*  selfpromoupdate.js
 *  Shameless self promotion.
 *
 *  See it in action!
 *  https://github.com/pizzatree
 */

const fs = require('fs');
const download = require('download');
const JSJoda = require('js-joda');

function updateReadme()
{
    getPicture();

    fs.readFile('README.md', 'utf-8', (err, data) =>
    {
        if (err)
            throw err;

        const updatedTemplate = data.replace
        (
            '[ PROMO ]',
            `${daysUntilRelease()} days until CatNab is out on Steam!`
        );

        fs.writeFile('README.md', updatedTemplate, 'utf-8', (err) =>
        {
            if (err)
                throw err;

            console.log('Self Promo README update complete.');
        });
    });
}

function daysUntilRelease()
{
    const today = JSJoda.LocalDate.now();
    const target = JSJoda.LocalDate.of(2022, 3, 14);

    return JSJoda.ChronoUnit.DAYS.between(today, target);
}

function getPicture()
{
    let url = 'https://cdn.akamai.steamstatic.com/steam/apps/1881800/header.jpg';
    download(url).pipe(fs.createWriteStream('./catnab_header.jpg'));
}

updateReadme();