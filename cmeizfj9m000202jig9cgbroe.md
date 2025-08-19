---
title: "5 Common Terraform Mistakes and How to Avoid Them"
seoDescription: "5 Common Terraform Mistakes and How to Avoid Them"
datePublished: Tue Aug 19 2025 20:14:25 GMT+0000 (Coordinated Universal Time)
cuid: cmeizfj9m000202jig9cgbroe
slug: 5-common-terraform-mistakes-and-how-to-avoid-them
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1755634307308/86c77da9-2c2d-47a8-a3e3-6d84fef3e90d.png
tags: terraform

---

Terraform has become one of the most popular Infrastructure as Code (IaC) tools, empowering teams to define, manage, and scale infrastructure consistently across cloud providers. However, as with any powerful tools, small missteps can lead to major headaches from broken deployments to security risks and costly infrastructure sprawl.

In this article, l’ll explore **five common Terraform mistakes** practitioners make and provide actionable tips to avoid them. Whether you’re new to Terraform or already managing production workloads, these lessons will help you improve reliability, scalability, and maintainability.

## Ignoring State Management

**The Mistake:**  
Many beginners use Terraform with the default local state file (`terraform.tfstate`). This works fine for experiments, but in collaborative or production environments, it quickly becomes problematic:

* Team members overwrite each other’s changes.
    
* State files may get corrupted or lost.
    
* Sensitive data (like passwords, private keys, or secrets) may be exposed in plain text.
    

**Why it Matters:**  
Terraform’s state file is the **source of truth** for your infrastructure. If it’s lost or mismanaged, Terraform may recreate resources unnecessarily, delete existing ones, or fail to detect drift (manual changes in the cloud console).

**How to Avoid It:**

* Use a **remote backend** such as **Terraform Cloud**, **AWS S3 with DynamoDB lock**, **GCS**, or **Azure Storage** for state management.
    
* Enable **state locking** to prevent concurrent runs from corrupting the state.
    
* Secure the state file by encrypting it at rest (e.g., S3 bucket encryption, KMS) and restricting access.
    
* Never commit `.tfstate` files or `.terraform` directories to version control. Add them to `.gitignore`.
    

## Hardcoding Values Instead of Using Variables

**The Mistake:**  
It’s tempting to hardcode values like region names, AMI IDs, or instance types directly in Terraform configurations for quick deployment. For example:

```bash
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  region        = "us-east-1"
}
```

**Why it Matters:**  
Hardcoding reduces reusability and makes it difficult to scale or adapt across environments (dev, staging, production). Changing values means modifying code in multiple places, introducing risk of mistakes and inconsistencies.

**How to Avoid It:**

* Define **input variables** in [`variables.tf`](http://variables.tf) and provide values through `terraform.tfvars` or environment variables.
    
* Use **locals** for computed values or repeated strings.
    
* Store environment-specific values in separate `.tfvars` files:
    

```bash
# variables.tf
variable "region" {}
variable "instance_type" {}

# terraform.tfvars (dev)
region        = "us-east-1"
instance_type = "t3.micro"
```

* Use Terraform **workspaces** or automation pipelines to handle multiple environments cleanly.
    

## Not Using Modules Properly

**The Mistake:**  
Copy-pasting resource blocks across projects instead of modularizing them. For example, duplicating the same VPC or EC2 setup for dev, staging, and prod environments.

**Why it Matters:**  
This approach leads to **repetition, drift, and maintenance nightmares**. Any bug fix or configuration update requires editing multiple files, increasing the risk of inconsistencies across environments.

**How to Avoid It:**

* Break down your infrastructure into **reusable modules** (e.g., VPC, EC2, RDS, IAM roles).
    
* Use Terraform **Registry modules** (like the official AWS VPC module) when appropriate.
    
* Organize modules in a folder structure, for example:
    

```bash
project/
├── modules/
│   ├── vpc/
│   ├── ec2/
│   └── rds/
├── dev/
│   └── main.tf
├── staging/
│   └── main.tf
└── prod/
    └── main.tf
```

* Version your modules and pin dependencies to avoid unexpected changes.
    

## Running `terraform apply` Without a Plan

**The Mistake:**  
Executing `terraform apply` blindly without reviewing the proposed changes. Some engineers skip `terraform plan` entirely, trusting Terraform to “just work.”

**Why it Matters:**  
This can be catastrophic. Terraform may:

* Delete resources unintentionally.
    
* Recreate resources (causing downtime).
    
* Introduce costly infrastructure (e.g., a large EC2 instance or RDS cluster).
    

**How to Avoid It:**

* Always run `terraform plan` before applying changes.
    
* Integrate `terraform plan` into your CI/CD pipeline to preview changes before approval.
    
* Use `terraform apply -auto-approve` **only** in automated pipelines with proper change validation.
    
* Adopt a **review + approval workflow**: generate a plan, commit it to version control, and have peers review it before applying.
    

## Ignoring Resource Dependencies and Drift

**The Mistake:**  
Manually creating or modifying resources in the cloud console outside Terraform, or not explicitly defining dependencies between resources in Terraform code.

For example:

* Updating a security group rule in the AWS console instead of in Terraform.
    
* Not setting `depends_on` when a resource must be created before another.
    

**Why it Matters:**  
Terraform loses track of changes done manually, leading to **drift**. On the next run, it may overwrite those changes or fail to reconcile resources. Dependency issues can also cause errors during provisioning.

**How to Avoid It:**

* Treat Terraform as the **single source of truth** for all infrastructure. Avoid manual changes in the console.
    
* Run `terraform plan` regularly to detect drift.
    
* Use `terraform import` to bring manually created resources under Terraform management.
    
* Define explicit dependencies using `depends_on` where necessary, though Terraform often infers them from resource references.
    

Example:

```bash
resource "aws_instance" "app" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.private.id
  depends_on    = [aws_internet_gateway.gw]
}
```

## Final Thoughts

Terraform is incredibly powerful, but small mistakes can snowball into significant issues if not handled properly. By:

* Managing state securely,
    
* Using variables instead of hardcoding,
    
* Leveraging modules,
    
* Reviewing plans before applying, and
    
* Avoiding drift and dependency errors,
    

…you’ll create a more reliable, scalable, and maintainable infrastructure setup.

Treat your Terraform configurations with the same discipline as application code: version control, peer reviews, CI/CD pipelines, and security best practices. Doing so will help you unlock the full potential of Infrastructure as Code without falling into common pitfalls.