# Use GUI, CLI or API to Connect an App deployed within VPC to Cloud Object Storage (COS) using a private endpoint.

### Purpose
Here we will illustrate the use of the [IBM Cloud Console](https://cloud.ibm.com) to create the required infrastructure components for a Virtual Private Cloud needed for this scenario.

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
4. Select a Resource Group for your VPC. If you do not have a Resource Group, create a new Resource group by following [these instructions](https://cloud.ibm.com/docs/resources?topic=resources-rgs#creating-a-resource-group)
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

## Links
- [Creating VPC resources using the IBM Cloud console](https://cloud.ibm.com/docs/vpc?topic=vpc-creating-a-vpc-using-the-ibm-cloud-console)
- [IBM Cloud VPC](https://cloud.ibm.com/vpc/network/vpcs)
