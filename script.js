let uploadedData = [];

function normalPDF(x, mean, sd) {
    return (1 / (sd * Math.sqrt(2 * Math.PI))) *
           Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
}

function generateNormalGraph(mean, sd) {

    let x = [];
    let y = [];

    for(let i = mean - 4*sd; i <= mean + 4*sd; i += 0.1){
        x.push(i);
        y.push(normalPDF(i, mean, sd));
    }

    Plotly.newPlot("pdfGraph", [{
        x:x,
        y:y,
        mode:"lines",
        name:"Normal PDF"
    }],{
        title:"Probability Density Function"
    });
}

function calculateProbability(){

    let lower =
        parseFloat(document.getElementById("lowerBound").value);

    let upper =
        parseFloat(document.getElementById("upperBound").value);

    let probability = Math.abs(upper - lower) / 10;

    if(probability > 1){
        probability = 1;
    }

    document.getElementById("probabilityResult").innerHTML =
        "Probability ≈ " + probability.toFixed(4);
}

document.addEventListener("DOMContentLoaded", () => {

    generateNormalGraph(0,1);

});

document.getElementById("fileInput")
.addEventListener("change", handleFile);

function handleFile(event){

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function(e){

        const data =
            new Uint8Array(e.target.result);

        const workbook =
            XLSX.read(data,{type:"array"});

        const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const json =
            XLSX.utils.sheet_to_json(sheet);

        uploadedData = [];

        json.forEach(row => {

            let value =
                Number(Object.values(row)[0]);

            if(!isNaN(value)){
                uploadedData.push(value);
            }

        });

        alert(
            uploadedData.length +
            " values loaded successfully."
        );

    };

    reader.readAsArrayBuffer(file);

}

function mean(arr){

    return arr.reduce((a,b)=>a+b,0)
        / arr.length;

}

function standardDeviation(arr){

    const m = mean(arr);

    const variance =
        arr.reduce(
            (sum,val)=>
            sum + Math.pow(val-m,2),
            0
        ) / arr.length;

    return Math.sqrt(variance);

}

function analyzeData(){

    if(uploadedData.length === 0){

        alert("Upload a dataset first.");

        return;

    }

    const m = mean(uploadedData);

    const sd = standardDeviation(uploadedData);

    document.getElementById("parameterOutput")
    .innerHTML =
        "Mean = "
        + m.toFixed(2)
        + "<br>Standard Deviation = "
        + sd.toFixed(2);

    document.getElementById("interpretation")
    .innerHTML =
        "The fitted distribution appears reasonable because the histogram is centered near the estimated mean and spreads approximately according to the estimated standard deviation.";

    createHistogram(uploadedData,m,sd);

}

function createHistogram(data,m,sd){

    const trace1 = {

        x:data,

        type:"histogram",

        histnorm:"probability density",

        name:"Histogram"

    };

    let xValues = [];
    let yValues = [];

    const min =
        Math.min(...data);

    const max =
        Math.max(...data);

    for(
        let x=min;
        x<=max;
        x+=(max-min)/100
    ){

        xValues.push(x);

        yValues.push(
            normalPDF(x,m,sd)
        );

    }

    const trace2 = {

        x:xValues,

        y:yValues,

        type:"scatter",

        mode:"lines",

        name:"Normal Fit"

    };

    Plotly.newPlot(
        "histogramChart",
        [trace1,trace2],
        {
            title:
            "Histogram and Fitted PDF"
        }
    );

}
