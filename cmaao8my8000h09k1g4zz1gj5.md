---
title: "Migrating an Amazon RDS DB Instance to Another VPC in a Different AWS Account"
datePublished: Mon May 05 2025 06:00:09 GMT+0000 (Coordinated Universal Time)
cuid: cmaao8my8000h09k1g4zz1gj5
slug: migrating-an-amazon-rds-db-instance-to-another-vpc-in-a-different-aws-account
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1745794253700/9bbb1a47-3ab2-42d0-a785-53aabc0d3eb3.png
tags: aws, devops, devops-articles

---

Migrating an Amazon RDS DB instance to a Virtual Private Cloud (VPC) in a different AWS account is a complex but achievable task, often required for organizational restructuring, account separation, or compliance needs. This blog post outlines a detailed, step-by-step process to migrate an RDS DB instance across AWS accounts while ensuring data integrity and minimizing downtime.

## Prerequisites

Before starting, ensure you have:

* **Administrative access** to both the source and target AWS accounts with IAM permissions for RDS, VPC, EC2, and S3 (for snapshot sharing).
    
* **Source and target VPCs** configured in the respective AWS accounts (they can be in the same or different regions).
    
* **A running RDS DB instance** in the source account’s VPC.
    
* **Backup of the RDS instance** (manual or automated snapshot).
    
* **AWS CLI installed and configured** for both accounts (optional, for CLI-based steps).
    
* **Cross-account permissions** set up for snapshot sharing.
    
* **Knowledge of the application** connecting to the RDS instance to update connection strings post-migration.
    

## Migration Overview

Since RDS instances cannot be directly moved across AWS accounts, the migration involves sharing a snapshot from the source account to the target account, restoring it to a new DB instance in the target VPC, and reconfiguring the application. The high-level steps are:

1. Create and share a snapshot from the source account.
    
2. Copy the snapshot to the target account (if in a different region).
    
3. Restore the snapshot to a new RDS DB instance in the target account’s VPC.
    
4. Configure the new DB instance.
    
5. Update application connection strings.
    
6. Verify the migration and clean up.
    

### Step 1: Create and Share a Snapshot from the Source Account

1. **Log in to the source AWS account** and navigate to the RDS service in the AWS Management Console.
    
2. Select the DB instance to migrate.
    
3. Choose **Actions** &gt; **Take snapshot**.
    
4. Provide a name (e.g., source-db-snapshot-2025) and click **Take Snapshot**.
    
5. Wait for the snapshot to become **Available**.
    
6. Navigate to **Snapshots**, select the snapshot, and choose **Actions** &gt; **Share snapshot**.
    
7. In the **Share Snapshot** dialog:
    
    * Enter the **AWS Account ID** of the target account.
        
    * Click **Add** and then **Save**.
        
8. If the DB instance is encrypted with a custom KMS key:
    
    * Share the KMS key with the target account using the KMS console or CLI.
        
    * Grant the target account permission to use the key.
        

Using the AWS CLI in the source account:

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier source-db-instance \
  --db-snapshot-identifier source-db-snapshot-2025

# Share snapshot
aws rds modify-db-snapshot-attribute \
  --db-snapshot-identifier source-db-snapshot-2025 \
  --attribute-name restore \
  --values-to-add target-account-id
```

For KMS key sharing (if encrypted):

```bash
aws kms create-grant \
  --key-id arn:aws:kms:region:source-account-id:key/key-id \
  --grantee-principal arn:aws:iam::target-account-id:root \
  --operations "Decrypt" "Encrypt" "GenerateDataKey" "DescribeKey"
```

### Step 2: Copy the Snapshot to the Target Account (if in a Different Region)

If the source and target VPCs are in different regions, copy the shared snapshot to the target account’s region:

1. **Log in to the target AWS account** and navigate to the RDS console.
    
2. Go to **Snapshots** &gt; **Shared with Me** and locate the shared snapshot.
    
3. Select the snapshot and choose **Actions** &gt; **Copy snapshot**.
    
4. Configure the copy:
    
    * **Destination region**: Select the target region.
        
    * **New snapshot identifier**: Provide a name (e.g., target-db-snapshot-2025).
        
    * **KMS key**: Choose a KMS key in the target account/region if the snapshot is encrypted.
        
5. Click **Copy Snapshot**.
    

Using the AWS CLI in the target account:

```bash
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier arn:aws:rds:source-region:source-account-id:snapshot:source-db-snapshot-2025 \
  --target-db-snapshot-identifier target-db-snapshot-2025 \
  --kms-key-id arn:aws:kms:target-region:target-account-id:key/target-key-id \
  --region target-region
```

### Step 3: Restore the Snapshot to a New RDS DB Instance in the Target VPC

1. In the target account’s RDS console, navigate to **Snapshots** (or **Shared with Me** if not copied).
    
2. Select the snapshot (target-db-snapshot-2025 or the shared snapshot).
    
3. Choose **Actions** &gt; **Restore snapshot**.
    
4. Configure the new DB instance:
    
    * **DB instance identifier**: Provide a unique name (e.g., target-db-instance).
        
    * **VPC**: Select the target VPC.
        
    * **Subnet group**: Choose a DB subnet group in the target VPC with subnets in at least two Availability Zones.
        
    * **Security group**: Assign a security group allowing inbound traffic on the database port.
        
    * **Other settings**: Match the source instance’s settings (instance type, storage, etc.).
        
5. Click **Restore DB instance**.
    
6. Wait for the new instance to become **Available**.
    

Using the AWS CLI:

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier target-db-instance \
  --db-snapshot-identifier target-db-snapshot-2025 \
  --db-subnet-group-name target-vpc-subnet-group \
  --vpc-security-group-ids sg-xxxxxxxxxxxxxxxxx \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --region target-region
```

### Step 4: Configure the New DB Instance

1. **Verify connectivity**: Test access to the new DB instance from the target account’s application or a client.
    
2. **Update security groups**: Ensure the security group allows traffic from application servers in the target VPC.
    
3. **Parameter and option groups**: Assign or create parameter and option groups to match the source instance’s configuration.
    
4. **Enable backups**: Configure automated backups and maintenance windows.
    

### Step 5: Update Application Connection Strings

1. Retrieve the **endpoint** of the new DB instance (e.g., target-db-instance.xxxxxxxxxxxx.target-region.rds.amazonaws.com).
    
2. Update the application configuration in the target account to use the new endpoint.
    
3. Test the application to confirm connectivity and functionality.
    

### Step 6: Verify the Migration and Clean Up

1. **Verify data**: Run queries to ensure the data in the new DB instance is consistent with the source.
    
2. **Monitor performance**: Use CloudWatch to verify the new instance’s performance.
    
3. **Decommission the source DB instance**:
    
    * Stop traffic to the source instance.
        
    * Take a final snapshot.
        
    * Delete the source instance.
        
4. **Clean up snapshots**:
    
    * Delete the shared snapshot in the source account.
        
    * Delete the copied snapshot in the target account if no longer needed.
        

## Minimizing Downtime

* **DNS-based switch**: Use a CNAME record with a low TTL to redirect traffic to the new endpoint.
    
* **Cross-account replication**: For supported engines (e.g., MySQL, PostgreSQL), set up a read replica in the target account’s VPC, promote it, and switch traffic. This requires VPC peering or AWS Transit Gateway.
    
* **Pre-testing**: Warm up the new instance with test queries to reduce latency post-switch.
    

## Troubleshooting

* **Snapshot sharing issues**: Verify the target account ID and KMS key permissions.
    
* **Cross-region copy failures**: Ensure the KMS key is shared and compatible with the target region.
    
* **Connectivity problems**: Check security groups, route tables, and NACLs in the target VPC.
    
* **Permission errors**: Confirm IAM roles have sufficient permissions for RDS and KMS operations.
    

## Conclusion

Migrating an RDS DB instance to a VPC in a different AWS account requires careful coordination between accounts, including snapshot sharing, cross-region copying (if needed), and proper configuration of the target environment. By following this guide, you can execute a secure and efficient migration while maintaining data consistency and minimizing application downtime.