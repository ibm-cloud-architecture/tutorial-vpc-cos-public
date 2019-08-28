# Integrating App deployed within VPC to COS using private network

### Purpose
This scenario illustrates how an application deployed in VPC can use IBM Cloud Object Storage. This scenario uses the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) for executing all commands on the IBM Cloud.


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


## Section 1 - Install the IBM Cloud CLI tools and login to IBM Cloud
1. Install the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)
2. Open a Terminal/Command Prompt 
   *Use this terminal/command prompt throughout this excercise*
3. Install the IBM Cloud CLI [Infrastructure plugin]((https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html))

    **Command**
   ```
   ibmcloud plugin install infrastructure-service
   ```
   **Output**
   ```
   Looking up 'infrastructure-service' from repository 'IBM Cloud'...
   Plug-in 'infrastructure-service 0.2.0' found in repository 'IBM Cloud'
   Attempting to download the binary file...
   14.10 MiB / 14.10 MiB [================================================================================================================] 100.00% 2s
   14784336 bytes downloaded
   Installing binary...
   OK
   Plug-in 'infrastructure-service 0.2.0' was successfully installed into /Users/dlentz/.bluemix/plugins/infrastructure-service. Use 'ibmcloud plugin show infrastructure-service' to show its details.
   ```
4. Login to the IBM Cloud:
   - For a federated account use single sign on:  
     `ibmcloud login -sso`  
   - Otherwise use the default login:  
     `ibmcloud login`  
   - If you have an API Key, use --apikey:  
     `ibmcloud login --apikey [your API Key]`  


### Section 2 - Create a new SSH key
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
4. Add your new SSH Key to your IBM Cloud account

    **Command**
    ```
    ibmcloud is key-create vpcCompute-key @vpcCompute.pub
                           <key name>     <SSH file>

    Parameters:
    Key Name - Unique name for your SSH Key
    SSH file - The filename containing the public key
    ```
    **Output**
    ```
    Creating key vpcCompute-key under account IBM - Mac's Org as user <Your IBM Cloud ID>...
                 
    ID            636f6d70-0000-0001-0000-000000142747   
    Name          vpcCompute-key   
    Type          rsa   
    Length        2048   
    FingerPrint   SHA256:04aNt/xusyQx4rf33leMNYEzABsw+wqYpfxlAp4z+qI   
    Key           ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDe7jK7fOHrKU81z6cWELXAOHDZHGqqUZHd4ox3De0HjeO8NPqgKmn0mSR1oZZiWqR7QQi1RR0MQ/bzlD2e35gozFbbtI/S45m2KErCYvd9jbgpPYj7X9TEoLLM3ediCqdY6VJC+abDtX+C0mzQ1Hp2wuxQ07AoVWkiRMCLVFH6zbwHsvaAWc8NG0XXjA8XKLtcZYTqDxvl9mN/xwv032KwcuuvIVGdu5ctHImHjqTAiVtkPbs5VLS0+NkPiPcwU0h9kQYtlzfMav0BnHOgYrgIGUXG8RQZ0Rqi38EWeQWIErnN9eVF6LCSwbzX1Am8qyc/9p1XeHnbebRq28/atHur root   
                    
    Created       now
    ```


### Section 3. Create a new VPC instance, SubNet and Virtual Server

1. Create a new VPC for this scenerio by entering the following command:

    **Command**
    ```
    ibmcloud is vpc-create vpc-monitor-demo --resource-group-name <your resource group>
                           <vpc name>       <Optional Resource Group>

    Parameters:
    vpc name - The name for the VPC
    Resource Group - Optional parameter used to specify which resource group to create the VPC in
    ```
    **Output**
    ```
    Creating vpc vpc-monitor-demo in resource group <your resource group> under account IBM - Mac's Org as user <your IBM Cloud ID>...
                                
    ID                       4f81711c-1cf3-4ee6-aff4-2af1f0bc2794   
    Name                     vpc-monitor-demo   
    Default                  no   
    Default Network ACL      allow-all-network-acl-4f81711c-1cf3-4ee6-aff4-2af1f0bc2794(b0308e7d-03cc-445f-9725-cc1e2503a605)   
    Default Security Group   -   
    Resource Group           (2f3e837a095943de958accf8ccb9bc19)   
    Created                  4 seconds ago   
    Status                   available   
    ```
    - [Command Documentation](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-vpc-create-)
    - If you need to create a Resource Group, follow [these instructions](https://console.bluemix.net/docs/resources/resourcegroups.html#creating-a-resource-group)


2. Create a base SubNet in the new VPC

    **Command**
    ```
    ibmcloud is subnet-create monitor-subnet 4f81711c-1cf3-4ee6-aff4-2af1f0bc2794 us-south-1 --ipv4-cidr-block 10.240.10.0/24
                              <subnet name>  <VPC ID>                             <Zone>     <IPV4 Range>

    Parameters:
    Subnet Name - The name to give the new subnet
    VPC ID - The ID of the VPC the Subnet is created in
    Zone -  The Zone to create the Subnet in
    IPV4 Range - The block of IPV4 addresses that can be used in the subnet
    ```
    **Output**
    ```
    Creating Subnet monitor-subnet under account IBM - Mac's Org as user <Your IBM Cloud ID>...
                        
    ID               d91dea76-b4fd-4649-8226-e7d9c2d616c6   
    Name             monitor-subnet   
    IPv*             ipv4   
    IPv4 CIDR        10.240.10.0/24   
    IPv6 CIDR        -   
    Addr available   251   
    Addr Total       256   
    ACL              allow-all-network-acl-4f81711c-1cf3-4ee6-aff4-2af1f0bc2794(b0308e7d-03cc-445f-9725-cc1e2503a605)   
    Gateway          -   
    Created          1 second ago   
    Status           pending   
    Zone             us-south-1   
    VPC              vpc-monitor-demo(4f81711c-1cf3-4ee6-aff4-2af1f0bc2794)
    ```
    - [Command Documentation](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-subnet-create-)
    - [Finding a Zone](#appendix-1---finding-a-zone) in the Appendix for more info)
  
3. Create a Virtual Server in the new VPC SubNet

    **Command**
    ```
    ibmcloud is instance-create vpc-monitor-app 4f81711c-1cf3-4ee6-aff4-2af1f0bc2794 us-south-1 c-2x4     d91dea76-b4fd-4649-8226-e7d9c2d616c6 1000            --image-id 7eb4e35b-4257-56f8-d7da-326d85452591 --key-ids 636f6d70-0000-0001-0000-000000142747
                                <name>          <VPC ID>                             <Zone>     <Profile> <Subnet ID>                          <Network Speed> <Image ID>                                      <SSH Key ID>
    
    Parameters:
    Name - The name of the new Virtual Server
    VPC ID - The ID of the VPC to create the instance in
    Zone - The Zone to create the Virtual Server in (see [Finding a Zone](Appendix 1 - Finding a Zone) in the Appendix for more info)
    Subnet ID - The ID of the Subnet to create the instance in
    Network Speed - The speed of the network (100 or 1000)
    Image ID - The ID of the Image to use in the new Virtual Server
    SSH Key ID - The ID of the SSH Key
    ```
    **Output**
    ```
    Creating instance vpc-monitor-app under account IBM - Mac's Org as user <Your IBM Cloud ID>...
                        
    ID                e72f6bfe-4271-4731-bedd-90f438cb8d6a   
    Name              vpc-monitor-app   
    Profile           c-2x4   
    CPU Arch          amd64   
    CPU Cores         2   
    CPU Frequency     2000   
    Memory            4   
    Primary Intf      primary(2aa29acc-4241-4b28-8377-c8c57fc9b538)   
    Primary Address   10.240.10.12   
    Image             ubuntu-16.04-amd64(7eb4e35b-4257-56f8-d7da-326d85452591)   
    Status            pending   
    Created           5 seconds ago   
    VPC               vpc-monitor-demo(4f81711c-1cf3-4ee6-aff4-2af1f0bc2794)   
    Zone              us-south-1   
    ```
    - [Command Documentation](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-instance-create-)
    - The Key ID is obtained from the output of the ibmcloud is key-create command above
    - To see a list of available Image IDs, enter the command
      `ibmcloud is images` [(Reference)](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-images-)
    - To see a list of available Profiles, enter the command
      `ibmcloud is instance-profiles` [(Reference)](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-instance-profiles-)
    
4. Reserve a floating IP address for the new Virtual Server

    **Command**
    ```
    ibmcloud is floating-ip-reserve vpc-monitor-eth0 --zone us-south-1
                                    <name>           <zone>

    Parameters:
    Name - The name of the floating IP reservation
    Zone - The zone to reserve the IP in
    ```
    **Output**
    ```
    Creating floating IP vpc-monitor-eth0 under account IBM - Mac's Org as user <Your IBM Cloud ID>...
                 
    ID            e1d697f0-3456-4987-97f6-de2d4f4b1159   
    Address       169.61.244.21   
    Name          vpc-monitor-eth0   
    Target        -   
    Target Type   -   
    Target IP        
    Created       now   
    Status        pending   
    Zone          us-south-1  
    ```
    - [Command Documentation](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-floating-ip-reserve-)

5. Assign the reserved floating IP address to the new Virtual Server

    **Command**
    ```
    ibmcloud is instance-network-interface-floating-ip-add e72f6bfe-4271-4731-bedd-90f438cb8d6a 2aa29acc-4241-4b28-8377-c8c57fc9b538 e1d697f0-3456-4987-97f6-de2d4f4b1159
                                                           <Virtual Server Instance ID>         <NIC ID>                             <Floating IP ID>

    Parameters:
    Virtual Server Instance ID - The ID of the Virtual Server instance the Floating IP will be assigned to
    NIC ID - The ID of the Primary Network Interface card on the Virtual Server (See 'Finding the NIC ID' below)
    Floating IP ID - The ID of the Floating IP (Found in the output of the 'floating-ip-reserve' command in Step 4 above)
    ```
    **Output**
    ```
    Creating floatingip e1d697f0-3456-4987-97f6-de2d4f4b1159 for instance e72f6bfe-4271-4731-bedd-90f438cb8d6a under account IBM - Mac's Org as user <Your IBM Cloud ID>...
                    
    ID            e1d697f0-3456-4987-97f6-de2d4f4b1159   
    Address       169.61.244.21   
    Name          vpc-monitor-eth0   
    Target        primary(2aa29acc-.)   
    Target Type   intf   
    Target IP     10.240.10.12   
    Created       2 minutes ago   
    Status        available   
    Zone          us-south-1   
   ```
   - [Command Documentation](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html#-ibmcloud-is-instance-network-interface-floating-ip-add-)
   - See [Finding the NIC ID](#appendix-2---finding-the-nic-id) in the Appendix for help identifying the correct NIC ID to use.
  

### Section 4. Access the Virtual Server and Install Node.js, NPM and the MyCOS sample application


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



## Appendix
### Appendix 1 - Finding a Zone
To see a list of available Zones, use the following commands:

**Command 1**
```
ibmcloud is regions
```
**Output**
```
Listing regions under account IBM - Mac's Org as user <Your IBM Cloud ID>...
Name       Endpoint                              Status   
us-south   https://us-south.iaas.cloud.ibm.com   available
```

**Command 2**
```
ibmcloud is zones <region name>
```
*Where <region name> is the name of a region obtained in Command 1 above*
**Output**
```
Listing zones in region us-south under account IBM - Mac's Org as user <Your IBM Cloud ID>...
Name         Region     Status   
us-south-3   us-south   available   
us-south-1   us-south   available   
us-south-2   us-south   available  
```


### Appendix 2 - Finding the NIC ID
To find the NIC ID, issue the following command to get details about the Virtual Server. The NIC ID is shown in the output next to 'Primary Intf' and only includes the text within the parenthesis. For example, the NIC ID in the output below is `2aa29acc-4241-4b28-8377-c8c57fc9b538`
   
**Command**
```
ibmcloud is instance <Virtual Server Instance ID>
```
**Output**
```
Getting instance e72f6bfe-4271-4731-bedd-90f438cb8d6a under account IBM - Mac's Org as user <Your IBM Cloud ID>...
                    
ID                e72f6bfe-4271-4731-bedd-90f438cb8d6a   
Name              vpc-monitor-app   
Profile           c-2x4   
CPU Arch          amd64   
CPU Cores         2   
CPU Frequency     2000   
Memory            4   
Primary Intf      primary(2aa29acc-4241-4b28-8377-c8c57fc9b538)   
Primary Address   10.240.10.12   
Image             ubuntu-16.04-amd64(7eb4e35b-4257-56f8-d7da-326d85452591)   
Status            running   
Created           6 minutes ago   
VPC               vpc-monitor-demo(4f81711c-1cf3-4ee6-aff4-2af1f0bc2794)   
Zone              us-south-1   
```


   
## Links
- [IBM Cloud Object Storage](https://console.bluemix.net/docs/services/cloud-object-storage/about-cos.html#about-ibm-cloud-object-storage)
- [IBM Cloud Object Storage VPC endpoints](https://console.test.cloud.ibm.com/docs/infrastructure/vpc/connect-to-cos.html#connecting-to-ibm-cloud-object-storage-from-a-vpc)
- [IBM Cloud VPC](https://cloud.ibm.com/vpc/network/vpcs)
- [IBM Cloud VPC CLI Reference](https://cloud.ibm.com/docs/infrastructure/vpc/cli-reference.html)
- [Using Node.js with IBM Cloud Object Storage](https://console.bluemix.net/docs/services/cloud-object-storage/libraries/node.html#using-node-js)