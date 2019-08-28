# Integrating App deployed within VPC to COS using private network

### Purpose
This scenario illustrates how an application deployed in VPC can use IBM Cloud Object Storage. This scenario uses the IBM Cloud API to create IBM Cloud components.


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


## Section 1 Set up a VPC, VPC Subnet, Virtual Server and Floating IP

### Step 1: Login to the IBM Cloud and obtain an IAM key

Log into the IBM Cloud console

**Command**
````
ibmcloud login
````

Obtain an IAM token by following [these directions](https://cloud.ibm.com/docs/infrastructure/vpc/example-code.html#step-2-get-an-ibm-identity-and-access-management-iam-token).
**Important:** You must repeat this step to refresh your IAM token every hour, because the token expires.
 

Store the API endpoint in a variable so it can be reused later.

**Command**
````
rias_endpoint=https://us-south.iaas.cloud.ibm.com
````
To verify that this variable was saved, run ````echo $rias_endpoint```` and make sure the response is not empty.
 


### Step 2: Create a new VPC instance
The command below will create a new VPC named 'cloudant-vpc' in the IBM Cloud. The Resource group parameter is optional.

**Command**
```
curl -X POST \
  $rias_endpoint/v1/vpcs?version=2019-01-01 \
  -H "Authorization: $iam_token" \
  -H "User-Agent: IBM_One_Cloud_IS_UI/2.4.0" \
  -H "Content-Type: application/json" \
  -H "Cache-Control: no-cache" \
  -H "accept: application/json" \
  -d "{\"name\":\"cloudant-vpc\",\"resource_group\":{\"id\":\"2f3e837a095943de958accf8ccb9bc19\"}}" | json_pp
  ```
  - If you need to create a Resource Group, follow [these instructions](https://console.bluemix.net/docs/resources/resourcegroups.html#creating-a-resource-group)


**Output**
```
{
   "href" : "https://us-south.iaas.cloud.ibm.com/v1/vpcs/e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
   "id" : "e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
   "created_at" : "2019-02-01T17:36:57Z",
   "default_network_acl" : {
      "name" : "allow-all-network-acl-e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
      "id" : "b50300aa-2014-426e-ade7-e5b134f91e41",
      "href" : "https://us-south.iaas.cloud.ibm.com/v1/network_acls/b50300aa-2014-426e-ade7-e5b134f91e41"
   },
   "resource_group" : {
      "id" : "03bf4fd296f24eb19f0eced2a8fb6366",
      "href" : "https://resource-manager.bluemix.net/v1/resource_groups/03bf4fd296f24eb19f0eced2a8fb6366"
   },
   "is_default" : false,
   "classic_peered" : false,
   "default_security_group" : {
      "href" : "https://us-south.iaas.cloud.ibm.com/v1/security_groups/2d364f0a-a870-42c3-a554-000001217857",
      "name" : "recluse-footbath-omit-ranch-refining-panther",
      "id" : "2d364f0a-a870-42c3-a554-000001217857"
   },
   "name" : "cloudant-vpc",
   "crn" : "crn:v1:bluemix:public:is:us-south:a/26a3d1a386bd2cc44df1997eb7ac0ef1::vpc:e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
   "status" : "available"
}
```

Set an environment variable equal to the VPC ID returned from IBM Cloud:
````
vpc_id="e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18"
````

### Step 3: Create a subnet in the new VPC

**Command**
```
curl -X POST \
  "https://us-south.iaas.cloud.ibm.com/v1/subnets" \
  -H "Authorization: $iam_token" \
  -H "User-Agent: IBM_One_Cloud_IS_UI/2.4.0" \
  -H "Content-Type: application/json" \
  -H "Cache-Control: no-cache" \
  -H "accept: application/json" \
  -d "{\"zone\":{\"name\":\"us-south-1\"},\"resource_group\":{\"id\":\"03bf4fd296f24eb19f0eced2a8fb6366\"},\"ip_version\":\"ipv4\",\"name\":\"cloudant-subnet\",\"ipv4_cidr_block\":\"10.240.1.0/24\",\"vpc\":{\"id\":\"$vpc_id\"}}"  
````


**Output**
````
{
  "id": "61641de2-37ce-497a-9390-6172eea22a69",
  "name": "cloudant-subnet",
  "href": "https://us-south.iaas.cloud.ibm.com/v1/subnets/61641de2-37ce-497a-9390-6172eea22a69",
  "ipv4_cidr_block": "10.240.1.0/24",
  "available_ipv4_address_count": 251,
  "total_ipv4_address_count": 256,
  "ip_version": "ipv4",
  "zone": {
    "name": "us-south-1",
    "href": "https://us-south.iaas.cloud.ibm.com/v1/regions/us-south/zones/us-south-1"
  },
  "vpc": {
    "id": "e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
    "crn": "crn:v1:bluemix:public:is:us-south:a/26a3d1a386bd2cc44df1997eb7ac0ef1::vpc:e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
    "name": "cloudant-vpc",
    "href": "https://us-south.iaas.cloud.ibm.com/v1/vpcs/e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18"
  },
  "status": "pending",
  "created_at": "2019-02-01T17:52:55Z",
  "network_acl": {
    "id": "b50300aa-2014-426e-ade7-e5b134f91e41",
    "href": "https://us-south.iaas.cloud.ibm.com/v1/network_acls/b50300aa-2014-426e-ade7-e5b134f91e41",
    "name": "allow-all-network-acl-e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18"
  }
}
````


Set an environment variable equal to the SubNet ID returned from IBM Cloud:
````
vpc_subnet_id="61641de2-37ce-497a-9390-6172eea22a69"
````


### Step 4: Create an SSH Key
An SSH Key is required to access Virtual Servers in a VPC. To generate a new SSH Key and add it to your IBM Cloud account, follow these instructions:

1. Open a Terminal/Command Prompt
2. Issue the following command

    **Command**
    ```
    ssh-keygen -t rsa -C "root"
    ```
   **Output**
   ```
    Generating public/private rsa key pair.
    Enter file in which to save the key (/Users/dlentz/.ssh/id_rsa): vpcCompute
    Enter passphrase (empty for no passphrase): 
    Enter same passphrase again: 
    Your identification has been saved in vpcCompute.
    Your public key has been saved in vpcCompute.pub.
    The key fingerprint is:
    SHA256:04aNt/xusyQx4rf33leMNYEzABsw+wqYpfxlAp4z+qI root
    The key's randomart image is:
    +---[RSA 2048]----+
    |       o.o... .  |
    |        o o  + . |
    |   . . . .    o .|
    |  o B   .=     ..|
    |   X o oS.B    +.|
    |  . + =..* +  . o|
    | .   . .. = .   .|
    | ..      . =+  ..|
    |E ..      .++=o o|
    +----[SHA256]-----+
    ```
3. Add the SSH Key to the IBM Cloud

**Command** (Replace <vpcCompute.pub> with the contents of the vpcCompute.pub file
````
curl -X POST $rias_endpoint/v1/keys?version=2019-01-01 \
  -H "Authorization:$iam_token" \
  -d '{
        "name": "dlentz-key",
        "public_key": "<vpcComputer.pub>",
        "type": "rsa"
      }'
````  

**Output**
````
{
  "created_at": "2019-02-04T15:29:50.000Z",
  "crn": "crn:v1:bluemix:public:is:us-south:a/26a3d1a386bd2cc44df1997eb7ac0ef1::key:636f6d70-0000-0001-0000-000000144a5b",
  "fingerprint": "SHA256:b3cQoQXOv9Hj1fn0DdmZTtYhscp4Qb+5df+ZuGINiLQ",
  "href": "https://us-south.iaas.cloud.ibm.com/v1/keys/636f6d70-0000-0001-0000-000000144a5b",
  "id": "636f6d70-0000-0001-0000-000000144a5b",
  "length": 2048,
  "name": "dlentz-key",
  "public_key": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDjMFASMv+ePuKeHSLbAb65n9OJRb6FuGKJacsigp6qWzjH5yuCsy2THTz01gTXorQbRR6Jfi1MC018Z/vfNsIflkT1Efk4X83k4rCaD5zGuvDdPsWI8O16u6WKaM08X4aJapwSbtcBy6/+SeK1hXV4cErC1OTfsBrP2BsLnH7uXe3ASCsHwHzwIglxIz/fAw5orNGZrr/leGBLU4T86Zoe+xGtbrJUydLnYu9zCv60qkvnwVQBhvuycGuAxGusBAkb5MN3YW6ZZVhawqtlPSOdVSJAfVR4Jo9/DHIjlHrPGElcbsN6Is+fDt9gy8UkAcn9/tMMSNoT2ale48eEHYb root",
  "type": "rsa"
}
````

Set an environment variable to hold the ID of the key created
````
ssh_key_id="636f6d70-0000-0001-0000-000000144a5b"
````




### Step 5: Create a new Virtual Server in your VPC

**Command**
````
curl -X POST $rias_endpoint/v1/instances?version=2019-01-01 \
  -H "Authorization:$iam_token" \
  -d '{
        "name": "cloudant",
        "type": "virtual",
        "zone": {
          "name": "us-south-1"
        },
        "vpc": {
          "id": "'$vpc_id'"
        },
        "primary_network_interface": {
          "port_speed": 1000,
          "subnet": {
            "id": "'$vpc_subnet_id'"
          }
        },
        "keys":[{"id": "'$ssh_key_id'"}],
        "flavor": {
          "name": "c-2x4"
         },
        "image": {
          "id": "7eb4e35b-4257-56f8-d7da-326d85452591"
         },
        "userdata": ""
      }'
````

**Output**
````
{
  "cpu": {
    "architecture": "amd64",
    "cores": 2,
    "frequency": 2000
  },
  "created_at": "2019-02-04T15:33:37.134Z",
  "crn": "crn:v1:bluemix:public:is:us-south-1:a/26a3d1a386bd2cc44df1997eb7ac0ef1::instance:9c6e42e3-3661-40b2-bce3-f60e323533ba",
  "href": "https://us-south.iaas.cloud.ibm.com/v1/instances/9c6e42e3-3661-40b2-bce3-f60e323533ba",
  "id": "9c6e42e3-3661-40b2-bce3-f60e323533ba",
  "image": {
    "crn": "crn:v1:bluemix:public:is:us-south:a/33c5711b8afbf7fd809a4529de613a08::image:7eb4e35b-4257-56f8-d7da-326d85452591",
    "href": "https://us-south.iaas.cloud.ibm.com:443/v1/images/7eb4e35b-4257-56f8-d7da-326d85452591",
    "id": "7eb4e35b-4257-56f8-d7da-326d85452591",
    "name": "ubuntu-16.04-amd64"
  },
  "memory": 4,
  "name": "cloudant",
  "network_interfaces": [
    {
      "href": "https://us-south.iaas.cloud.ibm.com/v1/instances/9c6e42e3-3661-40b2-bce3-f60e323533ba/network_interfaces/56a8ca12-4ab8-4f5e-9dc1-6715db514790",
      "id": "56a8ca12-4ab8-4f5e-9dc1-6715db514790",
      "name": "statutory-aspect-gumminess-twiddling-barrel-deploy",
      "primary_ipv4_address": "10.240.1.12",
      "subnet": {
        "crn": "crn:v1:bluemix:public:is:us-south-1:a/26a3d1a386bd2cc44df1997eb7ac0ef1::subnet:61641de2-37ce-497a-9390-6172eea22a69",
        "href": "https://us-south.iaas.cloud.ibm.com/v1/subnets/61641de2-37ce-497a-9390-6172eea22a69",
        "id": "61641de2-37ce-497a-9390-6172eea22a69",
        "name": "cloudant-subnet"
      }
    }
  ],
  "primary_network_interface": {
    "href": "https://us-south.iaas.cloud.ibm.com/v1/instances/9c6e42e3-3661-40b2-bce3-f60e323533ba/network_interfaces/56a8ca12-4ab8-4f5e-9dc1-6715db514790",
    "id": "56a8ca12-4ab8-4f5e-9dc1-6715db514790",
    "name": "statutory-aspect-gumminess-twiddling-barrel-deploy",
    "primary_ipv4_address": "10.240.1.12",
    "subnet": {
      "crn": "crn:v1:bluemix:public:is:us-south-1:a/26a3d1a386bd2cc44df1997eb7ac0ef1::subnet:61641de2-37ce-497a-9390-6172eea22a69",
      "href": "https://us-south.iaas.cloud.ibm.com/v1/subnets/61641de2-37ce-497a-9390-6172eea22a69",
      "id": "61641de2-37ce-497a-9390-6172eea22a69",
      "name": "cloudant-subnet"
    }
  },
  "profile": {
    "crn": "crn:v1:bluemix:public:is:us-south:a/26a3d1a386bd2cc44df1997eb7ac0ef1::instance-profile:c-2x4",
    "href": "https://us-south.iaas.cloud.ibm.com/v1/instance/profiles/c-2x4",
    "name": "c-2x4"
  },
  "status": "pending",
  "vpc": {
    "crn": "crn:v1:bluemix:public:is::a/26a3d1a386bd2cc44df1997eb7ac0ef1::vpc:e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
    "href": "https://us-south.iaas.cloud.ibm.com/v1/vpcs/e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
    "id": "e8c341fc-4fc9-4bb0-94cc-e8e2fb15ea18",
    "name": "cloudant-vpc"
  },
  "zone": {
    "href": "https://us-south.iaas.cloud.ibm.com/v1/regions/us-south/zones/us-south-1",
    "name": "us-south-1"
  }
}
````

Set an environment variable equal to the Primary Network Interface ID
````
network_interface="56a8ca12-4ab8-4f5e-9dc1-6715db514790"
````
 
### Step 6: Create a floating IP for the new Virtual Server

**Command**
````
curl -X POST $rias_endpoint/v1/floating_ips?version=2019-01-01 \
  -H "Authorization:$iam_token" \
  -d '{
        "name": "my-server-floatingip",
        "target": {
            "id":"'$network_interface'"
        }
      }
'
````

**Output**
````
{
   "name" : "my-server-floatingip",
   "href" : "https://us-south.iaas.cloud.ibm.com/v1/floating_ips/5da08ea3-49f5-4a84-98c4-81575511c793",
   "status" : "pending",
   "created_at" : "2019-02-04T15:38:05Z",
   "crn" : "",
   "target" : {
      "id" : "56a8ca12-4ab8-4f5e-9dc1-6715db514790",
      "subnet" : {
         "name" : "cloudant-subnet",
         "href" : "https://us-south.iaas.cloud.ibm.com/v1/subnets/61641de2-37ce-497a-9390-6172eea22a69",
         "id" : "61641de2-37ce-497a-9390-6172eea22a69"
      },
      "href" : "https://us-south.iaas.cloud.ibm.com/v1/instances/f158f4cc-626f-4593-9e3d-620ccea0f967/network_interfaces/56a8ca12-4ab8-4f5e-9dc1-6715db514790",
      "name" : "statutory-aspect-gumminess-twiddling-barrel-deploy",
      "primary_ipv4_address" : "10.240.1.12"
   },
   "address" : "169.61.244.118",
   "id" : "5da08ea3-49f5-4a84-98c4-81575511c793",
   "zone" : {
      "href" : "https://us-south.iaas.cloud.ibm.com/v1/regions/us-south/zones/us-south-1",
      "name" : "us-south-1"
   }
}
````

Make a note of the floating IP address created, in the above example the floating IP address is ````169.61.244.118````
  

## Section 2 Access the Virtual Server and Install Node.js, NPM and the MyCOS sample application


1. Issue the following command: 
   `ssh -i root@*floating ip*`
    - The *floating ip* is the IP address created in Section 3, Step 5 above.

   If you need to specify the SSH Key file, use the following command:
   `ssh -i *ssh key file* root@*floating ip*`
    - The *ssh key file* is the full path and filename of the SSH Key file created in Section #2 above.

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
- [IBM Cloud VPC API Reference](https://cloud.ibm.com/docs/infrastructure/vpc/api-doc-wrapper.html#api-reference-for-vpc)
- [Using Node.js with IBM Cloud Object Storage](https://console.bluemix.net/docs/services/cloud-object-storage/libraries/node.html#using-node-js)