var request = require('request');
var fs = require('fs');

var base_url = 'https://openpaymentsdata.cms.gov/resource/';

var identifyers={
    2013: 'gekh-hfi8.json',
    2014: 'dm5e-wm2j.json',
    2015: 'sqj3-uhcd.json',
    2016: 'vq63-hu5i.json'
};

var fieldMapping = {
    'Orthopedics': ["Allopathic & Osteopathic Physicians|Orthopaedic Surgery",
        "Allopathic & Osteopathic Physicians|Orthopaedic Surgery|Orthopaedic Surgery of the Spine"],
    'Neurology': ["Allopathic & Osteopathic Physicians|Neurological Surgery"]
};

// var groupByFields = [
//     'recipient_city',
//     'recipient_state',
//     'recipient_zip_code',
//     'date_trunc_ym(date_of_payment)',
//     // // for 2016
//     // // 'indicate_drug_or_biological_or_device_or_medical_supply_1',
//     // 'product_category_or_therapeutic_area_1',
//     // // 'name_of_drug_or_biological_or_device_or_medical_supply_1',
//     // // 'associated_drug_or_biological_ndc_1',
//     // // 'indicate_drug_or_biological_or_device_or_medical_supply_2',
//     // 'product_category_or_therapeutic_area_2',
//     // // 'name_of_drug_or_biological_or_device_or_medical_supply_2',
//     // // 'associated_drug_or_biological_ndc_2',
//     // // 'indicate_drug_or_biological_or_device_or_medical_supply_3',
//     // 'product_category_or_therapeutic_area_3',
//     // // 'name_of_drug_or_biological_or_device_or_medical_supply_3',
//     // // 'associated_drug_or_biological_ndc_3',
//     // // 'indicate_drug_or_biological_or_device_or_medical_supply_4',
//     // 'product_category_or_therapeutic_area_4',
//     // // 'name_of_drug_or_biological_or_device_or_medical_supply_4',
//     // // 'associated_drug_or_biological_ndc_4',
//     // // 'indicate_drug_or_biological_or_device_or_medical_supply_5',
//     // 'product_category_or_therapeutic_area_5',
//     // // 'name_of_drug_or_biological_or_device_or_medical_supply_5',
//     // // 'associated_drug_or_biological_ndc_5',
//     // //
//     // // for 2013 - 2015
//     // 'name_of_associated_covered_device_or_medical_supply1',
//     // 'name_of_associated_covered_device_or_medical_supply2',
//     // 'name_of_associated_covered_device_or_medical_supply3',
//     // 'name_of_associated_covered_device_or_medical_supply4',
//     // 'name_of_associated_covered_device_or_medical_supply5',
//     // 'name_of_associated_covered_drug_or_biological1',
//     // 'name_of_associated_covered_drug_or_biological2',
//     // 'name_of_associated_covered_drug_or_biological3',
//     // 'name_of_associated_covered_drug_or_biological4',
//     // 'name_of_associated_covered_drug_or_biological5',
//     // //
//     'physician_primary_type',
//     'physician_specialty,physician_ownership_indicator',
//     'form_of_payment_or_transfer_of_value,nature_of_payment_or_transfer_of_value',
//     'change_type,applicable_manufacturer_or_applicable_gpo_making_payment_name'
// ];

//"https://openpaymentsdata.cms.gov/resource/dm5e-wm2j.json?$group=physician_specialty,nature_of_payment_or_transfer_of_value&$select=physician_specialty,nature_of_payment_or_transfer_of_value,sum(total_amount_of_payment_usdollars), count(*)&$order=sum(total_amount_of_payment_usdollars) DESC"

var groupByFields = ['physician_specialty', 'nature_of_payment_or_transfer_of_value'];

var aggFields = ['sum(total_amount_of_payment_usdollars), count(*)'];

var orderBy = ['sum(total_amount_of_payment_usdollars) DESC'];

var year = 2013;

// var where = ['applicable_manufacturer_or_applicable_gpo_making_payment_name = \'Genentech, Inc.\''];
// var where = ['name_of_drug_or_biological_or_device_or_medical_supply_1 = \'Rituxan\' OR name_of_drug_or_biological_or_device_or_medical_supply_2 = \'Rituxan\' OR name_of_drug_or_biological_or_device_or_medical_supply_3 = \'Rituxan\' OR name_of_drug_or_biological_or_device_or_medical_supply_4 = \'Rituxan\''];
// var where= ['physician_specialty = \"Allopathic \& Osteopathic Physicians\|Orthopaedic Surgery\"'];


var countReq = `${base_url}${identifyers[year]}?$select=count(*)`;
var count;

var finalURL =`${base_url}${identifyers[year]}?$group=${groupByFields.join(',')}&$select=${groupByFields.join(',')},${aggFields.join(',')}&$order=${orderBy.join(',')}`;
    // &$where=${where.join(' AND ')

console.log(finalURL);

// request(countReq, function (error, response, cnt) {
//     console.log('error:', response.error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     count = JSON.parse(cnt)[0].count;
//     console.log('count:', JSON.parse(cnt)[0].count);
//
//     finalURL = finalURL+`&$limit=${count}`;
//     console.log(finalURL);

    request(finalURL, function (error, response, body) {
        var output = {
            url: finalURL,
            body: JSON.parse(body)
        };
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        fs.writeFileSync(`datafiles/MedicalFieldsByPaymentType${year}.json`, JSON.stringify(output, null, 2));
    });

// });
