/**
 * MyApp
 * 
 * This is a simple Node.js application which connects to and saves data to IBM Cloud Object Storage.
 * 
 * In order to execute this code succesfully you will need valid IBM Cloud Object Storage service credentials. For
 * obtaining the credentials please see https://console.bluemix.net/docs/services/cloud-object-storage/iam/service-credentials.html#service-credentials
 * 
 * Update the variables in the 'config' object defined on line #24 below to match the service credentials created.
 * <endpoint> - The endpoint for the IBM Cloud Object Storage service
 * <api-key> - The API Key given in the COS service credentials
 * <resource-instance-id> - The Resource Instance ID given in the COS service credentials
 * <bucket-name> - The name of the bucket to insert a record into
 * 
 * Update the 'bucketName' variab
 * 
 * 
 * @author David A. Lentz (dlentz@us.ibm.com)
 * (c)2019 IBM Corp.
 *  IBM INTERNAL USE ONLY
 * 
 */
global.IBMCOS = require('ibm-cos-sdk');

var config = {
  endpoint: '<endpoint>',
  apiKeyId: '<api-key>',
  ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
  serviceInstanceId: '<resource-instance-id>',
  bucketName: '<bucket-name>'
};

function getBuckets() {
  console.log('Available buckets');
  return cos.listBuckets()
  .promise()
  .then((data) => {
      if (data.Buckets != null) {
          for (var i = 0; i < data.Buckets.length; i++) {
              console.log(`Bucket Name: ${data.Buckets[i].Name}`);
          }
      }
  })
  .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
  });
}


function createTextFile() {
  var itemName   = 'Sample Item' ;
  var fileText   = 'This is the text of a file' ;

  console.log(`Creating new item: ${itemName}`);
  return cos.putObject({
      Bucket: config.bucketName, 
      Key: itemName, 
      Body: fileText
  }).promise()
  .then(() => {
      console.log(`Item: ${itemName} created!`);
  })
  .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
  });
}

console.log('Connecting to IBM Cloud Object Storage');
var cos = new IBMCOS.S3(config);

getBuckets().then(createTextFile) ;
