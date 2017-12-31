var fs = require('fs');
var _= require('lodash');

// var 2013, d2014, d2015, d2016;
var final_data = [];
// var year = 2016;
// function createReduced(){
    for (let i = 2013; i <= 2016; i++){
        console.log(i);
        let curData = JSON.parse(fs.readFileSync(`datafiles/MedicalFieldsByPaymentType${i}.json`)).body;
        curData.forEach(function(d){ d.year = i; });

        final_data = final_data.concat(curData);
    }

    let reduced = final_data.reduce((accumulator, currentValue) => {
            let specialty = currentValue.physician_specialty;
            let year = currentValue.year;
            let cnt = +currentValue.count;
            let sum = +currentValue.sum_total_amount_of_payment_usdollars;

            let s = accumulator[specialty] = (accumulator[specialty] || {});
            s.specialty = (specialty) ? specialty: 'undefined';
            s.specialty_clean = (specialty) ? specialty.replace('Allopathic & Osteopathic Physicians|', '').replace('Internal Medicine|', '') : 'undefined';
            s.years = s.years || {};
            let y = s.years[year] = (s.years[year] || {});

            y.totalCount = (y.totalCount || 0) + cnt;
            y.totalAmount = (y.totalAmount || 0) + sum;

            s.totalCount = (s.totalCount || 0) + cnt;
            s.totalAmount = (s.totalAmount || 0) + sum;
            // s.year = year;

            let paymentTypes = y.paymentTypes = (y.paymentTypes || []);
            paymentTypes.push({
                "paymentType": currentValue.nature_of_payment_or_transfer_of_value,
                "count": cnt,
                "amount": sum,
                "year": year
            });

            accumulator["grandTotal"] = accumulator["grandTotal"] || {};
            accumulator["grandTotal"].specialty = 'Grand Total';
            accumulator["grandTotal"].totalCount = (accumulator["grandTotal"].totalCount || 0) + cnt;
            accumulator["grandTotal"].totalAmount = (accumulator["grandTotal"].totalAmount || 0) + sum;

            accumulator["grandTotal"].years = accumulator["grandTotal"].years || {};
            accumulator["grandTotal"].years[year] = (accumulator["grandTotal"][year] || {});
            accumulator["grandTotal"].years[year].totalCount = (accumulator["grandTotal"].years[year].totalCount || 0) + cnt;
            accumulator["grandTotal"].years[year].totalAmount = (accumulator["grandTotal"].years[year].totalAmount || 0) + sum;


            return accumulator;
            }, {});

    reduced = _.sortBy(reduced, function(d){
        // d.paymentTypes = _.sortBy(d.paymentTypes, function (i){
        //     return -i.amount;
        // });
        return -d.totalAmount;
    });

    // return reduced;
// }

// console.log(JSON.stringify(bySpecialty, null, 2));
fs.writeFileSync(`AGGDataComplete.json`, JSON.stringify(reduced, null, 2));