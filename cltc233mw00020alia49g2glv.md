---
title: "A Comprehensive Guide To Setting Up AWS Network ACLs"
datePublished: Sun Mar 03 2024 22:00:31 GMT+0000 (Coordinated Universal Time)
cuid: cltc233mw00020alia49g2glv
slug: a-comprehensive-guide-to-setting-up-aws-network-acls
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1709502741141/7b2999be-f651-451c-a5b4-1e04568ea4c2.png
tags: aws, devops, jenkins, awscommunity

---

In the world of cloud computing, security is paramount. With the ever-increasing complexity of networks and the rise in cyber threats, having robust measures in place to protect your AWS resources is essential. One such tool provided by Amazon Web Services (AWS) is the Network Access Control List (ACL). In this article, I will explore the technicalities of AWS Network ACLs, understand it's significance in securing your cloud infrastructure, and discover how to configure them effectively to safeguard your assets.

Let's dive in !!! 👏👏👏

AWS Network ACLs serve as virtual firewall, controlling both inbound and outbound traffic at the subnet level within a Virtual Private Cloud (VPC). Unlike security groups, which operate at the instance level, Network ACLs provide granular control over traffic flow between subnets. Each subnet in the VPC can be associated with a single Network ACL, allowing you to define rules that dictate which traffic is permitted or denied.

### Key Features of AWS Network ACLs:

**Stateless:** Network ACLs are stateless, meaning they do not keep track of the state of connections. Each rule applies to both inbound and outbound traffic independently.

**Order of evaluation:** Rules in a Network ACL are evaluated in numerical order, starting from the lowest number to the highest. Once a matching rule is found, further evaluation stops.

**Default rules:** By default, a Network ACL allows all inbound and outbound traffic. Users can create custom rules to allow or deny specific types of traffic as needed.

**Implicit deny:** If there are no explicit rules allowing traffic, AWS Network ACLs have an implicit deny rule, which denies all traffic by default.

## **How Network ACLs work**

When a packet enters or leaves a subnet associated with a Network ACL, AWS evaluates the rules defined in the ACL to determine whether to allow or deny the traffic. Network ACL rules are evaluated in order, starting with the lowest numbered rule, and the process stops when a matching rule is found. If no rule matches, the default action (allow or deny) is applied.

The Network ACL rules consist of a rule number, an action (allow or deny), a protocol (TCP, UDP, ICMP, etc.), a range of ports, and an IP address range (CIDR block). These rules allow administrators to define fine-grained controls over the traffic flow within their VPC.

### Setting Up AWS Network ACLs

1. Access the AWS Management Console and navigate to the VPC Dashboard.
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1709499043307/eb64ea21-dfea-4ebd-a7b1-8da7234c3835.png align="center")
    
2. Select the VPC for which you want to configure the Network ACL.
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1709498814239/eccae569-b878-4b58-a9d5-37e3319992b4.png align="center")
    
3. In the navigation pane, click on "Network ACLs" and then click on "Create network ACL."
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1709498851173/cc54cce4-d618-490a-b33c-601dcc7f1ad6.png align="center")
    
4. Give your Network ACL a name and select the VPC to associate it with.
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1709499102997/98250212-88ad-4a14-bd99-d22e2049c1a8.png align="center")
    
5. Once the Network ACL is created, you can add inbound and outbound rules to control traffic flow.
    
6. ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1709499222301/51798028-291a-41c1-a9fc-7dc9fcccc2f8.png align="center")
    
7. Click on "Edit inbound rules" or "Edit outbound rules" to add custom rules. Each rule consists of a rule number, an action (allow or deny), a protocol (e.g., TCP, UDP), a port range, and a source or destination IP range.
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1709499264339/89d9ae73-dc66-4454-92c0-c4538e3eb437.png align="center")
    
8. After adding the desired rules, click on "Save" to apply the changes.
    

Take the time to configure and maintain your Network ACLs diligently, and you'll be well-equipped to defend your infrastructure against cyber threats in the dynamic landscape of cloud computing.

If you are able to go through this process, you have successfully setup an ACLs for your subnets. Go ahead and select Subnet Associations and click on Edit Subnet Associations to add your Subnets.

Happy Clouding 👏👏👏👏

Don't forget to follow me on #twitter #Linkedln