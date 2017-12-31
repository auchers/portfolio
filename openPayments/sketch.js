/*OPTIONS:
    1. overlaying all years (in different additive colors
    2. have menu/aggretated bars that will highlight specialty and amount on hover
    3. pop open re-representation of data (bar/line chart)
    4. sort by proportions of different arms
    5. adding movement/interactivity
    6. add link to drilldown on data
*/

var yearColorMapping = {
    "2013":"rgba(27, 158, 119, .3)",
    "2014":"rgba(217, 95, 2, .3)",
    "2015":"rgba(117, 112, 179, .3)",
    "2016":"rgba(231, 41, 138, .3)"
},
    years = Object.keys(yearColorMapping);

var identifyers={
    2013: 'gekh-hfi8.json',
    2014: 'dm5e-wm2j.json',
    2015: 'sqj3-uhcd.json',
    2016: 'vq63-hu5i.json'
};
var base_url = 'https://openpaymentsdata.cms.gov/resource/';
var orderBy = ['total_amount_of_payment_usdollars DESC'];

// let data2013, data2014, data2015, data2016;

let data, maxRadius, minRadius,
    amountsArray = [];

let paymentTypesMapping = {},
    ptkeys;

let colors = d3.select('.colorKey')
    .selectAll('div')
    .data(years)
    .enter()
    .append('div')
    .attr('class', function(d) { return d + ' colors'; })
    .style('background-color', function(d){ return yearColorMapping[d];})
    .text(function(d){ return d })
    .on('mouseover', function(d){
        d3.selectAll('path')
            .style('opacity', 0);

        d3.selectAll('path.d'+d)
            .style('opacity', 1);
    })
    .on('mouseout', function(){
        d3.selectAll('path')
            .style('opacity', 1);
    });

// for (y in yearColorMapping){
    d3.json(`data/assets/AGGDataComplete.json`, function(err, dat){
        // let file = 'data'+y;
        data = dat.filter(function(d){ return !(d.specialty === 'Grand Total' || d.specialty === 'undefined'); });
        console.log(data);

        displayRadar();
        // displayReferenceCircle(window[file]);
    });
// }

function displayRadar(){
    // Radius
    maxRadius = 130;
    minRadius = 10;
    let datapointSize = 2;

    // get points [] for each specialty
    getPointCoords();

    // console.log(data);

    // draw svg per radar
    let divs = d3.select('#container')
        .selectAll('div')
        .data(data)
        .enter()
        .append('div')
        .attr('class', function(d) { return d.specialty + ' plot col-xl-3 col-l-4 col-m-6 col-sm-6'; });

    // create header
    divs.html(function(d){ return d.specialty_clean + '<br>' + formatNumbers(d.totalAmount); });

    // create svgs
    let svgs = divs.append('svg')
        .attr('class', function(d) { return d.specialty + ' specialties'; });

    let width = d3.select('svg').node().getBoundingClientRect().width;
    let height = d3.select('svg').node().getBoundingClientRect().height;

    // Draw path through points
    let lineGenerator = d3.line()
        .x(function(d){ return d.point[0]})
        .y(function(d){ return d.point[1]})
        .curve(d3.curveCardinalClosed);

    let g = svgs.selectAll('g')
        .data(function(d){
            let datArray = [];
            for (y in d.years){
                datArray.push(d.years[y]);
            }
            return datArray;
        })
        .enter()
        .append('g')
        .attr('class', function(d){ return (d.paymentTypes)? d.paymentTypes[0].year : null; })
        .attr('transform', `translate(${width/2}, ${maxRadius + 5})`);

    g.append('path')
        .datum(function(d){ return d.paymentTypes; })
        .attr('d', lineGenerator)
        .attr('class', function(d){ return 'd'+d[0].year; })
        .style('fill', function(d){return yearColorMapping[d[0].year];});

    // Draw large background circles at r, r/3, 2r/3
    svgs.append('circle')
        .attr('transform', `translate(${width/2}, ${maxRadius + 5})`)
        .attr('class', 'playingField')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', function(d){ return rFromArea(d.pScale.range()[1])});

    // Draw small circles at points
    g.selectAll('.datapoints') // todo change to only select year specific points
        .data(function(d){ return d.paymentTypes; })
        .enter()
        .append('circle')
        .attr('class', 'datapoints')
        .attr('cx', function(d){ return d.point[0]})
        .attr('cy', function(d){ return d.point[1]})
        .attr('r', datapointSize)
        .on('mouseover', function(d){
          let parent = d3.select(this.parentNode);
          parent.append('text')
              .attr('class', 'hoverText')
              .text(function(){ return `${d.paymentType}: ${formatNumbers(d.amount)}`})
              .attr('x', d3.mouse(this)[0])
              .attr('y', d3.mouse(this)[1]);
        })
        .on('mouseout', function(d){
            d3.selectAll('.hoverText').remove();
        })
        .on('dblclick', function(d) {seeSampleData(d)});
}

function displayReferenceCircle(data){

    let refDiv = d3.select('.reference')
        .insert('div')
        .attr('class', 'example');

    let refwidth = d3.select('.reference').node().getBoundingClientRect().width;
    let refheight = d3.select('.reference').node().getBoundingClientRect().height;

    let refRadius = refheight * .4;

        refDiv.selectAll('.label')
        .data(ptkeys)
        .enter()
        .append('div')
        .attr('class', 'label')
        .style('text-anchor', function(d){
            if (paymentTypesMapping[d] < Math.PI/2 || paymentTypesMapping[d] > 3* Math.PI/2)
            return 'start';
            else return 'end';
        })
        .style('left', function(d){ return refRadius * Math.cos(paymentTypesMapping[d])})
        .style('top', function(d){ return refRadius * Math.sin(paymentTypesMapping[d])})
        .text(function(d){ return d; });


}

function getPointCoords(){
    // initialize amounts array to find extrema
    // let amountsArray = [];

    // get the unique list of paymentTypes and turn them into an object {paymentType: angle}
    // paymentTypesMapping = {};
    // go through each paymentType and (a) make sure it exists in mapping object, (b) push amount to array,
    // (c) sort by paymentType alphabetically
    data.forEach(function(d) {
        for (y in d["years"]){
            d["years"][y].paymentTypes = _.sortBy(d["years"][y].paymentTypes, function(p) {
                paymentTypesMapping[p.paymentType] = 0;
                amountsArray.push(p.amount);
                return p.paymentType;
            });
        };
    });

    // full circle divided by number of payment types -- start by getting the number of payment types
    ptkeys = Object.keys(paymentTypesMapping).sort();
    let angleSize = (Math.PI * 2) / ptkeys.length;

    // add respective angle as value in mapping object
    for (p in ptkeys) {
        paymentTypesMapping[ptkeys[p]] = angleSize * p;
    }

    console.log('paymentTypesMapping', paymentTypesMapping);
    displayPaymentKey();
    // get max over all data amounts
    let globalAmountMax = d3.max(amountsArray);
    console.log('globalAmountMax', globalAmountMax);

    // make scale for the outermost circle size
    let rScale = d3.scaleLinear()
        .domain([0.1, globalAmountMax])
        .range([areaFromR(minRadius), areaFromR(maxRadius)]);

    // go though each data group and fill in the point coordinate values
    data.forEach(function(d, i){
        let maxArray = [];

        for (const [key, value] of Object.entries(d.years)) {
            // console.log(`${key} ${value.paymentTypes[0].amount}`);
            maxArray = maxArray.concat(value.paymentTypes.map(function(p){ return p.amount; }))
        }
        // console.log(maxArray);

        let amountMax = d3.max(maxArray);
            // Radius Scale
            d.pScale = d3.scaleLinear()
                .domain([0.1, amountMax])
                .range([0, rScale(amountMax)]);

        for (y in d["years"]) {
            // fill in points array
            d["years"][y].paymentTypes.map(function(p, i){
                // get angle related to that paymentType
                let curAngle = paymentTypesMapping[p.paymentType];
                // points are coordinates relative to the center at (0,0)
                p.point = [rFromArea(d.pScale(p.amount)) * Math.cos(curAngle), rFromArea(d.pScale(p.amount)) * Math.sin(curAngle)];
            });
        };
    });
}

function displayPaymentKey(){
    // d3.select('.paymentTypeKey')

}

function seeSampleData(d){
    //openpaymentsdata.cms.gov/resource/vq63-hu5i.json?physician_specialty=Allopathic & Osteopathic Physicians|Orthopaedic Surgery&nature_of_payment_or_transfer_of_value=Travel and Lodging
    console.log(d3.select(this.getSVGElement));

    console.log(d.year, d.specialty);
    let finalURL =`${base_url}${identifyers[d.year]}?nature_of_payment_or_transfer_of_value=${d.paymentType}&$order=${orderBy.join(',')}`;
    console.log(finalURL);
    window.open(finalURL, '_blank');
}

function rFromArea(a){
    return Math.sqrt(a/Math.PI);
}

function areaFromR(r){
    return Math.PI * Math.pow(r,2);
}

function formatNumbers(n){
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return formatter.format(n);
}

window.addEventListener("resize", displayRadar());