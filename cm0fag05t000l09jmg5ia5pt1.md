---
title: "Setting Up an AWS EKS Cluster: A Step-by-Step Guide"
datePublished: Thu Aug 29 2024 12:55:45 GMT+0000 (Coordinated Universal Time)
cuid: cm0fag05t000l09jmg5ia5pt1
slug: setting-up-an-aws-eks-cluster-a-step-by-step-guide
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1724935846433/98fef49e-c04e-4c07-9518-5e5f98bf8210.png
tags: aws, javascript, kubernetes, developer, devops

---

Before you proceed, please subscribe to my YouTube Channel.

%[https://www.youtube.com/@technologynbeyond] 

#### **Prerequisites**

Before you start, ensure you have the following prerequisites:

1. **AWS CLI:** Install the AWS CLI and configure it with your credentials.
    
2. **kubectl:** Install kubectl, the command-line tool for interacting with Kubernetes clusters.
    
3. **eksctl:** Install eksctl, a simple CLI tool for creating and managing EKS clusters.
    
4. **IAM Permissions:** Ensure you have the necessary IAM permissions to create EKS clusters, VPCs, and related resources.
    

#### **Step 1: Create an IAM Role for EKS**

EKS requires an IAM role to interact with AWS services on your behalf. Create an IAM role with the `AmazonEKSClusterPolicy` and `AmazonEKSServicePolicy` attached.

1. Navigate to the **IAM** console.
    
2. Choose **Roles** and then **Create role**.
    
3. Select **EKS** as the service that will use this role.
    
4. Attach the `AmazonEKSClusterPolicy` and `AmazonEKSServicePolicy` managed policies.
    
5. Name the role (e.g., `EKS-Cluster-Role`) and create it.
    

#### **Step 2: Create a Virtual Private Cloud (VPC)**

EKS clusters require a VPC with specific networking configurations:

1. Use the **VPC wizard** in the AWS Management Console to create a VPC with subnets in multiple availability zones for high availability.
    
2. Ensure the VPC has public and private subnets, with route tables configured for internet access (for public subnets) and NAT gateway (for private subnets).
    
3. Create security groups to allow communication between nodes and the control plane.
    

**Alternatively, you can use** `eksctl` **to create the VPC automatically during cluster creation.**

#### **Step 3: Create the EKS Cluster**

With your IAM role and VPC ready, you can now create the EKS cluster:

1. **Using eksctl:**
    
    ```plaintext
    bashCopy codeeksctl create cluster --name my-eks-cluster --region us-west-2 --nodegroup-name my-nodes --node-type t3.medium --nodes 3 --nodes-min 1 --nodes-max 4 --managed
    ```
    
    This command creates an EKS cluster named `my-eks-cluster` in the `us-west-2` region with a managed node group consisting of `t3.medium` instances.
    
2. **Using the AWS Management Console:**
    
    * Go to the **EKS** service and click **Create cluster**.
        
    * Specify the cluster name, Kubernetes version, and the VPC you created earlier.
        
    * Choose the IAM role created in Step 1.
        
    * Configure logging, select subnets, and proceed with the default settings.
        
    * Create a node group by specifying instance types, scaling options, and security groups.
        

#### **Step 4: Configure kubectl for EKS**

After the cluster is created, you need to update your kubeconfig file to use `kubectl` with the new EKS cluster.

1. Run the following command to update your kubeconfig:
    
    ```plaintext
    bashCopy codeaws eks --region us-west-2 update-kubeconfig --name my-eks-cluster
    ```
    
2. Verify the configuration by listing the cluster nodes:
    
    ```plaintext
    bashCopy codekubectl get nodes
    ```
    

#### **Step 5: Deploy Applications to Your EKS Cluster**

With the cluster up and running, you can now deploy your applications using Kubernetes manifests (YAML files). For example, to deploy a simple Nginx web server, use the following commands:

1. Create a deployment:
    
    ```plaintext
    bashCopy codekubectl create deployment nginx --image=nginx
    ```
    
2. Expose the deployment as a service:
    
    ```plaintext
    bashCopy codekubectl expose deployment nginx --port=80 --type=LoadBalancer
    ```
    

This will create a LoadBalancer service that exposes the Nginx server to the internet.

#### **Conclusion**

Setting up an AWS EKS cluster involves creating an IAM role, configuring a VPC, and deploying the cluster using `eksctl` or the AWS Management Console. Once the cluster is set up, you can easily manage and scale your Kubernetes applications with minimal operational overhead. Remember to follow best practices, such as using least-privilege IAM roles and configuring logging and monitoring for your cluster.

With EKS, AWS handles the complexity of the Kubernetes control plane, allowing you to focus on deploying and managing your applications efficiently.

%[https://youtu.be/Ad72h1gZgOA]