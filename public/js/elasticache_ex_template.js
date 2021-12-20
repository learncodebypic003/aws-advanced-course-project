/// <reference types="aws-sdk" />
// import AWS from 'aws-sdk';

var notpassed_color_bg = "rgb(88, 124, 171)";
var passed_color_bg = "#22a2b8";
var notpassed_toolong_color_bg = "rgb(191, 62, 92)";
var color_bg_default = "rgb(36, 48, 64)";
var rows_per_page = 500;
var processed_time_total = 0;
var cached_checker = new Set();
const hostname = "${BACKEND_HOST_URL}";

$(document).ready(() => {
  console.log("sqs_lambda_tempalte.js loaded");
  setUpDefault();
  setupEvent();
  clearData();
});

async function clearData() {
}

function setUpDefault() {
  $('#backendUrlId').val('http://ec2-3-94-53-228.compute-1.amazonaws.com:8080')
  $('#empNameId').val('George');
  $('#mgrNameId').val('Oscar');
  
  // $('#sqsQueueUrlId').val('https://sqs.us-east-1.amazonaws.com/344458213649/sqs-asg-001')
}

function setupEvent(){
  
  $('#getEmpInfoId').click({"input1": "value1"}, getEmpInfo);
  $('#cleanAllCacheId').click({"input1": "value1"}, cleanAllCache);
  $('#clearListId').click({"input1": "value1"}, clearList);
  $('#simulation01Id').click({"input1": "value1"}, simulation01);

}

async function simulation01(){
  console.log("simulation01() called");
  $('#simulation01Id').prop('disabled', true);
  $("#simulation01Id").html(`Simluation`);
  $("#simulation01Id").css("background-color", color_bg_default); 
  processed_time_total = 0;
  cached_checker = new Set();
  await cleanAllCacheHelper();
  await simulation01Helper();  
  $('#simulation01Id').prop('disabled', false);
}

async function getEmpInfo(){
  console.log("getEmpInfo() called");
  $('#getEmpInfoId').prop('disabled', true);
  $("#getEmpInfoId").html(`Get Employee Information by Two Names`);
  const res = await getEmpInfoHelper();
  $('#getEmpInfoId').prop('disabled', false);
  $("#getEmpInfoId").html(`Get Employee Information by Two Names(${res.processed_time})s`);
}

async function clearList(){
  console.log("clearList() called");
  $('#clearList').prop('disabled', true);
  await cleanCacheHelper();
  $('#clearList').prop('disabled', false);
}

async function cleanAllCache(){
  console.log("cleanAllCache() called");
  $('#cleanAllCacheId').prop('disabled', true);
  await cleanAllCacheHelper();
  $('#cleanAllCacheId').prop('disabled', false);
}

function simulation01Helper() {

  return new Promise(async (resolve, reject) => {
    console.log("simulation01Helper() called");
    let namesList = getTestNamesList();

    for (var i = 0; i < namesList.length; i++) {
      let names = namesList[i];
      let result = await get_employee_api(names.empName, names.mgrName);
      if (result.is_cached_wrong) {
        $("#simulation01Id").html(`Simluation (New request is cached by mistake) [empName,mgrName]=[${names.empName},${names.mgrName}]`);
        $("#simulation01Id").css("background-color", notpassed_toolong_color_bg);  
        resolve();
        return;      
      }else {
        processed_time_total += result.res.processed_time;
        if (processed_time_total > 20) {
          $("#simulation01Id").html(`Simluation(${processed_time_total.toPrecision(3)}s)(Already take too much time)`);  
          $("#simulation01Id").css("background-color", notpassed_toolong_color_bg);  
          resolve();
          return;
        }else {
          $("#simulation01Id").html(`Simluation(${processed_time_total.toPrecision(3)}s)`);  
        }
      }
    }

    $("#simulation01Id").html(`Simluation(${processed_time_total.toPrecision(3)}s)(PASSED)`);  
    $("#simulation01Id").css("background-color", passed_color_bg);  

    resolve();

  })   

}

function get_employee_api(empName, mgrName) {
  return new Promise(async (resolve, reject) => {

    var url_get_employee = `${hostname}/api/elasticache/get_employee?empName=${empName}&mgrName=${mgrName}`;
    console.log("url_get_employee_2: " , url_get_employee);

    $.ajax({
      url: url_get_employee,
      type: "GET",
      success: function (res) {
        console.log("get_employee_api - res: " , res);   
        console.log("get_employee_api - is_cached: " , cached_checker.has(get_key(empName, mgrName)));   
        let is_cached_wrong = false;
        if (cached_checker.has(get_key(empName, mgrName)) === false) {
          if (res.processed_time < 1) {
            console.log("wrong cache detected.");
            is_cached_wrong = true;
          }
        }
        cached_checker.add(get_key(empName, mgrName));
        
        appendEmployeeRows(res.result);     
        resolve({"res": res, "is_cached_wrong": is_cached_wrong});
      },
    });
  })
}

function get_key(empName, mgrName) {
  return "empName:" + empName + ";"  + "mgrName:" + mgrName; 
}

function getTestNamesList() {
  var namesList = [];
  namesList.push({empName: 'George',mgrName: 'Oscar'});
  namesList.push({empName: 'Go',mgrName: 's'});
  namesList.push({empName: 'G',mgrName: 'os'});
  namesList.push({empName: 'George',mgrName: 'Oscar'});
  namesList.push({empName: 'Tom',mgrName: 'Oscar'});
  namesList.push({empName: 'Kerry',mgrName: 'Oscar'});
  namesList.push({empName: 'Tom',mgrName: 'Oscar'});
  namesList.push({empName: 'Kerry',mgrName: 'Oscar'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Kerry',mgrName: 'Karsten'});
  namesList.push({empName: 'Sam',mgrName: 'Oscar'});
  namesList.push({empName: 'George',mgrName: 'Oscar'});
  return namesList;
}

function getEmpInfoHelper() {

  return new Promise(async (resolve, reject) => {
    console.log("getEmpInfoHelper() called");
    let empName = $('#empNameId').val();
    let mgrName = $('#mgrNameId').val();
  
    var url_get_employee = `${hostname}/api/elasticache/get_employee?empName=${empName}&mgrName=${mgrName}`;
    console.log("url_get_employee: " , url_get_employee);
  
    $.ajax({
      url: url_get_employee,
      type: "GET",
      success: function (res) {
        console.log("url_get_employee - res: " , res);   
        appendEmployeeRows(res.result);     
        resolve(res);
      },
    });
  })   

}

function cleanAllCacheHelper() {

  return new Promise(async (resolve, reject) => {
    console.log("cleanAllCacheHelper() called");
  
    var url_elasticache_cleanall = `${hostname}/api/elasticache/cleanall`;
    console.log("url_elasticache_cleanall: " , url_elasticache_cleanall);
  
    $.ajax({
      url: url_elasticache_cleanall,
      type: "GET",
      success: function (res) {
        console.log("url_elasticache_cleanall - res: " , res);    
        resolve();
      },
    });
  })   

}

function cleanCacheHelper() {

  return new Promise(async (resolve, reject) => {
    $("#empListId").html("");
    resolve();
  })   

}



function list_employee_helper(is_cache) {

  return new Promise(async (resolve, reject) => {
    console.log("list_employee_helper() called");
    
    var url_elasticache_list_employee;
    if (is_cache) {
      url_elasticache_list_employee = `${hostname}/api/elasticache/list_employee_cached`;
    }else {
      url_elasticache_list_employee = `${hostname}/api/elasticache/list_employee`;
    }
    
    console.log("url_elasticache_list_employee: " , url_elasticache_list_employee);
  
    $.ajax({
      url: url_elasticache_list_employee,
      type: "GET",
      success: function (res) {
        console.log("url_elasticache_list_employee - res: " , res);
        appendEmployeeRows(res.result);
        resolve(res);
      },
    });
  })   

}

function appendEmployeeRows(emp_list) {
  $("#empListId").html("");
  var rows_min = Math.min(rows_per_page, emp_list.length);
  for (var i = 0; i < rows_min ;i++) {
    const emp = emp_list[i];
    $("#empListId").append(getEmployeeRowView(emp.emp_no, emp.first_name, emp.last_name, emp.dept_name, emp.mgr_first_name, emp.mgr_last_name));
  }
} 

function getEmployeeRowView(emp_no, first_name, last_name, dept_name, mgr_first_name, mgr_last_name) {
  return  `
          <tr id="${emp_no}">
          <td>${emp_no}</td>
          <td>${first_name} ${last_name}</td>
          <td>${dept_name}</td>
          <td>${mgr_first_name} ${mgr_last_name}</td>
          </tr>
          `
}