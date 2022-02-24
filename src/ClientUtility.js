/**
 *  FileName : index.js 
 *  purpose :  Fetch look up information about items using their item ID, often in large batches.
 *  Created By : Santosh B Latpate
 *  Created On : 02/20/2022
 *  Test Data : Test Data in TestData file which contain 2 files inputIds.txt , uniqueInputIds.txt
 *  Last Modifed By : Santosh B Latpate
 *  Last Modifed Date : 02/24/2022
 * 
 * */


// Declarations of constant values
const apiCallTimer = 1000;
const baseURL='https://challenges.qluv.io';
const testDataBaseLocation = '../TestData';
const testDataFileFormat = 'utf8'
const maxRequestLimit = 5;
const recordmap = new Map();

// Used needle module for API call
var needle = require('needle');

// Varible Declaration for the processing
var count = 0;
var requestCount = 0;
var successRequestCount = 0;
var failRequestCount = 0;
var responseStarted = false;
var ids = [ 'cRF2dvDZQsmu37WGgK6MTcL7XjH'];   // Default one value in the id list

// using fs to get data from txt file for bulk request check
var fs = require('fs');

try{
// Taking data from file and add that in collection
//fs.readFile(testDataBaseLocation+'/uniquInputIds.txt', testDataFileFormat, function(err, data) {    // For unique data testing
    fs.readFile(testDataBaseLocation+'/inputIds.txt', testDataFileFormat, function(err, data) {       // For duplicate data testing
        if (err) throw err;
        ids = data.toString().split(/\r?\n/)
    });
}
catch(e){
    console.log("Exception occurses : ",e);
}


if(ids.length > 0) {
    // First 5 simultaneous requests
    for(var i = 0; i < maxRequestLimit; i++){
        var id = ids[0];
        if(!recordmap.has(id)){  // Duplicate check
            recordmap.set(id);
            var recordIndex = ids.indexOf(id);//get record index for the processing record

            //remove prcessed record from the list
            ids.splice(recordIndex, 1);
            count++;
            requestCount++;
    
            // Call API when all the condition full fill
            callGetApi(id);

            if(ids.length==0){    // Check for input
                if(responseStarted){   // processing summary print 
                    printSummary();
                }else
                    responseStarted = true;
      
                // break the timer once all the record finish
                break;   
            }else{
                if(i > 0)
                    i--;
            }
        }
    }


    // Interval to check response count and do next API call 
    var interval = setInterval(() => {
        var id;
        if(ids.length==0){   // Check for input
            if(responseStarted){  // processing summary print 
                printSummary();
            }
            else
                responseStarted = true;
    
            // break the timer once all the record finish
            clearInterval(interval);
        }else 
            id=ids[0];    // Taking first id for processing

    
        var recordIndex = ids.indexOf(id);  //get index of the prcessed record

        //remove proccessed record from the list
        ids.splice(recordIndex, 1);
        if(count < 5 && id != null){
            if(!recordmap.has(id)){
                recordmap.set(id);
                count++;
                requestCount++; 
                callGetApi(id);
            }
        }
    }, apiCallTimer);
}

// Header for the request -- converting Id into base64 format for Authorization tocken
function getHeader(id){
    return options = {
        headers: { 'Authorization':  Buffer.from(id).toString('base64')}
    }
}

// Call Get API to get the lookup records from the server
function callGetApi(id){
    try {
        needle.get( baseURL+'/items/'+id, getHeader(id), function(error, response) {
            count--;
            if (!error && response.statusCode == 200){
                successRequestCount++;
                console.log('Response  %d : ',successRequestCount,response.body);
            }else{
                failRequestCount++;
                console.log('error ',response);
            }
        });
    }
    catch(e){
        console.log("Exception occurses : ",e);
    }  
}

// Summary of processing the API calles and responses
function printSummary(){
    console.log('---------- Processing Summary Till now ------------- ');
    console.log(' Total API calles count : ',requestCount);
    console.log(' Total success response count : ',successRequestCount);
    console.log(' Total unsuncess response count : ' , failRequestCount);
}

