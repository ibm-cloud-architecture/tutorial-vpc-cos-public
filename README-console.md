# Integrating App deployed within VPC to COS using private network

### Purpose
This scenario illustrates how an application deployed in VPC can use IBM Cloud Object Storage. This scenario uses the [IBM Cloud Console](https://cloud.ibm.com) for interacting with the IBM Cloud. 

The example shown in this scenario includes a Node.js application *(MyCOS)* which saves records to an IBM Cloud Object Storage bucket.

After completing the scenario you will be able to:
- Create Virtual Private Clouds using the IBM Cloud console
- Create linux Virtual Servers in a Virtual Private Cloud
- Connect to and execute commands in a linux Virtual Server
- Provision an IBM Cloud Object Storage service using the IBM Cloud console
- Save data into a Cloud Object Storage bucket

#### The MyCOS sample application
This scenario includes a small Node.js application called MyCOS. This Node.js application saves data into IBM Cloud Object Storage.

The MyCOS application will perform the following actions:
1. Connect to IBM Cloud Object Storage
2. List the buckets that are in the COS
3. Create a new record in COS

MyCOS uses the [IBM Cloud Object Storage SDK](https://github.com/IBM/ibm-cos-sdk-js) to connect to and save data to IBM Cloud Object Storage.

### Architecture
![Architecture Overview](https://github.ibm.com/customer-success/ibmcloud/blob/master/VPC_Phase1/Integrate_Services/integrate17/vpc-app-cos.png)

### Prerequisites
1. An IBM Cloud Account
2. Authority to create VPC resources and IBM Cloud Object Storage services in the IBM Cloud Account
3. A provisioned instance of the [IBM Cloud Object Storage service](https://console.bluemix.net/docs/services/cloud-object-storage/about-cos.html#about-ibm-cloud-object-storage)
4. IBM Cloud Object Storage service credentials. [Generating Cloud Object Storage credentials](https://console.bluemix.net/docs/services/cloud-object-storage/iam/service-credentials.html#service-credentials)
7. ssh-keygen installed locally.

  

### Assumptions
1. You have basic knowledge of the linux VI editor

### Section 1. Create a new SSH Key

An SSH Key is required to access Virtual Servers in a VPC. To generate an SSH Key:
1. Open a Terminal/Command Prompt
2. Issue the following command `ssh-keygen -t rsa -C "root"`
3. Follow the prompts. For this scenario please name the SSH Key file 'vpcCompute'
After creating the SSH Key you will have two new files called 'vpcCompute' and 'vpcCompute.pub'. We will be using the vpcCompute.pub file later in Step #4.

### Section 2. Create a new VPC instance

1. Open the VPC Dashboard in the IBM Cloud Console by clicking [here](https://cloud.ibm.com/vpc/network/vpcs)
2. Click the 'New virtual private cloud' button near the top right of the console.
3. Enter a name for your new VPC
4. Select a Resource Group for your VPC. If you do not have a Resource Group, create a new Resource group by following [these instructions](https://console.bluemix.net/docs/resources/resourcegroups.html#creating-a-resource-group)
5. Enter a subnet name
6. Click the 'Create Virtual Private Cloud' button at the top right of the console.

  

### Section 3. Create a new Virtual Server in your VPC

1. Open the VPC Virtual Server dashboard in the IBM Cloud Console by clicking [here](https://cloud.ibm.com/vpc/compute/vs)
2. Click the 'New Instance' button near the top right of the console.
3. Enter a name for your Virtual Server
4. Select the VPC you created in Step #4 above.
5. Click the 'Ubuntu Linux' button under 'Images'
6. Click the 'New Key' button next to the SSH Key drop down.
7. Give a name for your SSH Key (ex. vpcCompute)
8. Open the vpcCompute.pub file created in Step #3 above
9. Copy the entire contents of the file into your clipboard
10. Paste the clipboard contents into the 'Public Key' field.
11. Click the 'Add SSH Key' button.
12. Click the 'Create Virtual Server Instance' button at the top right of the console. You will then be taken back to the VPC Virtual Server Dashboard.
13. You should see your new Virtual Server listed however it is still powering up. Wait a few minutes and then refresh the web page. Continue to wait and then refresh the page until you see the status of your Virtual Server is 'Powered On'.
14. Once the Virtual Server status is 'Powered On', click on the name of the Virtual Server
15. Click the 'Reserve' button located under 'Network Interfaces'. This will create a floating IP address that will be used to access the Virtual Server.
16. Make a note of the IP Address displayed after clicking the 'Reserve' button. We will use this IP address later in Section #4.

  

### Section 4. Access the Virtual Server and Install Node.js, NPM and the MyCOS sample application
Now that we have a VPC and a Virtual Server it is time to install the MyCOS application.


1. Issue the following command: 
   `ssh -i root@*floating ip*`
    - The *floating ip* is the IP address created in Section 3, Step 5 above.

   If you need to specify the SSH Key file, use the following command:
   `ssh -i *ssh key file* root@*floating ip*`
    - The *ssh key file* is the full path and filename of the SSH Key file created in step #3 above.

2. Update the local package repository. Issue the command 
   `apt update`
3. Install Node.js and NPM by issuing the following commands:
    - `curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -`
    - `apt install nodejs`
4. Verify the installation is complete by issuing the command `node --version`. You should see a valid version of Node returned that is greater than or equal to 10.15.0

5. Create a new directory called 'myCOS' and change to that directory by issuing these commands:
    - `mkdir myCOS`
    - `cd myCOS`

6. Create the package.json file by issuing the command `vi package.json`
7. Copy the following code to your clipboard: 
```
   {
      "name": "mycos",
      "version": "0.0.1",
      "private": true,
      "scripts": {
         "start": "node main.js"
      },
      "dependencies": {
         "ibm-cos-sdk": "^1.4.1"
      },
      "repository": {},
      "engines": {
         "node": "6.x"
      }
   }
```

8. Paste the code above into the VI editor
   *Hint: In VI, press the 'a' key to start appending text and then paste the text*
9. Save and exit the file
   *Hint: in VI, press the Colon key and then type wq! and press enter*
10. Create the main.js file by issuing the command `vi main.js`
11. Copy and paste the entire main.js source file into the vi editor. [Open the main.js file](https://github.ibm.com/customer-success/ibmcloud/blob/master/VPC_Phase1/Integrate_Services/integrate17/myCOS/main.js)
12. Using your COS service credentials, edit the following variables in the main.js source code:
   - apiKeyId: Set this value to the api-key in your credentials
   - serviceInstanceId: Set this value to the resource-instance-id in your credentials
   - endPoint: Set the endpoint based on the private endpoints [documented here](https://console.test.cloud.ibm.com/docs/infrastructure/vpc/connect-to-cos.html#connecting-to-ibm-cloud-object-storage-from-a-vpc)
13. Set the bucketName variable to the name of a bucket in your COS that myCOS can insert data into
14. Save and exit the file
15. Issue the command `npm update`
16. Start the application by issuing the command `npm start`



## Links
- [IBM Cloud Object Storage](https://console.bluemix.net/docs/services/cloud-object-storage/about-cos.html#about-ibm-cloud-object-storage)
- [IBM Cloud Object Storage VPC endpoints](https://console.test.cloud.ibm.com/docs/infrastructure/vpc/connect-to-cos.html#connecting-to-ibm-cloud-object-storage-from-a-vpc)
- [IBM Cloud VPC](https://cloud.ibm.com/vpc/network/vpcs)
- [IBM Cloud VPC CLI Reference](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html)
- [Using Node.js with IBM Cloud Object Storage](https://console.bluemix.net/docs/services/cloud-object-storage/libraries/node.html#using-node-js)